<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\ConsultationAttachment;
use App\Models\ConsultationExpert;
use App\Models\ConsultationReminder;
use App\Models\ConsultationService;
use App\Models\ExpertAvailableDate;
use App\Models\ExpertAvailability;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConsultationController extends Controller
{
    public function catalog()
    {
        $services = ConsultationService::where('is_active', true)
            ->orderBy('id')
            ->get();

        $experts = ConsultationExpert::where('is_active', true)
            ->with(['availabilities' => function ($query) {
                $query->where('is_active', true)->orderBy('day_of_week');
            }])
            ->orderBy('id')
            ->get();

        return response()->json([
            'services' => $services,
            'experts' => $experts,
            'consultation_modes' => ['Video Call', 'In Person'],
            // Only expose eSewa and cash-in-person for consultations
            'payment_methods' => ['eSewa', 'Cash In Person'],
        ]);
    }

    public function availableSlots(Request $request)
    {
        $validated = $request->validate([
            'expert_id' => 'required|exists:consultation_experts,id',
            'date' => 'required|date|after_or_equal:today',
            'duration_minutes' => 'nullable|integer|min:15|max:180',
        ]);

        $targetDate = Carbon::parse($validated['date']);
        $dayOfWeek = (int) $targetDate->dayOfWeekIso;
        $duration = (int) ($validated['duration_minutes'] ?? 30);

        // First, check if there are any specific date availabilities for this expert/date
        $specific = \App\Models\ExpertAvailableDate::where('expert_id', $validated['expert_id'])
            ->where('date', $validated['date'])
            ->where('is_active', true)
            ->get();

        if ($specific->isNotEmpty()) {
            $availabilityRows = $specific;
            // Note: specific records use start_time/end_time so code below still works
        } else {
            $availabilityRows = ExpertAvailability::where('expert_id', $validated['expert_id'])
                ->where('day_of_week', $dayOfWeek)
                ->where('is_active', true)
                ->get();
        }

        if ($availabilityRows->isEmpty()) {
            return response()->json(['slots' => []]);
        }

        $bookedTimes = Consultation::where('expert_id', $validated['expert_id'])
            ->whereDate('appointment_date', $validated['date'])
            ->whereIn('status', ['Pending', 'Confirmed', 'Rescheduled'])
            ->pluck('appointment_time')
            ->all();

        $slotTimes = [];
        foreach ($availabilityRows as $availability) {
            $current = $this->parseAvailabilityTime($availability->start_time);
            $end = $this->parseAvailabilityTime($availability->end_time);

            while ($current->lt($end)) {
                $timeValue = $current->format('H:i');
                if (!in_array($timeValue, $bookedTimes, true)) {
                    $slotTimes[] = $timeValue;
                }
                $current->addMinutes($duration);
            }
        }

        sort($slotTimes);

        return response()->json([
            'slots' => array_values(array_unique($slotTimes)),
        ]);
    }

    public function availableDates(Request $request)
    {
        $validated = $request->validate([
            'expert_id' => 'required|exists:consultation_experts,id',
            'days_ahead' => 'nullable|integer|min:1|max:90',
        ]);

        $daysAhead = (int) ($validated['days_ahead'] ?? 30);
        $expertId = $validated['expert_id'];
        
        $availableDates = [];
        $today = Carbon::now()->startOfDay();

        // Preload specific availabilities for the range
        $rangeEnd = $today->copy()->addDays($daysAhead - 1)->toDateString();
        $specificDates = \App\Models\ExpertAvailableDate::where('expert_id', $expertId)
            ->whereBetween('date', [$today->toDateString(), $rangeEnd])
            ->where('is_active', true)
            ->get()
            ->groupBy(fn($row) => $row->date->toDateString());

        for ($i = 0; $i < $daysAhead; $i++) {
            $currentDate = $today->copy()->addDays($i);
            $dayOfWeek = (int) $currentDate->dayOfWeekIso;
            $dateStr = $currentDate->format('Y-m-d');

            // If there are specific date availabilities for this date, use them
            if (isset($specificDates[$dateStr]) && $specificDates[$dateStr]->isNotEmpty()) {
                $availabilityRows = $specificDates[$dateStr];
            } else {
                $availabilityRows = ExpertAvailability::where('expert_id', $expertId)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('is_active', true)
                    ->get();
            }

            if ($availabilityRows->isEmpty()) {
                continue;
            }

            $bookedCount = Consultation::where('expert_id', $expertId)
                ->whereDate('appointment_date', $currentDate)
                ->whereIn('status', ['Pending', 'Confirmed', 'Rescheduled'])
                ->count();

            $totalSlots = 0;
            foreach ($availabilityRows as $availability) {
                $current = $this->parseAvailabilityTime($availability->start_time);
                $end = $this->parseAvailabilityTime($availability->end_time);
                $duration = 30; // Default 30 min slots

                while ($current->lt($end)) {
                    $totalSlots++;
                    $current->addMinutes($duration);
                }
            }

            if ($bookedCount < $totalSlots) {
                $availableDates[] = $dateStr;
            }
        }
        
        return response()->json([
            'available_dates' => $availableDates,
        ]);
    }

    private function parseAvailabilityTime($value): Carbon
    {
        $timeValue = trim((string) $value);

        foreach (['H:i:s', 'H:i'] as $format) {
            try {
                return Carbon::createFromFormat($format, $timeValue);
            } catch (\Throwable $e) {
                // Try the next format.
            }
        }

        return Carbon::parse($timeValue);
    }

    public function book(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:consultation_services,id',
            'expert_id' => 'required|exists:consultation_experts,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'consultation_mode' => 'required|in:Video Call,In Person',
            'skin_type' => 'required|in:oily,dry,combination,sensitive',
            'skin_concerns' => 'required',
            'allergies_or_sensitivities' => 'nullable|string',
            'current_skincare_routine' => 'nullable|string',
            'age_range' => 'required|string|max:50',
            'payment_method' => 'required|in:eSewa,Cash In Person',
            'payment_reference' => 'nullable|string|max:255',
            // Allow Pending for cash-in-person or Paid for completed payments
            'payment_status' => 'required|in:Paid,Pending',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:8192',
        ]);

        $skinConcerns = $validated['skin_concerns'];
        if (is_string($skinConcerns)) {
            $decoded = json_decode($skinConcerns, true);
            $skinConcerns = is_array($decoded) ? $decoded : [$skinConcerns];
        }

        if (!is_array($skinConcerns) || empty($skinConcerns)) {
            return response()->json(['message' => 'Skin concerns are required.'], 422);
        }

        $existing = Consultation::where('expert_id', $validated['expert_id'])
            ->whereDate('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->whereIn('status', ['Pending', 'Confirmed', 'Rescheduled'])
            ->exists();

        if ($existing) {
            return response()->json([
                'message' => 'The selected time slot is already booked. Please choose another slot.',
            ], 409);
        }

        $authUser = $request->user();
        $userName = $authUser?->name ?? 'Guest';

        $consultation = DB::transaction(function () use ($validated, $skinConcerns, $request, $authUser, $userName) {
            $roomId = null;
            if ($validated['consultation_mode'] === 'Video Call') {
                $roomId = 'skincare-consult-' . Str::lower(Str::random(10));
            }

            $consultation = Consultation::create([
                'user_id' => $authUser?->id,
                'service_id' => $validated['service_id'],
                'expert_id' => $validated['expert_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'consultation_mode' => $validated['consultation_mode'],
                'room_id' => $roomId,
                'status' => 'Confirmed',
                'payment_status' => 'Paid',
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'],
                'skin_type' => $validated['skin_type'],
                'skin_concerns' => $skinConcerns,
                'allergies_or_sensitivities' => $validated['allergies_or_sensitivities'] ?? null,
                'current_skincare_routine' => $validated['current_skincare_routine'] ?? null,
                'age_range' => $validated['age_range'],
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = $file->store('consultations', 'public');
                    ConsultationAttachment::create([
                        'consultation_id' => $consultation->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            $appointmentAt = Carbon::parse($validated['appointment_date'] . ' ' . $validated['appointment_time']);
            $reminders = [
                '24h' => $appointmentAt->copy()->subHours(24),
                '1h' => $appointmentAt->copy()->subHour(),
                '10m' => $appointmentAt->copy()->subMinutes(10),
            ];

            foreach ($reminders as $type => $scheduleAt) {
                if ($scheduleAt->isFuture()) {
                    ConsultationReminder::create([
                        'consultation_id' => $consultation->id,
                        'reminder_type' => $type,
                        'scheduled_for' => $scheduleAt,
                        'delivery_channel' => 'in-app',
                    ]);
                }
            }

            return $consultation;
        });

        $consultation->load(['service', 'expert', 'attachments', 'reminders', 'user']);

        // Send appointment details email
        try {
            $appointmentLink = config('app.frontend_url', 'http://localhost:5173') . '/#consultations/' . $consultation->id;
            $clientEmail = $consultation->user?->email ?: $consultation->email;
            $expertEmail = $consultation->expert?->email;
            $joinUrl = $consultation->room_id
                ? $this->buildJoinUrlCandidates($consultation->room_id, $userName)[0] ?? null
                : null;

            $clientContent = "Dear {$userName},\n\n";
            $clientContent .= "Your consultation appointment has been successfully booked!\n\n";
            $clientContent .= "Appointment Details:\n";
            $clientContent .= "Service: {$consultation->service->name}\n";
            $clientContent .= "Expert: {$consultation->expert->name}\n";
            $clientContent .= "Date: {$consultation->appointment_date}\n";
            $clientContent .= "Time: {$consultation->appointment_time}\n";
            $clientContent .= "Mode: {$consultation->consultation_mode}\n";
            $clientContent .= "Payment Method: {$consultation->payment_method}\n\n";

            if ($joinUrl) {
                $clientContent .= "VChat Link: {$joinUrl}\n\n";
            }

            $clientContent .= "View your appointment: {$appointmentLink}\n\n";
            $clientContent .= "Thank you for choosing our service!\n";
            $clientContent .= "eComerce Team";

            if ($clientEmail) {
                Mail::raw($clientContent, function ($message) use ($consultation, $clientEmail) {
                    $message->to($clientEmail)
                        ->subject("Appointment Confirmed - {$consultation->service->name}");
                });
            }

            if ($expertEmail) {
                $expertContent = "Dear {$consultation->expert->name},\n\n";
                $expertContent .= "A new consultation has been booked.\n\n";
                $expertContent .= "Client Details:\n";
                $expertContent .= "Name: {$userName}\n";
                $expertContent .= "Email: {$clientEmail}\n";
                $expertContent .= "Service: {$consultation->service->name}\n";
                $expertContent .= "Date: {$consultation->appointment_date}\n";
                $expertContent .= "Time: {$consultation->appointment_time}\n";
                $expertContent .= "Mode: {$consultation->consultation_mode}\n";
                $expertContent .= "Payment Method: {$consultation->payment_method}\n";

                if (!empty($consultation->skin_type)) {
                    $expertContent .= "Skin Type: {$consultation->skin_type}\n";
                }
                if (!empty($consultation->skin_concerns)) {
                    $expertContent .= "Concerns: " . implode(', ', (array) $consultation->skin_concerns) . "\n";
                }
                if (!empty($consultation->allergies_or_sensitivities)) {
                    $expertContent .= "Allergies/Sensitivities: {$consultation->allergies_or_sensitivities}\n";
                }
                if (!empty($consultation->current_skincare_routine)) {
                    $expertContent .= "Current Routine: {$consultation->current_skincare_routine}\n";
                }
                if ($joinUrl) {
                    $expertContent .= "VChat Link: {$joinUrl}\n";
                }

                $expertContent .= "\nPlease review the appointment in the admin panel.\n";
                $expertContent .= "eComerce Team";

                Mail::raw($expertContent, function ($message) use ($consultation, $expertEmail) {
                    $message->to($expertEmail)
                        ->subject("New Consultation Booked - {$consultation->service->name}");
                });
            }
        } catch (\Exception $e) {
            \Log::warning("Failed to send appointment email: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Consultation appointment booked successfully.',
            'appointment' => $this->formatConsultation($consultation, $userName),
        ], 201);
    }

    public function userAppointments(Request $request)
    {
        $authUser = $request->user();

        $query = Consultation::with(['service', 'expert', 'attachments', 'reminders', 'user'])
            ->latest();

        if ($authUser) {
            $query->where('user_id', $authUser->id);
        } else {
            return response()->json(['appointments' => []]);
        }

        $appointments = $query->get()->map(function ($consultation) {
            return $this->formatConsultation($consultation, $consultation->user?->name ?? 'Guest');
        });

        return response()->json(['appointments' => $appointments]);
    }

    public function userReport(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'format' => 'nullable|string|in:csv,json,pdf',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $format = $validated['format'] ?? 'csv';

        $query = Consultation::with(['service', 'expert', 'attachments', 'reminders'])
            ->where('user_id', $authUser->id)
            ->latest();

        if (!empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $appointments = $query->get()->map(function ($consultation) use ($authUser) {
            return $this->formatConsultation($consultation, $authUser->name ?? 'Guest');
        })->values();

        $timestamp = now()->format('Ymd_His');
        $fileName = "consultations_user_{$authUser->id}_{$timestamp}.{$format}";

        if ($format === 'json') {
            return response()->json([
                'generated_at' => now()->toDateTimeString(),
                'count' => $appointments->count(),
                'appointments' => $appointments,
            ])->withHeaders([
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);
        }

        if ($format === 'pdf') {
            // Prefer server-side PDF generation if the PDF library is installed.
            if (class_exists('\\Barryvdh\\DomPDF\\Facade\\Pdf') || class_exists('PDF')) {
                try {
                    $data = ['appointments' => $appointments, 'user' => $authUser];
                    $pdf = \PDF::loadView('consultations.user_report', $data)->setPaper('a4', 'portrait');
                    return $pdf->download($fileName);
                } catch (\Exception $e) {
                    \Log::error('PDF generation failed: ' . $e->getMessage());
                    return response()->json(['message' => 'Failed to generate PDF.'], 500);
                }
            }

            return response()->json([
                'message' => 'Server-side PDF generation is not available. Install barryvdh/laravel-dompdf and configure the PDF facade to enable this feature.'
            ], 501);
        }

        // Default: CSV
        ob_start();
        $handle = fopen('php://output', 'w');

        fputcsv($handle, [
            'ID', 'Service', 'Expert', 'Appointment Date', 'Appointment Time', 'Mode', 'Status', 'Payment Status', 'Payment Method', 'Created At'
        ]);

        foreach ($appointments as $appointment) {
            fputcsv($handle, [
                $appointment['id'],
                $appointment['service']?->name ?? '',
                $appointment['expert']?->name ?? '',
                $appointment['appointment_date'] ?? '',
                $appointment['appointment_time'] ?? '',
                $appointment['consultation_mode'] ?? '',
                $appointment['status'] ?? '',
                $appointment['payment_status'] ?? '',
                $appointment['payment_method'] ?? '',
                $appointment['created_at'] ?? '',
            ]);
        }

        fclose($handle);
        $csvContent = ob_get_clean();

        return response()->streamDownload(function () use ($csvContent) {
            echo $csvContent;
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function adminAppointments(Request $request)
    {
        $status = $request->query('status');

        $query = Consultation::with(['service', 'expert', 'attachments', 'reminders', 'user'])
            ->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $appointments = $query->get()->map(function ($consultation) {
            return $this->formatConsultation($consultation, $consultation->user?->name ?? 'Guest');
        });

        return response()->json(['appointments' => $appointments]);
    }

    public function adminReport(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:All,Pending,Confirmed,Rescheduled,Completed,Cancelled',
            'format' => 'nullable|string|in:csv,json',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $status = $validated['status'] ?? 'All';
        $format = $validated['format'] ?? 'csv';

        $query = Consultation::with(['service', 'expert', 'user'])->latest();

        if ($status !== 'All') {
            $query->where('status', $status);
        }

        if (!empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $appointments = $query->get()->map(function ($consultation) {
            return [
                'id' => $consultation->id,
                'user_name' => $consultation->user?->name ?? 'Guest',
                'user_email' => $consultation->user?->email ?? '',
                'service' => $consultation->service?->name ?? '',
                'expert' => $consultation->expert?->name ?? '',
                'appointment_date' => optional($consultation->appointment_date)->toDateString(),
                'appointment_time' => $consultation->appointment_time,
                'consultation_mode' => $consultation->consultation_mode,
                'status' => $consultation->status,
                'payment_status' => $consultation->payment_status,
                'payment_method' => $consultation->payment_method,
                'created_at' => optional($consultation->created_at)->toDateTimeString(),
            ];
        })->values();

        $timestamp = now()->format('Ymd_His');
        $statusSlug = strtolower($status);

        if ($format === 'json') {
            $fileName = "consultations_report_{$statusSlug}_{$timestamp}.json";

            return response()->json([
                'generated_at' => now()->toDateTimeString(),
                'filters' => [
                    'status' => $status,
                    'from' => $validated['from'] ?? null,
                    'to' => $validated['to'] ?? null,
                ],
                'count' => $appointments->count(),
                'appointments' => $appointments,
            ])->withHeaders([
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);
        }

        $fileName = "consultations_report_{$statusSlug}_{$timestamp}.csv";

        // Build CSV content into a string so we can optionally email it
        ob_start();
        $handle = fopen('php://output', 'w');

        fputcsv($handle, [
            'ID',
            'User Name',
            'User Email',
            'Service',
            'Expert',
            'Appointment Date',
            'Appointment Time',
            'Mode',
            'Status',
            'Payment Status',
            'Payment Method',
            'Created At',
        ]);

        foreach ($appointments as $appointment) {
            fputcsv($handle, [
                $appointment['id'],
                $appointment['user_name'],
                $appointment['user_email'],
                $appointment['service'],
                $appointment['expert'],
                $appointment['appointment_date'],
                $appointment['appointment_time'],
                $appointment['consultation_mode'],
                $appointment['status'],
                $appointment['payment_status'],
                $appointment['payment_method'],
                $appointment['created_at'],
            ]);
        }

        fclose($handle);
        $csvContent = ob_get_clean();

        // If an email is provided, send CSV as attachment
        if ($request->filled('email')) {
            try {
                $recipient = $request->input('email');
                Mail::raw('Please find attached the consultations export you requested.', function ($message) use ($recipient, $csvContent, $fileName) {
                    $message->to($recipient)
                        ->subject('Consultations Export')
                        ->attachData($csvContent, $fileName, ['mime' => 'text/csv']);
                });
            } catch (\Exception $e) {
                // Log but do not fail the export
                \Log::error('Failed to email consultations export: ' . $e->getMessage());
            }
        }

        // Stream the CSV to the requester
        return response()->streamDownload(function () use ($csvContent) {
            echo $csvContent;
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function cancel(Request $request, Consultation $consultation)
    {
        if (!in_array($consultation->status, ['Pending', 'Confirmed', 'Rescheduled'], true)) {
            return response()->json(['message' => 'Only upcoming consultations can be cancelled.'], 422);
        }

        $consultation->update(['status' => 'Cancelled']);

        return response()->json(['message' => 'Consultation cancelled successfully.']);
    }

    public function reschedule(Request $request, Consultation $consultation)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
        ]);

        $existing = Consultation::where('expert_id', $consultation->expert_id)
            ->whereDate('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('id', '!=', $consultation->id)
            ->whereIn('status', ['Pending', 'Confirmed', 'Rescheduled'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'The selected slot is already booked.'], 409);
        }

        $consultation->update([
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'status' => 'Rescheduled',
        ]);

        return response()->json(['message' => 'Consultation rescheduled successfully.']);
    }

    public function addNotes(Request $request, Consultation $consultation)
    {
        $validated = $request->validate([
            'consultation_notes' => 'required|string',
        ]);

        $consultation->update([
            'consultation_notes' => $validated['consultation_notes'],
        ]);

        return response()->json(['message' => 'Consultation notes saved successfully.']);
    }

    public function complete(Request $request, Consultation $consultation)
    {
        $consultation->update(['status' => 'Completed']);

        return response()->json(['message' => 'Consultation marked as completed.']);
    }

    public function adminAssignSlot(Request $request, Consultation $consultation)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
        ]);

        if (in_array($consultation->status, ['Completed', 'Cancelled'], true)) {
            return response()->json([
                'message' => 'Cannot assign slot for completed or cancelled consultation.',
            ], 422);
        }

        $conflict = Consultation::where('expert_id', $consultation->expert_id)
            ->whereDate('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('id', '!=', $consultation->id)
            ->whereIn('status', ['Pending', 'Confirmed', 'Rescheduled'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'This slot is already assigned to another consultation.',
            ], 409);
        }

        $consultation->update([
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'status' => 'Rescheduled',
        ]);

        return response()->json([
            'message' => 'Date and slot assigned successfully.',
            'appointment' => $this->formatConsultation($consultation->fresh(['service', 'expert', 'attachments', 'reminders', 'user']), $consultation->user?->name ?? 'Guest'),
        ]);
    }

    public function sendDueReminders()
    {
        $dueReminders = ConsultationReminder::with(['consultation.user', 'consultation.expert'])
            ->whereNull('sent_at')
            ->where('scheduled_for', '<=', now())
            ->get();

        foreach ($dueReminders as $reminder) {
            // Placeholder for Email/SMS/In-app channels.
            // Marking as sent enables an idempotent reminder scheduler.
            $reminder->update(['sent_at' => now()]);
        }

        return response()->json([
            'message' => 'Due reminders processed.',
            'processed' => $dueReminders->count(),
        ]);
    }

    // ─── Admin: Services CRUD ──────────────────────────────────────────────────

    public function adminListServices()
    {
        $services = ConsultationService::orderBy('id')->get();
        return response()->json(['services' => $services]);
    }

    public function adminStoreService(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:15',
            'is_active'        => 'nullable|boolean',
        ]);
        $service = ConsultationService::create($validated);
        return response()->json(['message' => 'Service created.', 'service' => $service], 201);
    }

    public function adminUpdateService(Request $request, $id)
    {
        $service = ConsultationService::findOrFail($id);
        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'price'            => 'sometimes|required|numeric|min:0',
            'duration_minutes' => 'sometimes|required|integer|min:15',
            'is_active'        => 'nullable|boolean',
        ]);
        $service->update($validated);
        return response()->json(['message' => 'Service updated.', 'service' => $service]);
    }

    public function adminDeleteService($id)
    {
        $service = ConsultationService::findOrFail($id);
        $service->delete();
        return response()->json(['message' => 'Service deleted.']);
    }

    // ─── Admin: Experts CRUD ───────────────────────────────────────────────────

    public function adminListExperts()
    {
        $experts = ConsultationExpert::with('availabilities')->orderBy('id')->get();
        return response()->json(['experts' => $experts]);
    }

    public function adminStoreExpert(Request $request)
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'email'                => 'nullable|email|max:255',
            'specialization'       => 'nullable|string|max:255',
            'bio'                  => 'nullable|string',
            'years_of_experience'  => 'nullable|integer|min:0',
            'profile_picture'      => 'nullable|string|max:500',
            'is_active'            => 'nullable|boolean',
        ]);
        $expert = ConsultationExpert::create($validated);
        return response()->json(['message' => 'Expert created.', 'expert' => $expert], 201);
    }

    public function adminUpdateExpert(Request $request, $id)
    {
        $expert = ConsultationExpert::findOrFail($id);
        $validated = $request->validate([
            'name'                 => 'sometimes|required|string|max:255',
            'email'                => 'nullable|email|max:255',
            'specialization'       => 'nullable|string|max:255',
            'bio'                  => 'nullable|string',
            'years_of_experience'  => 'nullable|integer|min:0',
            'profile_picture'      => 'nullable|string|max:500',
            'is_active'            => 'nullable|boolean',
        ]);
        $expert->update($validated);
        return response()->json(['message' => 'Expert updated.', 'expert' => $expert]);
    }

    public function adminDeleteExpert($id)
    {
        $expert = ConsultationExpert::findOrFail($id);
        $expert->delete();
        return response()->json(['message' => 'Expert deleted.']);
    }

    public function adminListExpertDates($expertId)
    {
        $expert = ConsultationExpert::findOrFail($expertId);
        $dates = ExpertAvailableDate::where('expert_id', $expert->id)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'expert' => $expert,
            'expert_dates' => $dates,
        ]);
    }

    public function adminStoreExpertDate(Request $request, $expertId)
    {
        $expert = ConsultationExpert::findOrFail($expertId);
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'nullable|boolean',
        ]);

        $date = ExpertAvailableDate::create([
            'expert_id' => $expert->id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Expert date created.',
            'expert_date' => $date,
        ], 201);
    }

    public function adminUpdateExpertDate(Request $request, $expertId, $dateId)
    {
        $expert = ConsultationExpert::findOrFail($expertId);
        $date = ExpertAvailableDate::where('expert_id', $expert->id)->where('id', $dateId)->firstOrFail();

        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'nullable|boolean',
        ]);

        $date->update([
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Expert date updated.',
            'expert_date' => $date,
        ]);
    }

    public function adminDeleteExpertDate($expertId, $dateId)
    {
        $expert = ConsultationExpert::findOrFail($expertId);
        $date = ExpertAvailableDate::where('expert_id', $expert->id)->where('id', $dateId)->firstOrFail();
        $date->delete();

        return response()->json(['message' => 'Expert date deleted.']);
    }

    private function formatConsultation(Consultation $consultation, string $participantName): array
    {
        $joinUrlCandidates = $this->buildJoinUrlCandidates($consultation->room_id, $participantName);
        $joinUrl = $joinUrlCandidates[0] ?? null;

        return [
            'id' => $consultation->id,
            'user_id' => $consultation->user_id,
            'user' => $consultation->user ? [
                'id' => $consultation->user->id,
                'name' => $consultation->user->name,
                'email' => $consultation->user->email,
            ] : null,
            'service' => $consultation->service,
            'expert' => $consultation->expert,
            'appointment_date' => optional($consultation->appointment_date)->toDateString(),
            'appointment_time' => $consultation->appointment_time,
            'consultation_mode' => $consultation->consultation_mode,
            'room_id' => $consultation->room_id,
            'join_url' => $joinUrl,
            'join_url_candidates' => $joinUrlCandidates,
            'status' => $consultation->status,
            'payment_status' => $consultation->payment_status,
            'payment_method' => $consultation->payment_method,
            'payment_reference' => $consultation->payment_reference,
            'skin_type' => $consultation->skin_type,
            'skin_concerns' => $consultation->skin_concerns,
            'allergies_or_sensitivities' => $consultation->allergies_or_sensitivities,
            'current_skincare_routine' => $consultation->current_skincare_routine,
            'age_range' => $consultation->age_range,
            'consultation_notes' => $consultation->consultation_notes,
            'attachments' => $consultation->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'file_name' => $attachment->file_name,
                    'file_type' => $attachment->file_type,
                    'file_size' => $attachment->file_size,
                    'url' => asset('storage/' . $attachment->file_path),
                ];
            })->values(),
            'reminders' => $consultation->reminders->map(function ($reminder) {
                return [
                    'type' => $reminder->reminder_type,
                    'scheduled_for' => optional($reminder->scheduled_for)->toDateTimeString(),
                    'sent_at' => optional($reminder->sent_at)->toDateTimeString(),
                    'delivery_channel' => $reminder->delivery_channel,
                ];
            })->values(),
            'created_at' => optional($consultation->created_at)->toDateTimeString(),
        ];
    }

    private function buildJoinUrlCandidates(?string $roomId, string $participantName): array
    {
        if (!$roomId) {
            return [];
        }

        $fallbackBase = rtrim(config('app.video_call_url', env('VIDEO_CALL_URL', 'http://localhost:8002')), '/');
        $configuredBases = collect(explode(',', (string) env('VIDEO_CALL_URLS', '')))
            ->map(fn ($value) => trim($value))
            ->filter();

        $portList = collect(explode(',', (string) env('VIDEO_CALL_PORTS', '8002,8003,8004')))
            ->map(fn ($value) => trim($value))
            ->filter(fn ($value) => preg_match('/^\d+$/', $value));

        $derivedBases = collect();
        foreach ($portList as $port) {
            $derivedBases->push(sprintf('http://localhost:%s', $port));
            $derivedBases->push(sprintf('http://127.0.0.1:%s', $port));
        }

        $bases = collect([$fallbackBase])
            ->merge($configuredBases)
            ->merge($derivedBases)
            ->map(fn ($base) => rtrim((string) $base, '/'))
            ->filter()
            ->unique()
            ->values();

        return $bases->map(function ($base) use ($roomId, $participantName) {
            return sprintf(
                '%s/video-call/%s?name=%s',
                $base,
                $roomId,
                urlencode($participantName)
            );
        })->all();
    }
}

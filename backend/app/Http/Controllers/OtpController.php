<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $validated['email'];
        $otp = Otp::generate($email);

        try {
            Mail::raw(
                "Your OTP code is: {$otp->otp_code}\n\nThis code will expire in 10 minutes.",
                function ($message) use ($email) {
                    $message->to($email)
                        ->subject('Your OTP Code for eComerce');
                }
            );

            return response()->json([
                'message' => 'OTP sent to your email.',
                'email' => $email,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send OTP. ' . $e->getMessage(),
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'otp_code' => ['required', 'string', 'size:6'],
        ]);

        $otp = Otp::verify($validated['email'], $validated['otp_code']);

        if (!$otp) {
            return response()->json([
                'message' => 'Invalid or expired OTP.',
            ], 401);
        }

        // Find or create user
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => Str::before($validated['email'], '@'),
                'email' => $validated['email'],
                'password' => bcrypt(Str::random(32)),
                'role' => 'user',
                'email_verified_at' => now(),
            ]);
        }

        // Delete used OTP
        $otp->delete();

        // Login user
        Auth::login($user);

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
        ], 200);
    }
}

<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultations Report</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; }
    h1 { font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f7f7f7; }
    .meta { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Consultations Report for {{ $user->name ?? 'User' }}</h1>
  <div class="meta">Generated at: {{ now()->toDateTimeString() }}</div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Service</th>
        <th>Expert</th>
        <th>Date</th>
        <th>Time</th>
        <th>Mode</th>
        <th>Status</th>
        <th>Payment</th>
      </tr>
    </thead>
    <tbody>
      @foreach($appointments as $a)
        <tr>
          <td>{{ $a['id'] }}</td>
          <td>{{ $a['service']['name'] ?? '' }}</td>
          <td>{{ $a['expert']['name'] ?? '' }}</td>
          <td>{{ $a['appointment_date'] ?? '' }}</td>
          <td>{{ $a['appointment_time'] ?? '' }}</td>
          <td>{{ $a['consultation_mode'] ?? '' }}</td>
          <td>{{ $a['status'] ?? '' }}</td>
          <td>{{ $a['payment_status'] ?? '' }} / {{ $a['payment_method'] ?? '' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
# OTP Authentication & Email Setup Guide

This guide explains how to set up OTP (One-Time Password) authentication and email delivery for the eComerce application.

## Overview

Instead of traditional Google OAuth, this application uses email-based OTP authentication with the following features:
- Send OTP codes to user email (valid for 10 minutes)
- Send appointment details and links via email after booking
- Automated appointment reminders via email

## Setup Steps

### Step 1: Get Gmail App Password

To use Gmail for sending emails, you need to generate an app-specific password:

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Follow the prompts to enable it

2. **Generate App Password**:
   - Go to [App passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password

### Step 2: Update Environment Variables

Edit `backend/.env` and update the mail configuration:

```env
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=imonicaadh@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM_ADDRESS="imonicaadh@gmail.com"
MAIL_FROM_NAME="eComerce Support"

# OTP Configuration
OTP_LENGTH=6
OTP_VALIDITY_MINUTES=10
```

Replace `your-16-char-app-password` with the password generated in Step 1.

### Step 3: Run Database Migrations

```bash
php artisan migrate
```

This will create the `otps` table for storing OTP codes.

### Step 4: Test Email Configuration

You can test if emails are working by running:

```bash
php artisan tinker
Mail::raw('Test email', function($message) { 
    $message->to('your-email@example.com')->subject('Test'); 
})->send();
```

## Frontend Integration

The OTP login page is available at `frontend/src/pages/login-otp.jsx`.

To integrate it into your routing:

```jsx
import LoginOTP from './pages/login-otp';

// In your router/App.jsx
<Route path="/#login-otp" element={<LoginOTP />} />
```

## API Endpoints

### Send OTP
```
POST /api/auth/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent to your email.",
  "email": "user@example.com"
}
```

### Verify OTP
```
POST /api/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp_code": "123456"
}

Response:
{
  "message": "Login successful.",
  "user": { ... }
}
```

## Email Templates

### OTP Email
Sent when user requests OTP for login.

Subject: `Your OTP Code for eComerce`

Body:
```
Your OTP code is: 123456

This code will expire in 10 minutes.
```

### Appointment Confirmation Email
Sent when user successfully books a consultation.

Subject: `Appointment Confirmed - [Service Name]`

Body includes:
- Service name
- Expert name
- Appointment date and time
- Consultation mode (Video Call / In Person)
- Payment method
- Video call room ID (if applicable)
- Link to view appointment

## Troubleshooting

### "Failed to send OTP" Error
1. Check that `MAIL_USERNAME` and `MAIL_PASSWORD` are correct
2. Verify 2-Factor Authentication is enabled on your Gmail account
3. Ensure the app password (not regular password) is used
4. Check that `MAIL_HOST=smtp.gmail.com` and `MAIL_PORT=587`

### "Invalid or expired OTP" Error
- OTP codes expire after 10 minutes (configurable via `OTP_VALIDITY_MINUTES`)
- Each new OTP request invalidates previous OTPs for that email
- Ensure user enters exactly 6 digits

### Emails Not Arriving
1. Check the `storage/logs/laravel.log` for errors
2. Verify SMTP credentials are correct
3. Check spam/junk folder
4. Enable "Less secure apps" if using regular Gmail password (not recommended)

### Database Error on First Run
Make sure to run migrations: `php artisan migrate`

## OTP Code Format

- Length: 6 digits
- Validity: 10 minutes (configurable)
- Format: Random digits from 0-9
- Storage: Encrypted in database via Laravel

## Security Notes

⚠️ **Important Security Reminders:**

1. Never commit your app password to version control
2. Use environment variables for all sensitive credentials
3. OTP codes are not encrypted at rest (consider adding encryption in production)
4. Implement rate limiting on OTP endpoints to prevent brute force
5. Consider adding CAPTCHA to prevent abuse

Example rate limiting middleware (to be added):
```php
// In routes/api.php
Route::post('/auth/otp/send', [OtpController::class, 'sendOtp'])->middleware('throttle:5,1'); // 5 requests per minute
```

## Production Deployment

For production, consider:
1. Using a dedicated email service (SendGrid, Mailgun, AWS SES)
2. Adding encryption to OTP codes in database
3. Implementing rate limiting and CAPTCHA
4. Using environment-specific configurations
5. Adding audit logging for authentication attempts
6. Implementing custom email templates with HTML
7. Adding support for SMS-based OTP as fallback

## Configuration

Edit `config/auth.php` to customize OTP behavior:

```php
'otp_validity_minutes' => env('OTP_VALIDITY_MINUTES', 10),
'otp_length' => env('OTP_LENGTH', 6),
```

## Support

For issues or questions, contact the development team or check the logs:
```bash
tail -f storage/logs/laravel.log
```

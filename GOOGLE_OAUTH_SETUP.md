# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the eComerce application.

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click the project dropdown at the top
   - Click "NEW PROJECT"
   - Enter a project name (e.g., "eComerce App")
   - Click "CREATE"

## 2. Enable Google+ API

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "ENABLE"

## 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: Select "External"
   - Click "CREATE"
   - Fill in the app name, user support email, and developer contact info
   - Continue to add scopes: `email`, `profile`, `openid`
   - Add test users (your email)
   - Complete the consent screen setup

4. Back to creating OAuth 2.0 credentials:
   - Application type: "Web application"
   - Name: "eComerce Local Dev"
   - Authorized JavaScript origins: Add `http://localhost:8000`
   - Authorized redirect URIs: Add `http://localhost:8000/api/auth/google/callback`
   - Click "CREATE"

5. You'll see your credentials with:
   - **Client ID** (looks like: `xxx.apps.googleusercontent.com`)
   - **Client Secret** (a long string)

## 4. Update Environment Variables

In `backend/.env`, update:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

Replace `your_client_id_here` and `your_client_secret_here` with the credentials from step 3.

## 5. Fix SSL Certificate Issue (if needed)

If you encounter "cURL error 60: SSL certificate problem", add this to `config/services.php`:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
    'verify' => false, // Only for development!
],
```

For production, use a proper CA bundle instead of disabling verification.

## 6. Test Google Login

1. Start the backend: `php artisan serve`
2. Open the frontend at `http://localhost:5173`
3. Click "Login with Google"
4. You'll be redirected to Google's login page
5. After login, you should be authenticated and redirected back to the app

## API Endpoints

- `GET /api/auth/google/redirect` - Redirects user to Google login
- `GET /api/auth/google/callback` - Handles Google callback (automatic redirect)

## Troubleshooting

### "Invalid Client" Error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that `GOOGLE_REDIRECT_URI` matches the authorized URI in Google Cloud Console

### SSL Certificate Error
- For Windows: Download certificate bundle from http://curl.haxx.se/ca/cacert.pem
- Add to `php.ini`: `curl.cainfo = "C:/path/to/cacert.pem"`
- Or use the config workaround above (development only)

### User Not Created
- Check database migrations have run: `php artisan migrate`
- Verify `users` table has `google_id` and `provider` columns

## For Production

When deploying to production:
1. Get new credentials for your production domain
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` via environment variables
3. Remove `'verify' => false` from `config/services.php` and use proper SSL certificates
4. Update `GOOGLE_REDIRECT_URI` to match your production domain

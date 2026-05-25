# API Configuration Guide - PERMANENT FIX

This document explains how to properly configure the API connections to prevent "Cannot connect to API server" errors.

## Problem
The error "Cannot connect to API server on known ports" occurs when:
- Frontend and Backend are not on the same port
- API URLs are incorrectly configured
- CORS settings are missing

## Solution: Correct Port Configuration

### Backend Ports
- **Backend API Server**: Port **8000** (Laravel)
- **Video Chat Server**: Port **8002** (Django)

### Frontend Ports
- **Frontend Dev Server**: Port **5173** (React Vite)

## Configuration Files to Check

### 1. Backend Configuration (`backend/.env`)
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
VIDEO_CALL_URL=http://localhost:8002
```

✅ **Current Status**: Correctly set to port 8000

### 2. Backend CORS (`backend/config/cors.php`)
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
'supports_credentials' => true,
```

✅ **Current Status**: Properly configured

### 3. Frontend API Configuration (`frontend/src/services/api.js`)
```javascript
const DEFAULT_API_BASE = "http://localhost:8000/api";
const DEFAULT_API_PORTS = ["8000", "8001"];
```

✅ **FIXED**: Changed default from port 8001 to 8000

## How to Start All Services

### Terminal 1: Backend API (Port 8000)
```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Terminal 2: Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

### Terminal 3: Django Video Chat (Port 8002)
```bash
cd Vchat-from-DJnago
python manage.py runserver 127.0.0.1:8002
```

## Expected Service Status

Open http://localhost:5173/admin#admin in browser - you should see:
- 🟢 **API: 8000** (green indicator)
- 🟢 **Video** (green indicator)

Both should be green when all services are running.

## If Error Still Occurs

### Step 1: Verify All Services Are Running
```powershell
# Terminal 1 - Check if Laravel is running
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Terminal 2 - Check if React Dev Server is running
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

# Terminal 3 - Check if Django is running
Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue
```

### Step 2: Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cache and cookies
- Refresh the page

### Step 3: Check Backend Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

### Step 4: Test API Directly
```powershell
curl http://localhost:8000/api/auth/csrf
```

Should return JSON with CSRF token.

## Port Conflict Resolution

If port is already in use:

### Change Backend Port
```bash
php artisan serve --host=127.0.0.1 --port=8001
```
Then update `frontend/src/services/api.js`:
```javascript
const DEFAULT_API_BASE = "http://localhost:8001/api";
```

### Find and Kill Process Using Port
```powershell
# Find process using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Kill the process
Stop-Process -Id <PID> -Force
```

## Environment-Specific Configuration

### For Development
- Use `localhost:8000` (easier for session cookies)
- Or use `127.0.0.1:8000` (must match frontend host)

### For Production
- Use proper domain (e.g., `api.example.com`)
- Use HTTPS (port 443)
- Configure CORS with production domain

## Troubleshooting Checklist

- [ ] Backend running on port 8000?
- [ ] Frontend running on port 5173?
- [ ] `api.js` has correct `DEFAULT_API_BASE`?
- [ ] `.env` has correct `APP_URL`?
- [ ] CORS config allows frontend origin?
- [ ] Browser cache cleared?
- [ ] No firewall blocking ports?
- [ ] All processes using same host (localhost vs 127.0.0.1)?

## Quick Reference

| Service | Port | Host | URL |
|---------|------|------|-----|
| Laravel Backend | 8000 | localhost | http://localhost:8000 |
| React Frontend | 5173 | localhost | http://localhost:5173 |
| Django Chat | 8002 | localhost | http://localhost:8002 |
| API Base | - | - | http://localhost:8000/api |

## Next Steps

1. **Hard Refresh**: Ctrl + Shift + R (clear cache)
2. **Verify Services**: Check all three terminals
3. **Test Admin Panel**: Visit http://localhost:5173/admin#admin
4. **Verify Indicators**: Both API and Video should be green

If problem persists after these steps, check the browser console (F12 → Console) for specific error messages.

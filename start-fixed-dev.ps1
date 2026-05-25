param(
    [string]$BindHost = "127.0.0.1",
    [int]$ApiPort = 8000,
    [int]$VideoPort = 8002,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$djangoPath = Join-Path $root "Vchat-from-DJnago"

$apiUrl = "http://localhost:$ApiPort/api"
$apiUrls = "http://localhost:$ApiPort/api"
$videoBase = "http://localhost:$VideoPort"
$videoUrlList = (
    "http://localhost:$VideoPort",
    "http://127.0.0.1:$VideoPort"
) -join ","
$videoPortList = $VideoPort.ToString()

function Set-OrAppendEnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )

    $lines = @()
    if (Test-Path $Path) {
        $lines = Get-Content -Path $Path
    }

    $updated = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^$Key=") {
            $lines[$i] = "$Key=$Value"
            $updated = $true
            break
        }
    }

    if (-not $updated) {
        $lines += "$Key=$Value"
    }

    Set-Content -Path $Path -Value $lines
}

$backendEnv = Join-Path $backendPath ".env"
Set-OrAppendEnvValue -Path $backendEnv -Key "APP_URL" -Value "http://localhost:$ApiPort"
Set-OrAppendEnvValue -Path $backendEnv -Key "FRONTEND_URL" -Value "http://localhost:$FrontendPort"
Set-OrAppendEnvValue -Path $backendEnv -Key "VIDEO_CALL_URL" -Value $videoBase
Set-OrAppendEnvValue -Path $backendEnv -Key "VIDEO_CALL_URLS" -Value $videoUrlList
Set-OrAppendEnvValue -Path $backendEnv -Key "VIDEO_CALL_PORTS" -Value $videoPortList

$frontendLocalEnv = Join-Path $frontendPath ".env.local"
$frontendEnvContent = @(
    "VITE_API_URL=/api",
    "VITE_API_URLS=/api",
    "VITE_VIDEO_CALL_URL=$videoBase",
    "VITE_VIDEO_PORTS=$videoPortList"
)
Set-Content -Path $frontendLocalEnv -Value $frontendEnvContent

$pythonExe = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

$phpCmd = "Set-Location '$backendPath'; php artisan optimize:clear; php artisan serve --host=$BindHost --port=$ApiPort"
$djangoCmd = "Set-Location '$djangoPath'; & '$pythonExe' manage.py runserver $BindHost`:$VideoPort"
$frontendCmd = "Set-Location '$frontendPath'; npm run dev -- --host localhost --port $FrontendPort"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $phpCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $djangoCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host "Started services with fixed ports:"
Write-Host "Laravel API:     http://localhost:$ApiPort"
Write-Host "Django Video:    http://localhost:$VideoPort"
Write-Host "Frontend:        http://localhost:$FrontendPort"
Write-Host "Frontend env:    $frontendLocalEnv"

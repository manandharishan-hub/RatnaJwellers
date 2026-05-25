param(
    [string]$BindHost = "127.0.0.1",
    [int[]]$ApiPorts = @(8000),
    [int[]]$VideoPorts = @(8002, 8003, 8004),
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

function Get-FreePort {
    param([int[]]$Candidates)

    foreach ($port in $Candidates) {
        $listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
        if (-not $listener) {
            return $port
        }
    }

    throw "No free port found from candidates: $($Candidates -join ', ')"
}

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

$root = $PSScriptRoot
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$djangoPath = Join-Path $root "Vchat-from-DJnago"

$apiPort = Get-FreePort -Candidates $ApiPorts
$videoPort = Get-FreePort -Candidates $VideoPorts

$apiUrl = "http://localhost:$apiPort/api"
$apiUrls = ($ApiPorts | ForEach-Object { "http://localhost:$($_)/api" }) -join ","
$videoBase = "http://localhost:$videoPort"
$videoUrlList = @(
    "http://localhost:$videoPort",
    "http://127.0.0.1:$videoPort"
) -join ","
$videoPortList = ($VideoPorts | ForEach-Object { $_.ToString() }) -join ","

$backendEnv = Join-Path $backendPath ".env"
Set-OrAppendEnvValue -Path $backendEnv -Key "APP_URL" -Value "http://localhost:$apiPort"
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

$phpCmd = "Set-Location '$backendPath'; php artisan optimize:clear; php artisan serve --host=$BindHost --port=$apiPort"
$djangoCmd = "Set-Location '$djangoPath'; & '$pythonExe' manage.py runserver $BindHost`:$videoPort"
$frontendCmd = "Set-Location '$frontendPath'; npm run dev -- --host localhost --port $FrontendPort"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $phpCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $djangoCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host "Started services with dynamic ports:"
Write-Host "Laravel API:     http://localhost:$apiPort"
Write-Host "Django Video:    http://localhost:$videoPort"
Write-Host "Frontend:        http://localhost:$FrontendPort"
Write-Host "Frontend env:    $frontendLocalEnv"

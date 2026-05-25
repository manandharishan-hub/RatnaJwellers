param(
    [int[]]$ApiPorts = @(8001, 8000, 8080),
    [int[]]$VideoPorts = @(8002, 8003, 8004),
    [int[]]$FrontendPorts = @(5173, 5174, 4173)
)

$ErrorActionPreference = "Stop"

$allPorts = @($ApiPorts + $VideoPorts + $FrontendPorts)
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $allPorts -contains $_.LocalPort }

if (-not $connections) {
    Write-Host "No matching dev services found on ports: $($allPorts -join ', ')"
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pid in $pids) {
    try {
        $proc = Get-Process -Id $pid -ErrorAction Stop
        Stop-Process -Id $pid -Force
        Write-Host "Stopped process $($proc.ProcessName) (PID $pid)"
    } catch {
        Write-Host "Could not stop PID ${pid}: $($_.Exception.Message)"
    }
}

Write-Host "Stopped listeners on: $((($connections | Select-Object -ExpandProperty LocalPort -Unique) -join ', '))"

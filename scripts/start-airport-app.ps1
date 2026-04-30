$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$LogDir = Join-Path $ProjectRoot "runtime_logs"
$PythonExe = Join-Path $ProjectRoot "env\Scripts\python.exe"
$ViteCmd = Join-Path $FrontendDir "node_modules\.bin\vite.cmd"
$NodeDir = "C:\Program Files\nodejs"
$NpmCmd = Join-Path $NodeDir "npm.cmd"

New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

function Write-StartupLog {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp $Message" | Out-File -FilePath (Join-Path $LogDir "startup.log") -Append -Encoding utf8
}

function Test-LocalPort {
    param(
        [string]$HostName,
        [int]$Port
    )

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connect = $client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $connect.AsyncWaitHandle.WaitOne(750, $false)) {
            return $false
        }
        $client.EndConnect($connect)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Repair-ProcessPath {
    $pathValue = [System.Environment]::GetEnvironmentVariable("Path", "Process")
    if (-not $pathValue) {
        $pathValue = [System.Environment]::GetEnvironmentVariable("PATH", "Process")
    }

    [System.Environment]::SetEnvironmentVariable("PATH", $null, "Process")
    $nextPath = "$NodeDir;$pathValue"
    [System.Environment]::SetEnvironmentVariable("Path", $nextPath, "Process")
    $env:Path = $nextPath
}

Repair-ProcessPath
$env:MPLBACKEND = "Agg"

if (-not (Test-Path $PythonExe)) {
    Write-StartupLog "Backend not started: Python executable was not found at $PythonExe"
    exit 1
}

if (-not (Test-Path $ViteCmd)) {
    Write-StartupLog "Frontend not started: Vite command was not found at $ViteCmd"
    exit 1
}

if (Test-Path $NpmCmd) {
    $build = Start-Process `
        -FilePath $NpmCmd `
        -ArgumentList "run", "build" `
        -WorkingDirectory $FrontendDir `
        -RedirectStandardOutput (Join-Path $LogDir "frontend-build.log") `
        -RedirectStandardError (Join-Path $LogDir "frontend-build.err.log") `
        -WindowStyle Hidden `
        -Wait `
        -PassThru

    if ($build.ExitCode -eq 0) {
        Write-StartupLog "Built frontend for Django fallback serving"
    } else {
        Write-StartupLog "Frontend build failed with exit code $($build.ExitCode); continuing with existing dist if available"
    }
} else {
    Write-StartupLog "Frontend build skipped: npm command was not found at $NpmCmd"
}

if (Test-LocalPort -HostName "127.0.0.1" -Port 8000) {
    Write-StartupLog "Django already running on 127.0.0.1:8000"
} else {
    Start-Process `
        -FilePath $PythonExe `
        -ArgumentList "manage.py", "runserver", "127.0.0.1:8000", "--noreload" `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput (Join-Path $LogDir "django.log") `
        -RedirectStandardError (Join-Path $LogDir "django.err.log") `
        -WindowStyle Hidden
    Write-StartupLog "Started Django on 127.0.0.1:8000"
}

if (Test-LocalPort -HostName "localhost" -Port 5173) {
    Write-StartupLog "Vite already running on localhost:5173"
} else {
    Start-Process `
        -FilePath $ViteCmd `
        -ArgumentList "--host", "127.0.0.1", "--port", "5173", "--configLoader", "native" `
        -WorkingDirectory $FrontendDir `
        -RedirectStandardOutput (Join-Path $LogDir "vite.log") `
        -RedirectStandardError (Join-Path $LogDir "vite.err.log") `
        -WindowStyle Hidden
    Write-StartupLog "Started Vite on 127.0.0.1:5173"
}

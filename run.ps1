# Run script for Route Optimizer Backend
# This script ensures uvicorn runs from the correct directory

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Activate virtual environment if it exists
if (Test-Path "app\venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & "app\venv\Scripts\Activate.ps1"
}

Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "Server will be available at: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""

uvicorn app.main:app --reload

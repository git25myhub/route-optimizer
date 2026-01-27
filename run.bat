@echo off
REM Run script for Route Optimizer Backend
REM This script ensures uvicorn runs from the correct directory

cd /d "%~dp0"

REM Activate virtual environment if it exists
if exist "app\venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call app\venv\Scripts\activate.bat
)

echo Starting FastAPI server...
echo Server will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo.

uvicorn app.main:app --reload

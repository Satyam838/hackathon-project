@echo off
echo.
echo ========================================
echo   HR Management System - Windows Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python is installed
echo.

REM Run the setup script
echo 🚀 Running setup script...
python setup.py

if errorlevel 1 (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the application:
echo 1. Run: hr_env\Scripts\activate
echo 2. Run: python app.py
echo 3. Open: http://127.0.0.1:5000
echo.
pause
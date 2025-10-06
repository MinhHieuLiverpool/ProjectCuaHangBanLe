@echo off
echo ========================================
echo   STORE MANAGEMENT API - QUICK START
echo ========================================
echo.

cd StoreManagementAPI

echo [1/3] Checking .NET SDK...
dotnet --version
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found!
    echo Please install .NET 8.0 SDK from https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo.

echo [2/3] Building project...
dotnet build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Starting API Server...
echo.
echo ========================================
echo   API is starting...
echo   Swagger UI will open automatically
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:5000
dotnet run

pause

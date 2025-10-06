@echo off
echo ========================================
echo   CLEAN BUILD - Store Management API
echo ========================================
echo.

cd StoreManagementAPI

echo Cleaning bin and obj folders...
if exist bin rmdir /s /q bin
if exist obj rmdir /s /q obj

echo.
echo Restoring packages...
dotnet restore

echo.
echo Building project...
dotnet build

echo.
echo ========================================
echo   Clean build completed!
echo ========================================
echo.
pause

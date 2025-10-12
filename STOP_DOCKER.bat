@echo off
echo ====================================
echo Stopping Docker Containers...
echo ====================================

docker-compose down

echo.
echo ====================================
echo Containers stopped successfully!
echo ====================================
pause

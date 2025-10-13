@echo off
echo ====================================
echo Rebuilding Docker Containers...
echo ====================================

docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo.
echo ====================================
echo Containers rebuilt and started!
echo ====================================
pause

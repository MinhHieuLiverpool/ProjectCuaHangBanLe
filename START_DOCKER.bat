@echo off
echo ====================================
echo Starting Docker Containers...
echo ====================================

docker-compose up -d

echo.
echo ====================================
echo Containers are starting!
echo ====================================
echo MySQL Database: localhost:3306
echo API Server: http://localhost:5122
echo Frontend: http://localhost:5173
echo ====================================
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo ====================================
pause

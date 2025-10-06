@echo off
chcp 65001 >nul
echo ========================================
echo    KIỂM TRA KẾT NỐI BACKEND + DATABASE
echo ========================================
echo.

echo [1] Kiểm tra backend có chạy không...
curl -s http://localhost:5122/swagger/index.html >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend đang chạy tại: http://localhost:5122
) else (
    echo ❌ Backend KHÔNG chạy!
    echo.
    echo Hãy chạy backend trước:
    echo   cd StoreManagementAPI
    echo   dotnet run
    echo.
    pause
    exit /b 1
)

echo.
echo [2] Test API Login endpoint...
echo.

curl -X POST http://localhost:5122/api/auth/login ^
     -H "Content-Type: application/json" ^
     -d "{\"username\":\"admin\",\"password\":\"123456\"}" ^
     -w "\n\nHTTP Status: %%{http_code}\n" ^
     -s

echo.
echo.
echo [3] Kết quả:
echo.
echo Nếu thấy:
echo   - HTTP Status: 200 + có "token" → ✅ KẾT NỐI DATABASE THÀNH CÔNG!
echo   - HTTP Status: 500 → ❌ Lỗi database (chưa import hoặc password sai)
echo   - HTTP Status: 401 → ❌ Sai username/password
echo   - Connection refused → ❌ Backend chưa chạy
echo.
echo ========================================
pause

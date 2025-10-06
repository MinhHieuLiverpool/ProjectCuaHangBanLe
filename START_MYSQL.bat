@echo off
chcp 65001 >nul
echo ========================================
echo    KHỞI ĐỘNG MYSQL SERVER
echo ========================================
echo.

echo [Bước 1] Tìm MySQL Server...
echo.

REM Thử các đường dẫn phổ biến
set "MYSQL_PATHS=C:\Program Files\MySQL\MySQL Server 8.0\bin;C:\Program Files\MySQL\MySQL Server 8.4\bin;C:\MySQL\bin;C:\xampp\mysql\bin"

for %%p in (%MYSQL_PATHS%) do (
    if exist "%%p\mysqld.exe" (
        echo ✅ Tìm thấy MySQL tại: %%p
        set MYSQL_BIN=%%p
        goto :found
    )
)

echo ❌ KHÔNG TÌM THẤY MYSQL!
echo.
echo Có thể MySQL chưa được cài đặt.
echo.
echo Hãy cài MySQL từ: https://dev.mysql.com/downloads/installer/
echo Hoặc cài XAMPP từ: https://www.apachefriends.org/download.html
echo.
pause
exit /b 1

:found
echo.
echo [Bước 2] Khởi động MySQL Server...
echo.

cd /d "%MYSQL_BIN%"

REM Kiểm tra xem mysqld đang chạy chưa
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL Server đã đang chạy!
    echo.
) else (
    echo Đang khởi động MySQL Server...
    start "" mysqld.exe --console
    
    timeout /t 5 /nobreak >nul
    
    tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo ✅ MySQL Server đã khởi động thành công!
    ) else (
        echo ❌ Không thể khởi động MySQL Server!
        echo.
        echo Thử chạy với quyền Administrator:
        echo 1. Right-click file này
        echo 2. Chọn "Run as administrator"
    )
)

echo.
echo [Bước 3] Test kết nối...
echo.

timeout /t 2 /nobreak >nul

mysql.exe --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ MySQL client hoạt động!
    echo.
    echo Bây giờ bạn có thể:
    echo 1. Mở MySQL Workbench
    echo 2. Kết nối lại connection
    echo 3. Import database
) else (
    echo ⚠️ MySQL client có vấn đề
)

echo.
echo ========================================
echo.
pause

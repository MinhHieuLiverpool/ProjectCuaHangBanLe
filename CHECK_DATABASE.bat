@echo off
chcp 65001 >nul
echo ========================================
echo    KIỂM TRA KẾT NỐI DATABASE
echo ========================================
echo.

echo [1/3] Kiểm tra MySQL có chạy không...
echo.

set /p db_password="Nhập password MySQL root: "

echo.
echo [2/3] Thử kết nối MySQL...
mysql -u root -p%db_password% -e "SELECT 'Kết nối MySQL thành công!' as Status;" 2>nul

if %errorlevel% neq 0 (
    echo.
    echo ❌ KHÔNG KẾT NỐI ĐƯỢC MYSQL!
    echo.
    echo Nguyên nhân có thể:
    echo   - MySQL chưa được cài đặt
    echo   - MySQL service không chạy
    echo   - Password sai
    echo   - MySQL không có trong PATH
    echo.
    echo Hướng dẫn:
    echo   1. Cài MySQL: https://dev.mysql.com/downloads/mysql/
    echo   2. Khởi động MySQL service
    echo   3. Thêm MySQL vào PATH: C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Kiểm tra database store_management...
mysql -u root -p%db_password% -e "USE store_management; SELECT 'Database đã tồn tại!' as Status; SHOW TABLES;" 2>nul

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  DATABASE CHƯA TỒN TẠI!
    echo.
    set /p import_db="Bạn có muốn import database không? (Y/N): "
    
    if /i "%import_db%"=="Y" (
        echo.
        echo Đang import database...
        mysql -u root -p%db_password% < store_management_full.sql
        
        if %errorlevel% equ 0 (
            echo.
            echo ✅ IMPORT DATABASE THÀNH CÔNG!
        ) else (
            echo.
            echo ❌ IMPORT THẤT BẠI!
        )
    )
) else (
    echo.
    echo ✅ DATABASE ĐÃ SẴN SÀNG!
)

echo.
echo [4/4] Cập nhật appsettings.json...
echo.
echo Mở file: StoreManagementAPI\appsettings.json
echo.
echo Sửa dòng ConnectionString thành:
echo "DefaultConnection": "Server=localhost;Port=3306;Database=store_management;User=root;Password=%db_password%;"
echo.
echo ========================================
pause

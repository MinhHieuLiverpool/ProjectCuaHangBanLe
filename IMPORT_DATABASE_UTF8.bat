@echo off
chcp 65001 >nul
echo ========================================
echo    IMPORT DATABASE VỚI UTF-8
echo ========================================
echo.

echo [Bước 1] Xóa database cũ...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 -e "DROP DATABASE IF EXISTS store_management;"
echo ✅ Đã xóa database cũ
echo.

echo [Bước 2] Tạo database mới với UTF-8...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 -e "CREATE DATABASE store_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo ✅ Đã tạo database với UTF-8
echo.

echo [Bước 3] Import dữ liệu...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 store_management < "store_management.sql"
echo ✅ Đã import store_management.sql
echo.

echo [Bước 4] Import migration...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 store_management < "migrations\001_add_audit_logs.sql"
echo ✅ Đã import migration
echo.

echo [Bước 5] Kiểm tra dữ liệu tiếng Việt...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 store_management -e "SELECT category_name FROM categories LIMIT 5;"
echo.

echo [Bước 6] Kiểm tra charset...
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 store_management -e "SHOW VARIABLES LIKE 'character_set%%';"
echo.

echo ========================================
echo    HOÀN TẤT!
echo ========================================
echo.
echo Mở phpMyAdmin để kiểm tra: http://localhost/phpmyadmin
echo.
pause

@echo off
echo Creating combo promotion tables...
echo.

REM Chay script SQL
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456 store_management < create_combo_tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Tables created successfully!
    echo.
) else (
    echo.
    echo ✗ Error creating tables!
    echo.
)

pause

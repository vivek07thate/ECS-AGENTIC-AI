@echo off
set /p DB_PASS="Enter your PostgreSQL password for user 'postgres': "
SET PGPASSWORD=%DB_PASS%
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE ecs_db;"
if %ERRORLEVEL% EQU 0 (
    echo Database ecs_db created successfully!
) else (
    echo Failed to create database. Please check if PostgreSQL is installed at the path above.
)
pause

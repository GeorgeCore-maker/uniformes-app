@echo off
REM Script para migración completa Fase 1 - SQLite + DBeaver
REM run-migration.bat

echo 🚀 UNIFORMES APP - MIGRACIÓN FASE 1: SQLite + DBeaver
echo ======================================================

REM Verificar dependencias
echo 📦 Verificando dependencias...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado
    exit /b 1
)

echo ✅ Node.js y npm disponibles

REM Instalar dependencias si es necesario
echo 📦 Instalando dependencias...
call npm install --silent

REM Generar cliente Prisma
echo 🏗️ Generando cliente Prisma...
call npx prisma generate --silent

REM Crear backup del db.json actual
echo 📦 Creando backup...
set timestamp=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
if not exist backups mkdir backups
copy db.json "backups\db_backup_%timestamp%.json" >nul
echo ✅ Backup creado: backups\db_backup_%timestamp%.json

REM Ejecutar migración
echo 🔄 Ejecutando migración...
call npx ts-node --project tsconfig.server.json scripts/migrate-from-json.ts

REM Verificar que la DB se creó
if exist "prisma\uniformes.db" (
    echo ✅ Base de datos SQLite creada: prisma\uniformes.db
) else (
    echo ❌ Error: Base de datos no se creó
    exit /b 1
)

echo.
echo 🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!
echo.
echo 📊 RESUMEN:
echo   💾 Base de datos: SQLite ^(uniformes.db^)
echo   📍 Ubicación: %CD%\prisma\uniformes.db
echo   🔧 Gestión: DBeaver Community
echo   📡 API: http://localhost:3001
echo.
echo 🔧 CONFIGURAR DBEAVER:
echo   1. Abrir DBeaver
echo   2. Nueva Conexión → SQLite
echo   3. Archivo DB: %CD%\prisma\uniformes.db
echo.
echo 🚀 INICIAR SERVICIOS:
echo   # Terminal 1 - API Server
echo   node server/prisma-api.js
echo.
echo   # Terminal 2 - Angular App
echo   npm start
echo.
echo 📊 ENDPOINTS DISPONIBLES:
echo   - http://localhost:3001/api/health
echo   - http://localhost:3001/api/productos
echo   - http://localhost:3001/api/clientes
echo   - http://localhost:3001/api/inventario
echo.
echo ✅ La Fase 1 está completa. ¡Disfruta tu nueva base de datos!
pause

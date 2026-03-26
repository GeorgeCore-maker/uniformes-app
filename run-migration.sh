#!/bin/bash
# Script para migración completa Fase 1 - SQLite + DBeaver
# run-migration.sh

echo "🚀 UNIFORMES APP - MIGRACIÓN FASE 1: SQLite + DBeaver"
echo "======================================================"

# Verificar dependencias
echo "📦 Verificando dependencias..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ Node.js y npm disponibles"

# Instalar dependencias si es necesario
echo "📦 Instalando dependencias..."
npm install --silent

# Verificar Prisma
echo "🔍 Verificando Prisma..."
if ! npx prisma --version &> /dev/null; then
    echo "📦 Instalando Prisma..."
    npm install prisma @prisma/client --silent
fi

# Generar cliente Prisma
echo "🏗️ Generando cliente Prisma..."
npx prisma generate --silent

# Crear backup del db.json actual
echo "📦 Creando backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
cp db.json "backups/db_backup_$timestamp.json"
echo "✅ Backup creado: backups/db_backup_$timestamp.json"

# Ejecutar migración
echo "🔄 Ejecutando migración..."
npx ts-node --project tsconfig.server.json scripts/migrate-from-json.ts

# Verificar que la DB se creó
if [ -f "prisma/uniformes.db" ]; then
    echo "✅ Base de datos SQLite creada: prisma/uniformes.db"
else
    echo "❌ Error: Base de datos no se creó"
    exit 1
fi

echo ""
echo "🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!"
echo ""
echo "📊 RESUMEN:"
echo "  💾 Base de datos: SQLite (uniformes.db)"
echo "  📍 Ubicación: $(pwd)/prisma/uniformes.db"
echo "  🔧 Gestión: DBeaver Community"
echo "  📡 API: http://localhost:3001"
echo ""
echo "🔧 CONFIGURAR DBEAVER:"
echo "  1. Abrir DBeaver"
echo "  2. Nueva Conexión → SQLite"
echo "  3. Archivo DB: $(pwd)/prisma/uniformes.db"
echo ""
echo "🚀 INICIAR SERVICIOS:"
echo "  # Terminal 1 - API Server"
echo "  node server/prisma-api.js"
echo ""
echo "  # Terminal 2 - Angular App"
echo "  npm start"
echo ""
echo "📊 ENDPOINTS DISPONIBLES:"
echo "  - http://localhost:3001/api/health"
echo "  - http://localhost:3001/api/productos"
echo "  - http://localhost:3001/api/clientes"
echo "  - http://localhost:3001/api/inventario"
echo ""
echo "✅ La Fase 1 está completa. ¡Disfruta tu nueva base de datos!"

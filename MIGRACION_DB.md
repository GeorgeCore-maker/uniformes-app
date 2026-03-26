# 📊 Guía de Migración de Base de Datos - Uniformes App

## 🎯 Objetivo

Migrar progresivamente desde el actual sistema basado en `json-server` hacia una base de datos formal, manteniendo compatibilidad y facilitando el despliegue futuro.

## 📋 Fases de Migración

### **FASE 1: SQLite Local** ✨ *Recomendada para iniciar*

**Objetivo**: Migrar a una base de datos real manteniendo todo local

**Ventajas**:
- ✅ Cero configuración de infraestructura
- ✅ Archivo único portátil
- ✅ Perfecto para desarrollo y pruebas
- ✅ Compatible con Angular sin cambios mayores
- ✅ Migración directa desde `db.json`

**Pasos**:

1. **Instalar dependencias**:
   ```bash
   npm install prisma @prisma/client sqlite3
   npm install -D prisma typescript ts-node @types/node
   ```

2. **Ejecutar migración automática**:
   ```bash
   chmod +x scripts/migrate-database.sh
   ./scripts/migrate-database.sh 1
   ```

3. **Actualizar servicios Angular**:
   - Los servicios cambiarán de `http://localhost:3000` (json-server) a API REST con Prisma
   - Mantiene la misma interfaz HTTP

4. **Verificar migración**:
   ```bash
   npm run server:api  # Nuevo servidor con Prisma
   npm run start       # Angular app
   ```

### **FASE 2: PostgreSQL + Docker** 🐳

**Objetivo**: Base de datos profesional en contenedores

**Ventajas**:
- ✅ Base de datos robusta y escalable
- ✅ Contenedores para fácil despliegue
- ✅ Adminer web para administración
- ✅ Redis para cache opcional
- ✅ Preparado para producción

**Requisitos**:
- Docker y Docker Compose instalados

**Pasos**:

1. **Ejecutar migración**:
   ```bash
   ./scripts/migrate-database.sh 2
   ```

2. **Servicios disponibles**:
   - PostgreSQL: `localhost:5432`
   - API: `localhost:3000`
   - Adminer: `localhost:8080`
   - Redis: `localhost:6379`

3. **Administración**:
   - Usuario DB: `uniformes`
   - Contraseña: `uniformes123`
   - Base de datos: `uniformes_db`

### **FASE 3: Despliegue en la Nube** ☁️

**Objetivo**: Aplicación completamente en la nube

**Opciones recomendadas**:

1. **Railway** (Más fácil):
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Render** (Gratuito para empezar):
   - Conectar repositorio GitHub
   - Auto-deploy desde commits

3. **DigitalOcean App Platform**:
   - Despliegue directo desde Docker

## 🛠️ Cambios en el Código Angular

### Antes (json-server):
```typescript
// cliente.service.ts
obtenerTodos(): Observable<Cliente[]> {
  return this.http.get<Cliente[]>('http://localhost:3000/clientes');
}
```

### Después (Base de datos formal):
```typescript
// cliente.service.ts - Sin cambios!
obtenerTodos(): Observable<Cliente[]> {
  return this.http.get<Cliente[]>('http://localhost:3000/api/clientes');
}
```

Solo cambia la URL base: `/api/` como prefijo.

## 📊 Estructura de Datos Mejorada

### Características añadidas:

1. **Relaciones formales** entre tablas
2. **Índices** para mejor rendimiento
3. **Constraints** y validaciones a nivel DB
4. **Auditoría** de cambios
5. **Soft deletes** (habilitado/deshabilitado)
6. **Metadatos JSON** para flexibilidad futura
7. **Enums** para estados consistentes

### Nuevas capacidades:

- **Inventario en tiempo real** con movimientos
- **Producción avanzada** con lotes y operarios
- **Pagos parciales** y múltiples métodos
- **Variantes de productos** (tallas, colores)
- **Jerarquía de categorías**
- **Contactos múltiples** por cliente

## 🔄 Compatibilidad

### ✅ Mantenemos:
- Todas las interfaces TypeScript actuales
- Estructura de respuestas HTTP
- Flujos de trabajo existentes
- Componentes Angular sin modificación

### ➕ Añadimos:
- Validaciones a nivel de base de datos
- Mejor rendimiento con índices
- Capacidades de backup/restore
- Logs de auditoría
- Configuración centralizada

## 🚀 Comandos Rápidos

```bash
# Migrar a SQLite (Fase 1)
./scripts/migrate-database.sh 1

# Migrar a PostgreSQL (Fase 2)
./scripts/migrate-database.sh 2

# Iniciar desarrollo con nueva DB
npm run dev:db    # Inicia base de datos
npm run dev:api   # Inicia API con Prisma
npm run dev:web   # Inicia Angular

# Backup de emergencia
npm run db:backup

# Restaurar desde backup
npm run db:restore backup_20240325.db

# Ver logs de base de datos
docker-compose logs -f postgres

# Administrar con Adminer
open http://localhost:8080
```

## 📈 Métricas de Rendimiento

### Mejoras esperadas:

- **Consultas**: 10x más rápidas con índices
- **Integridad**: 100% consistencia con FK
- **Escalabilidad**: Soporta miles de productos/pedidos
- **Backup**: Automático y confiable
- **Concurrencia**: Multiple usuarios simultáneos

## 🔒 Seguridad

### Implementado:
- Hashing de contraseñas con bcrypt
- Validación de tokens JWT
- SQL injection prevention (Prisma)
- Rate limiting en API
- CORS configurado correctamente

### Por implementar en Fase 3:
- SSL/HTTPS automático
- Firewall de aplicación
- Monitoreo de seguridad
- Backup cifrado

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Revisa los logs**: `npm run logs`
2. **Verifica backup**: Siempre se crea automáticamente
3. **Rollback**: `npm run rollback` restaura estado anterior
4. **Reinicia servicios**: `docker-compose restart`

---

**Recomendación**: Empieza con Fase 1 (SQLite) para familiarizarte con el nuevo sistema, luego migra a Fase 2 cuando estés listo para producción.

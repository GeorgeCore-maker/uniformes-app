# 🗄️ Configuración de DBeaver para Uniformes App

## 📥 Instalación de DBeaver

1. **Descarga DBeaver Community**:
   - Ve a: https://dbeaver.io/download/
   - Descarga la versión **Community Edition** (gratuita)
   - Instala siguiendo las instrucciones

## 🔗 Conexión a SQLite

### Paso 1: Nueva Conexión
1. Abre **DBeaver**
2. Clic en **"Nueva Conexión"** (ícono de enchufe +)
3. Selecciona **SQLite** en la lista de bases de datos
4. Clic en **"Siguiente"**

### Paso 2: Configuración de Conexión
- **Archivo de base de datos**: 
  ```
  C:\Users\USUARIO\Documents\uniformes-app\prisma\uniformes.db
  ```
- **Driver**: Se descargará automáticamente
- **Nombre de conexión**: `Uniformes App - SQLite`
- Clic en **"Probar Conexión"** para verificar
- Clic en **"Finalizar"**

## 📊 Explorando las Tablas

Una vez conectado, verás en el **Navigator**:

```
📁 Uniformes App - SQLite
  └── 📁 Schemas
      └── 📁 main
          └── 📁 Tables
              ├── 📋 users (3 registros)
              ├── 📋 clientes (5 registros)  
              ├── 📋 categorias (3 registros)
              ├── 📋 productos (6 registros)
              ├── 📋 pedidos (5 registros)
              ├── 📋 detalle_pedidos (6 registros)
              ├── 📋 items_produccion (0 registros)
              ├── 📋 movimientos_inventario (0 registros)
              └── 📋 configuracion (0 registros)
```

## ⚡ Consultas Útiles

### Ver todos los productos con su categoría:
```sql
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.stockActual,
    p.stockMinimo,
    p.requiereConfeccion,
    c.nombre as categoria,
    CASE 
        WHEN p.stockActual <= 0 THEN 'CRÍTICO'
        WHEN p.stockActual <= p.stockMinimo THEN 'BAJO'
        ELSE 'NORMAL'
    END as estadoStock
FROM productos p
JOIN categorias c ON p.categoriaId = c.id
ORDER BY p.nombre;
```

### Ver pedidos con cliente y detalles:
```sql
SELECT 
    ped.numero,
    cli.nombre as cliente,
    ped.estado,
    ped.total,
    ped.fechaPedido,
    COUNT(det.id) as itemsPedido
FROM pedidos ped
JOIN clientes cli ON ped.clienteId = cli.id
LEFT JOIN detalle_pedidos det ON ped.id = det.pedidoId
GROUP BY ped.id
ORDER BY ped.fechaPedido DESC;
```

### Productos con stock bajo o crítico:
```sql
SELECT 
    nombre,
    stockActual,
    stockMinimo,
    requiereConfeccion,
    CASE 
        WHEN stockActual <= 0 THEN 'CRÍTICO'
        WHEN stockActual <= stockMinimo THEN 'BAJO'
        ELSE 'NORMAL'
    END as estado
FROM productos
WHERE stockActual <= stockMinimo
ORDER BY stockActual ASC;
```

### Resumen de inventario por categoría:
```sql
SELECT 
    c.nombre as categoria,
    COUNT(p.id) as totalProductos,
    SUM(p.stockActual) as stockTotal,
    AVG(p.precio) as precioPromedio,
    SUM(CASE WHEN p.stockActual <= 0 THEN 1 ELSE 0 END) as productosCriticos,
    SUM(CASE WHEN p.stockActual <= p.stockMinimo AND p.stockActual > 0 THEN 1 ELSE 0 END) as productosBajos
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoriaId
GROUP BY c.id, c.nombre
ORDER BY c.nombre;
```

## 🔧 Funciones Útiles en DBeaver

### 1. **Editor SQL**
- `Ctrl + Enter`: Ejecutar consulta
- `Ctrl + Shift + E`: Explicar plan de ejecución
- `F5`: Actualizar resultados

### 2. **Data Editor**
- **Doble clic** en tabla para ver datos
- **Editar in-place**: Doble clic en celda
- **Guardar cambios**: `Ctrl + S`
- **Cancelar cambios**: `Esc`

### 3. **Exportar/Importar**
- **Exportar**: Click derecho en tabla → Export Data
- **Importar**: Click derecho en tabla → Import Data
- **Formatos**: CSV, Excel, JSON, SQL, XML

### 4. **Backup de Base de Datos**
- Click derecho en conexión → Tools → Backup
- Guarda una copia completa de `uniformes.db`

## 📱 Integración con la App Angular

### URLs de la nueva API:

| Endpoint | URL | Descripción |
|----------|-----|-------------|
| Health | `GET http://localhost:3001/api/health` | Estado del servidor |
| Usuarios | `GET http://localhost:3001/api/users` | Lista de usuarios |
| Clientes | `GET http://localhost:3001/api/clientes` | Lista de clientes |
| Categorías | `GET http://localhost:3001/api/categorias` | Lista de categorías |
| Productos | `GET http://localhost:3001/api/productos` | Lista de productos |
| Pedidos | `GET http://localhost:3001/api/pedidos` | Lista de pedidos |
| Inventario | `GET http://localhost:3001/api/inventario` | Estado del inventario |
| Producción | `GET http://localhost:3001/api/produccion` | Items de producción |

## ⚠️ Notas Importantes

1. **Puerto**: El servidor Prisma usa puerto `3001`, json-server usa `3000`
2. **Prefijo**: Todas las rutas usan prefijo `/api/`
3. **Formato**: Mantiene compatibilidad con el formato anterior
4. **Backup**: Haz backup de `uniformes.db` antes de cambios grandes
5. **Desarrollo**: Para desarrollo simultáneo, puedes ejecutar ambos servidores

## 🔄 Scripts de npm

Añade estos comandos a tu flujo de trabajo:

```bash
# Iniciar servidor Prisma + SQLite
npm run dev:api

# Iniciar aplicación Angular
npm run start

# Abrir DBeaver (si está en PATH)
dbeaver

# Hacer backup de la DB
npm run db:backup

# Ver datos con Prisma Studio (alternativa web a DBeaver)
npm run db:studio
```

## 🎯 Próximos Pasos

1. **✅ Completado**: Migración a SQLite
2. **✅ Completado**: Servidor API con Prisma
3. **✅ Completado**: Configuración de DBeaver
4. **🔄 En proceso**: Actualizar servicios Angular
5. **📋 Pendiente**: Pruebas de integración
6. **📋 Pendiente**: Documentar cambios para el equipo

---

**¡La base de datos SQLite está lista para usar con DBeaver! 🎉**

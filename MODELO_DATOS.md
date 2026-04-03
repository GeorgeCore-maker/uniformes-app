# 📊 Modelo de Datos - Uniformes App

## 🎯 Visión General

El modelo de datos de **Uniformes App** está diseñado para gestionar un negocio de fabricación y venta de uniformes. El sistema implementa un arquitectura relacional que permite:

- Gestionar usuarios con roles y permisos
- Administrar clientes y sus órdenes
- Controlar inventario de productos
- Registrar y monitorear pedidos
- Calcular márgenes de ganancia
- Rastrear el estado de producción

---

## 📋 Entidades Principales

### 1. **Usuario** 👤

Representa los usuarios del sistema con autenticación y autorización basada en roles.

```typescript
interface Usuario {
  id: number;                    // Identificador único
  username: string;              // Nombre de usuario único
  password: string;              // Contraseña (hasheada en producción)
  email?: string;                // Correo electrónico
  role: UserRole | string;       // Rol asignado (ADMIN, VENDEDOR, OPERARIO)
  rolId?: number;                // ID del rol personalizado (si aplica)
  token?: string;                // Token JWT para autenticación
  activo?: boolean;              // Estado del usuario
  createdAt?: Date;              // Fecha de creación
  updatedAt?: Date;              // Fecha de última actualización
}
```

**Relaciones:**
- Crea/Modifica: Pedidos, Clientes, Productos
- Tiene asignado: Rol (predefinido o personalizado)

**Enums de Roles:**
```typescript
enum UserRole {
  ADMIN = 'ADMIN',              // Acceso total
  VENDEDOR = 'VENDEDOR',        // Gestión de ventas
  OPERARIO = 'OPERARIO'         // Gestión de producción
}
```

---

### 2. **Rol** 🔐

Define roles personalizados con permisos específicos para control granular de acceso.

```typescript
interface Rol {
  id: number;                    // Identificador único
  nombre: string;                // Nombre descriptivo del rol
  descripcion?: string;          // Descripción de responsabilidades
  permisos: string[];            // Array de permisos asignados
  activo: boolean;               // Estado del rol
  createdAt?: Date;              // Fecha de creación
  updatedAt?: Date;              // Fecha de última actualización
}
```

**Permisos Disponibles (20+):**

| Categoría | Permisos |
|-----------|----------|
| Dashboard | `ver_dashboard` |
| Pedidos | `crear_pedido`, `editar_pedido`, `eliminar_pedido` |
| Inventario | `ver_inventario`, `editar_inventario` |
| Producción | `ver_produccion`, `editar_produccion` |
| Clientes | `ver_clientes`, `crear_cliente`, `editar_cliente`, `eliminar_cliente` |
| Usuarios | `ver_usuarios`, `crear_usuario`, `editar_usuario`, `eliminar_usuario` |
| Roles | `ver_roles`, `crear_rol`, `editar_rol`, `eliminar_rol` |

**Roles Predefinidos:**

| Rol | Descripción | Permisos Clave |
|-----|-------------|----------------|
| **ADMIN** | Administrador con acceso total | Todos los permisos (20) |
| **VENDEDOR** | Especialista en ventas | Dashboard, Pedidos, Clientes |
| **OPERARIO** | Responsable de producción | Dashboard, Producción, Inventario |
| **GERENTE** | Gestor general | Dashboard, Pedidos, Inventario, Producción, Clientes |
| **SUPERVISOR** | Solo lectura de reportes | Dashboard, Reportes (lectura) |

**Relaciones:**
- Asignado a: Usuarios
- Define: Permisos del sistema

---

### 3. **Cliente** 🏢

Representa las organizaciones o personas que compran uniformes.

```typescript
interface Cliente {
  id: number;                    // Identificador único
  nombre: string;                // Nombre de la empresa/persona
  telefono: string;              // Teléfono de contacto
  email?: string;                // Correo electrónico
  direccion?: string;            // Domicilio
  ciudad?: string;               // Ciudad de ubicación
  nit?: string;                  // Número de identificación (NIT/RUT)
  createdAt?: Date;              // Fecha de creación
  updatedAt?: Date;              // Fecha de última actualización
}
```

**Relaciones:**
- Realiza: Múltiples Pedidos
- Tiene: Historial de compras

**Casos de Uso:**
- Colegio Santa María
- Hospital Central
- Empresa de Servicios ABC
- Empresas de seguridad
- Clínicas y hospitales

---

### 4. **Producto** 👕

Catálogo de uniformes disponibles para venta.

```typescript
interface Producto {
  id: number;                    // Identificador único
  nombre: string;                // Nombre del uniforme
  descripcion?: string;          // Descripción detallada
  categoria: CategoriaProducto;  // Categoría de clasificación
  talla?: string;                // Talla disponible (S, M, L, XL)
  precio: number;                // Precio de venta unitario (en pesos)
  costo: number;                 // Costo de producción unitario
  stock: number;                 // Cantidad disponible en inventario
  stockMinimo: number;           // Cantidad mínima antes de reabastecer
  imagen?: string;               // URL de imagen del producto
  createdAt?: Date;              // Fecha de creación
  updatedAt?: Date;              // Fecha de última actualización
}
```

**Categorías de Productos:**

```typescript
enum CategoriaProducto {
  UNIFORMES_ESCOLARES = 'UNIFORMES_ESCOLARES',    // Uniformes para colegios
  TRAJES_MEDICOS = 'TRAJES_MEDICOS',              // Uniformes médicos
  DOTACION_SERVICIOS = 'DOTACION_SERVICIOS'       // Uniformes de servicios
}
```

**Matriz de Información:**

| Atributo | Tipo | Obligatorio | Descripción |
|----------|------|-----------|------------|
| `id` | Number | ✅ | Clave primaria |
| `nombre` | String | ✅ | Ej: "Uniforme Escolar - Vestido" |
| `descripcion` | String | ❌ | Detalles del uniforme |
| `categoria` | Enum | ✅ | Clasificación del producto |
| `talla` | String | ❌ | S, M, L, XL, XXL |
| `precio` | Number | ✅ | Precio final de venta |
| `costo` | Number | ✅ | Costo de fabricación |
| `stock` | Number | ✅ | Cantidad en almacén |
| `stockMinimo` | Number | ✅ | Nivel de reorden |
| `imagen` | String | ❌ | URL del catálogo |

**Ejemplos en Base de Datos:**
- Uniforme Escolar - Vestido: $85,000 (costo: $45,000)
- Bata Médica Blanca: $120,000 (costo: $60,000)
- Uniforme Servicios - Polo: $55,000 (costo: $28,000)

**Relaciones:**
- Aparece en: Múltiples DetallePedidos
- Tiene: Información de stock e inventario

---

### 5. **Pedido** 🛒

Orden de compra realizada por un cliente.

```typescript
interface Pedido {
  id: number;                    // Identificador único
  clienteId: number;             // FK: Cliente que realiza la orden
  cliente?: Cliente;             // Objeto Cliente (desnormalizado)
  numero: string;                // Número de referencia (ej: PED-001)
  estado: EstadoPedido;          // Estado actual del pedido
  detalles: DetallePedido[];     // Líneas de productos incluidas
  subtotal: number;              // Suma de subtotales
  impuesto?: number;             // IVA u otro impuesto
  total: number;                 // Subtotal + Impuesto
  margen?: number;               // Ganancia bruta (Total - Costo)
  fechaCreacion: Date;           // Cuándo se creó el pedido
  fechaEntrega?: Date;           // Fecha prometida de entrega
  observaciones?: string;        // Notas especiales
  createdAt?: Date;              // Registro de auditoría
  updatedAt?: Date;              // Registro de auditoría
}
```

**Estados del Pedido:**

```typescript
enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',              // Recibido, sin procesar
  EN_CONFECCION = 'EN_CONFECCION',      // En proceso de fabricación
  TERMINADO = 'TERMINADO',              // Listo para envío
  ENVIADO = 'ENVIADO',                  // En tránsito
  ENTREGADO = 'ENTREGADO',              // Recibido por cliente
  CANCELADO = 'CANCELADO'               // Anulado
}
```

**Ciclo de Vida del Pedido:**

```
PENDIENTE → EN_CONFECCION → TERMINADO → ENVIADO → ENTREGADO
     ↘_____________________________________________________↗
                      (puede ir a) CANCELADO
```

**Cálculo de Valores:**

```
Subtotal = Σ(cantidad × precioUnitario) para cada detalle
Impuesto = Subtotal × 0.19  (19% IVA en Colombia)
Total = Subtotal + Impuesto
Margen = Total - Σ(cantidad × costoPorUnidad)
```

**Ejemplo de Pedido:**
```
PED-001: Colegio Santa María
- 100 Uniformes Escolares Vestido × $85,000 = $8,500,000
Subtotal: $8,500,000
Impuesto (19%): $1,615,000
Total: $10,115,000
Margen: $4,000,000 (ganancia)
```

**Relaciones:**
- Pertenece a: Un Cliente
- Contiene: Múltiples DetallePedidos
- Crea: Un Usuario
- Modifica: Un Usuario

---

### 6. **DetallePedido** 📦

Línea individual dentro de un pedido especificando qué productos y cantidades.

```typescript
interface DetallePedido {
  id: number;                    // Identificador único
  productoId: number;            // FK: Producto incluido
  producto?: Producto;           // Objeto Producto (desnormalizado)
  cantidad: number;              // Unidades solicitadas
  precioUnitario: number;        // Precio unitario al momento de la orden
  subtotal: number;              // cantidad × precioUnitario
}
```

**Relaciones:**
- Referencia: Un Producto
- Pertenece a: Un Pedido

**Ejemplo:**
```json
{
  "id": 1,
  "productoId": 1,
  "cantidad": 100,
  "precioUnitario": 85000,
  "subtotal": 8500000,
  "producto": {
    "id": 1,
    "nombre": "Uniforme Escolar - Vestido",
    "categoria": "UNIFORMES_ESCOLARES",
    "costo": 45000
  }
}
```

---

## 🔗 Relaciones entre Entidades

### Diagrama de Relaciones (ER)

```
┌──────────────┐
│   Usuario    │
│──────────────│
│ id (PK)      │
│ username     │
│ password     │ ──┐
│ role         │   │ Crea/Modifica
│ rolId (FK)   │───────→ ┌──────────────┐
│ token        │         │     Rol      │
│ activo       │         │──────────────│
└──────────────┘         │ id (PK)      │
       ↓                 │ nombre       │
       │ Crea/Modifica   │ permisos[]   │
       │                 └──────────────┘
       ↓
┌──────────────┐
│   Pedido     │
│──────────────│
│ id (PK)      │
│ clienteId(FK)├─────→ ┌──────────────┐
│ numero       │       │   Cliente    │
│ estado       │       │──────────────│
│ subtotal     │       │ id (PK)      │
│ total        │       │ nombre       │
│ margen       │       │ telefono     │
│ fechaCreacion│       │ nit          │
└──────────────┘       └──────────────┘
       │
       │ Contiene
       ↓
┌──────────────────┐
│ DetallePedido    │
│──────────────────│
│ id (PK)          │
│ pedidoId (FK)    │
│ productoId (FK)  ├─────→ ┌──────────────┐
│ cantidad         │       │  Producto    │
│ precioUnitario   │       │──────────────│
│ subtotal         │       │ id (PK)      │
└──────────────────┘       │ nombre       │
                            │ categoria    │
                            │ precio       │
                            │ costo        │
                            │ stock        │
                            └──────────────┘
```

---

## 📊 Matríz de Relaciones

| De | Relación | Para | Cardinalidad |
|----|----------|------|--------------|
| Usuario | asignado | Rol | 1:1 |
| Usuario | crea | Pedido | 1:N |
| Usuario | crea | Cliente | 1:N |
| Usuario | crea | Producto | 1:N |
| Cliente | realiza | Pedido | 1:N |
| Pedido | contiene | DetallePedido | 1:N |
| Producto | aparece_en | DetallePedido | 1:N |

---

## 💾 Estructura de Base de Datos (JSON)

### Tabla `users`
```json
{
  "id": 1,
  "username": "admin",
  "password": "admin123",
  "role": "ADMIN",
  "token": "fake-jwt-token-admin",
  "activo": true
}
```

### Tabla `roles`
```json
{
  "id": 1,
  "nombre": "ADMIN",
  "descripcion": "Administrador con acceso total",
  "permisos": ["ver_dashboard", "crear_pedido", ...],
  "activo": true,
  "createdAt": "2026-01-01T10:00:00Z",
  "updatedAt": "2026-01-01T10:00:00Z"
}
```

### Tabla `clientes`
```json
{
  "id": 1,
  "nombre": "Colegio Santa María",
  "telefono": "3001234567",
  "email": "contacto@santamaria.edu.co",
  "direccion": "Calle 10 #20-30",
  "ciudad": "Bogotá",
  "nit": "900123456"
}
```

### Tabla `productos`
```json
{
  "id": 1,
  "nombre": "Uniforme Escolar - Vestido",
  "descripcion": "Uniforme escolar para niñas",
  "categoria": "UNIFORMES_ESCOLARES",
  "talla": "S",
  "precio": 85000,
  "costo": 45000,
  "stock": 50,
  "stockMinimo": 10
}
```

### Tabla `pedidos`
```json
{
  "id": 1,
  "clienteId": 1,
  "numero": "PED-001",
  "estado": "PENDIENTE",
  "detalles": [
    {
      "id": 1,
      "productoId": 1,
      "cantidad": 100,
      "precioUnitario": 85000,
      "subtotal": 8500000
    }
  ],
  "subtotal": 8500000,
  "impuesto": 1615000,
  "total": 10115000,
  "margen": 4000000,
  "fechaCreacion": "2026-02-15"
}
```

---

## 🔍 Consultas Comunes

### 1. Obtener todos los pedidos de un cliente
```typescript
pedidos.filter(p => p.clienteId === clienteId);
```

### 2. Calcular ingresos totales
```typescript
const ingresos = pedidos
  .filter(p => p.estado === 'ENTREGADO')
  .reduce((sum, p) => sum + p.total, 0);
```

### 3. Identificar productos con bajo stock
```typescript
const bajosStock = productos
  .filter(p => p.stock < p.stockMinimo);
```

### 4. Margen de ganancia por pedido
```typescript
const margenPorcentaje = (pedido.margen / pedido.total) * 100;
```

### 5. Ventas por período
```typescript
const ventasPorPeriodo = pedidos
  .filter(p => p.fechaCreacion >= inicio && p.fechaCreacion <= fin)
  .reduce((sum, p) => sum + p.total, 0);
```

---

## 📈 Indicadores de Negocio

### KPIs Calculables

| KPI | Fórmula | Uso |
|-----|---------|-----|
| **Ingresos Totales** | Σ Total de Pedidos Entregados | Análisis financiero |
| **Margen Bruto** | Σ (Total - Costo Productos) | Rentabilidad |
| **% Margen** | (Margen Bruto / Ingresos) × 100 | Eficiencia |
| **Pedidos Promedio** | Ingresos Totales / Cantidad Pedidos | Ticket promedio |
| **Clientes Activos** | COUNT(Clientes con Pedidos) | Cartera |
| **Productos Rentables** | Productos ordenados por Margen DESC | Portafolio |
| **Tasa de Entrega** | (Pedidos Entregados / Total Pedidos) × 100 | Operacional |

---

## 🔐 Integridad de Datos

### Validaciones Implementadas

1. **Usuario**
   - Username único
   - Contraseña mínimo 6 caracteres
   - Email válido (opcional)

2. **Cliente**
   - NIT único y válido
   - Teléfono en formato válido
   - Email válido (opcional)

3. **Producto**
   - Nombre único por categoría y talla
   - Precio ≥ Costo
   - Stock ≥ 0

4. **Pedido**
   - Mínimo 1 detalle
   - Cliente debe existir
   - Productos deben tener stock disponible

5. **DetallePedido**
   - Cantidad > 0
   - Producto debe existir
   - PrecioUnitario guardado al crear (histórico)

---

## 🚀 Escalabilidad Futura

### Posibles Extensiones

1. **Proveedores**
   - Trazabilidad de costos
   - Negociación de precios

2. **Historial de Precios**
   - Auditoría de cambios
   - Análisis de tendencias

3. **Descuentos y Promociones**
   - Descuentos por volumen
   - Cupones y ofertas

4. **Seguimiento de Envíos**
   - Integración con courrier
   - Tracking en tiempo real

5. **Reportes Avanzados**
   - BI y Data Warehouse
   - Predicciones con ML

---

## 📝 Notas de Diseño

✅ **Fortalezas:**
- Modelo normalizado (3FN)
- Relaciones claras y bien definidas
- Auditoría con timestamps
- Soporte para desnormalización (objeto cliente en pedido)

⚠️ **Consideraciones:**
- Stock en tiempo real podría requerir transacciones
- Precios históricos guardados en DetallePedido
- Roles con permisos flexibles para escalabilidad

---

**Última actualización**: 22 de febrero de 2026

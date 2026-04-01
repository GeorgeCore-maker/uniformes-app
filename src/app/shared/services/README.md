# Servicios CRUD Unificados

Este documento explica cómo utilizar el sistema de servicios CRUD unificados implementado en la carpeta `shared/services`.

## Arquitectura

### Servicio Base: `CrudService`
El servicio principal que maneja todas las operaciones CRUD básicas de forma genérica:

```typescript
import { CrudService } from './shared/services/crud.service';

// Obtener todos los registros
crudService.obtenerTodos<Cliente>('clientes', { habilitado: true });

// Obtener por ID
crudService.obtenerPorId<Cliente>('clientes', 1);

// Crear nuevo registro
crudService.crear<Cliente>('clientes', nuevoCliente);

// Actualizar registro
crudService.actualizar<Cliente>('clientes', 1, datosActualizados);

// Eliminar (lógico)
crudService.eliminar('clientes', 1);
```

### Servicios Especializados
Los servicios especializados extienden el `CrudService` con funcionalidades específicas de cada entidad:

- `ClienteService` - Operaciones específicas de clientes
- `ProductoService` - Operaciones específicas de productos  
- `PedidoService` - Operaciones específicas de pedidos
- `ProduccionService` - Operaciones específicas de producción

## Características

### 1. Operaciones CRUD Estándar
```typescript
// Crear
const cliente = await clienteService.crear({
  nombre: 'Juan Pérez',
  email: 'juan@email.com'
});

// Leer
const clientes = await clienteService.obtenerTodos();
const cliente = await clienteService.obtenerPorId(1);

// Actualizar
const clienteActualizado = await clienteService.actualizar(1, {
  nombre: 'Juan Carlos Pérez'
});

// Eliminar (lógico)
await clienteService.eliminar(1);
```

### 2. Filtros Avanzados
```typescript
// Filtros básicos
const filtros: FiltroOptions = {
  habilitado: true,
  estado: 'PENDIENTE'
};

// Usar filtros
const pedidos = await crudService.obtenerTodos<Pedido>('pedidos', filtros);
```

### 3. Búsqueda
```typescript
// Buscar clientes por nombre, email, etc.
const resultados = await clienteService.buscar('Juan');

// Buscar productos por nombre, descripción, etc.
const productos = await productoService.buscar('uniforme');
```

### 4. Paginación
```typescript
const respuesta = await crudService.obtenerPaginado<Cliente>(
  'clientes',
  1,      // página
  10,     // límite
  { habilitado: true }  // filtros
);

console.log(respuesta.data);      // Array de clientes
console.log(respuesta.total);     // Total de registros
console.log(respuesta.pagina);    // Página actual
```

### 5. Estadísticas
```typescript
// Estadísticas de clientes
const stats = await clienteService.obtenerEstadisticas();
console.log(stats.total);    // Total de clientes
console.log(stats.activos);  // Clientes activos
console.log(stats.inactivos); // Clientes inactivos

// Estadísticas de productos
const productStats = await productoService.obtenerEstadisticas();
console.log(productStats.stockBajo);           // Productos con stock bajo
console.log(productStats.valorTotalInventario); // Valor total del inventario
```

## Funcionalidades Específicas por Servicio

### ClienteService
```typescript
// Validar NIT existente
const nitExiste = await clienteService.validarNitExistente('12345678-9');

// Obtener incluyendo deshabilitados
const todosLosClientes = await clienteService.obtenerTodosIncluirDeshabilitados();

// Restaurar cliente eliminado
await clienteService.restaurar(1);
```

### ProductoService
```typescript
// Productos por categoría
const uniformes = await productoService.obtenerPorCategoria('UNIFORMES_ESCOLARES');

// Productos con stock bajo
const stockBajo = await productoService.obtenerConStockBajo();

// Productos que requieren confección
const paraConfeccion = await productoService.obtenerQueRequierenConfeccion();

// Actualizar stock
await productoService.actualizarStock(1, 50);

// Filtros avanzados
const productsFiltrados = await productoService.obtenerConFiltros({
  categoria: 'UNIFORMES_ESCOLARES',
  talla: 'M',
  precioMin: 50000,
  precioMax: 100000
});
```

### PedidoService
```typescript
// Pedidos por estado
const pendientes = await pedidoService.obtenerPendientes();
const terminados = await pedidoService.obtenerCompletados();

// Pedidos de un cliente
const pedidosCliente = await pedidoService.obtenerPorCliente(5);

// Estadísticas completas
const estadisticas = await pedidoService.obtenerEstadisticas();
console.log(estadisticas.valorTotal);     // Valor total de todos los pedidos
console.log(estadisticas.valorPendiente); // Valor de pedidos pendientes

// Filtros avanzados
const pedidosFiltrados = await pedidoService.obtenerConFiltros({
  clienteId: 5,
  fechaDesde: '2026-01-01',
  fechaHasta: '2026-12-31',
  montoMin: 100000
});
```

### ProduccionService
```typescript
// Items por estado
const itemsPendientes = await produccionService.obtenerPendientes();
const itemsEnConfeccion = await produccionService.obtenerEnConfeccion();

// Cambiar estado de producción
await produccionService.cambiarEstado(item, EstadoPedido.EN_CONFECCION);

// Items de un pedido específico
const itemsPedido = await produccionService.obtenerPorPedido(5);

// Sincronizar datos
await produccionService.sincronizarDetalleItem(item);

// Estadísticas de producción
const statsProduccion = await produccionService.obtenerEstadisticas();
console.log(statsProduccion.porProducto); // Cantidad por producto
```

## Manejo de Errores

Todos los servicios incluyen manejo de errores unificado:

```typescript
try {
  const cliente = await clienteService.obtenerPorId(1);
} catch (error) {
  console.error('Error al obtener cliente:', error);
  // El error se registra automáticamente
  // La aplicación continúa funcionando
}
```

## Migración de Servicios Existentes

Para migrar servicios existentes:

1. **Mantener compatibilidad**: Crear un wrapper que use los nuevos servicios
2. **Actualizar componentes gradualmente**: Cambiar las importaciones
3. **Eliminar servicios antiguos**: Una vez migrados todos los usos

### Ejemplo de migración:
```typescript
// Antes (servicio antiguo)
import { ClienteService } from './cliente.service';

// Después (servicio unificado)
import { ClienteService } from '../shared/services/cliente.service';
```

## Ventajas del Sistema Unificado

1. **Consistencia**: Todas las operaciones CRUD siguen el mismo patrón
2. **Mantenibilidad**: Un solo lugar para lógica común (errores, metadata, etc.)
3. **Reutilización**: Funcionalidades compartidas entre todas las entidades
4. **Extensibilidad**: Fácil agregar nuevas funcionalidades a todas las entidades
5. **Tipado**: TypeScript garantiza la seguridad de tipos
6. **Rendimiento**: Optimizaciones centralizadas benefician a toda la aplicación

## Próximos Pasos

1. Migrar componentes para usar los nuevos servicios
2. Implementar cacheing en el `CrudService`
3. Agregar validaciones centralizadas
4. Implementar audit trail automático
5. Agregar soporte para transacciones

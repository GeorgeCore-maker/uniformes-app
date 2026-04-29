# Copilot Instructions for Uniformes App

## Contexto del proyecto

Aplicación Angular 18 para gestión de confección de uniformes con sistema RBAC, sincronización en tiempo real entre componentes, y backend Express+Prisma+SQLite.

**Stack tecnológico:**
- Angular 18.2.21 (standalone components)
- Express.js + Prisma ORM + SQLite
- Angular Material + Tailwind CSS
- jsPDF + XLSX para exportación

## Arquitectura específica del proyecto

### Backend-Frontend Split
- **Backend**: Express.js en puerto 3001 (`server/prisma-api.js`)
- **API Convention**: Todos los endpoints usan prefijo `/api/` 
- **Base de datos**: SQLite con Prisma ORM (`prisma/uniformes.db`)
- **Desarrollo**: `npm run dev` inicia API y Angular simultáneamente

### Estructura de componentes
```
src/app/
├── shared/
│   ├── shared.module.ts          # 40+ módulos Material consolidados
│   ├── services/crud.service.ts  # CRUD genérico para todas las entidades
│   └── layout/layout.component.ts # Layout con menú basado en roles
├── core/
│   ├── guards/                   # AuthGuard + RoleGuard
│   ├── interceptors/             # AuthInterceptor + ErrorInterceptor
│   └── services/                 # NotificationService, ExportService, InactivityService
└── {feature-modules}/            # Módulos lazy-loaded
```

### Patrones críticos de desarrollo

#### 1. Arquitectura de servicios
**Patrón CrudService**: Base genérica para todas las entidades
```typescript
// Usar CrudService para operaciones básicas
crudService.obtenerTodos<Cliente>('clientes', { habilitado: true });
crudService.crear<Producto>('productos', nuevoProducto);

// Servicios especializados extienden CrudService
export class ClienteService {
  constructor(private crudService: CrudService) {}
  validarNitExistente(nit: string): Observable<boolean> { /* lógica específica */ }
}
```

#### 2. Comunicación cross-component
**EventosService**: Comunicación reactiva entre módulos pedidos ↔ producción
```typescript
// En componente pedidos
this.eventosService.emitirPedidoActualizado(pedidoId, detalleId, nuevoEstado);

// En componente producción
this.eventosService.pedidoActualizado$.subscribe(() => {
  this.cargarItemsProduccion();
});
```

#### 3. Control de acceso basado en roles
**Filtrado dinámico de menú**: Navigation se filtra automáticamente por rol
```typescript
navLinks = [
  { label: 'Producción', route: '/produccion', roles: ['OPERARIO', 'ADMIN'] },
  { label: 'Inventario', route: '/inventario', roles: ['ADMIN'] }
];

get navLinksFiltered() {
  return this.navLinks.filter(link => 
    !link.roles || this.authService.hasAnyRole(link.roles)
  );
}
```

#### 4. Convenciones de base de datos
- **Soft Delete**: Todas las entidades usan `habilitado: boolean` + `fechaDeshabilitado`
- **Metadata**: `createdAt`, `updatedAt` auto-agregados
- **Foreign Keys**: Schema Prisma con relaciones (Cliente → Pedido → DetallePedido → ItemProduccion)

### Flujos de trabajo críticos

**Build & Development:**
```bash
npm run dev          # API (3001) + Angular (4200) concurrente
npm run dev:api      # Solo backend (Prisma + Express)
npm run build:prod   # Build optimizado con budget limits
```

**Database Operations:**
```bash
npm run db:seed:simple    # Seed para deployment
npm run db:seed           # Seed completo con datos complejos
npx prisma studio         # GUI de base de datos
```

### Integraciones específicas

#### Sistema de autenticación
1. Login → AuthService → localStorage (token/role)
2. AuthGuard valida token, RoleGuard verifica permisos
3. AuthInterceptor añade Bearer token, ErrorInterceptor maneja 401/403

#### Sistema de exportación
**jsPDF + XLSX**: Información de cliente embebida en headers PDF
```typescript
exportService.exportarPedidoAPdf(pedido, cliente);  // PDF con info cliente
exportService.exportarPedidosAExcel(pedidos, 'filename'); // Excel con fórmulas
```

#### Sistema de notificaciones
**MatSnackBar centralizado**: Estilos por tipo, timers auto-dismiss
```typescript
notificationService.success('Operación exitosa');
notificationService.error('Error validación', { duration: 6000 });
```

#### Detección de inactividad
**Timeout 5 minutos**: Monitorea 6 tipos de eventos, clock visual en layout
```typescript
inactivityService.startMonitoring(); 
inactivityService.timeRemaining$.subscribe(time => { /* mostrar reloj */ });
```

---

## Convenciones específicas del proyecto

### Componentes standalone
Todos los componentes nuevos deben ser standalone con SharedModule:
```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './feature.component.html'
})
```

### Modelos TypeScript
Interfaces compartidas en `src/app/shared/models/models.ts`:
- Naming consistente: `Cliente`, `Pedido`, `DetallePedido`, `ItemProduccion`
- Campos metadata opcionales: `createdAt?`, `updatedAt?`, `habilitado?`

### Manejo global de errores
Via `ErrorInterceptor`:
- Errores HTTP auto-muestran notificaciones
- Redirects basados en roles (401 → login, 403 → unauthorized)
- Console logging para debugging

### Optimización de bundle
- **Límites de budget**: 5MB inicial, 10kB estilos componente
- **SCSS optimizado**: Estilos consolidados, reglas redundantes removidas
- **Monitor**: `npm run analyze:bundle` para seguimiento de tamaño

---

# Objetivo de Copilot en este proyecto

Tu rol es ayudar a mejorar:

calidad del código
arquitectura Angular
experiencia del usuario
rendimiento
mantenibilidad

No confirmes automáticamente las suposiciones del usuario. Analiza cada propuesta antes de responder.

Si detectas errores conceptuales, explícalos y sugiere una mejor alternativa.

---

# Forma de responder

Usa lenguaje claro y directo.

Explica lo necesario para entender la mejora propuesta.
Evita explicaciones largas innecesarias.

Cuando propongas cambios:

explica el motivo
muestra el código corregido
mantén compatibilidad con Angular 18

Si falta información sobre un issue, pide contexto antes de sugerir cambios.

---

# Forma de trabajar con issues

Trabajamos un issue a la vez.

No propongas refactorizaciones grandes si no son necesarias.

Prefiere:

mejoras pequeñas
cambios incrementales
correcciones puntuales

Si una solución es compleja:

divídela en pasos claros.

---

# Reglas de arquitectura Angular

**Arquitectura establecida en el proyecto:**

```
src/app/
├── shared/          # SharedModule + CrudService + modelos
├── core/           # Guards, interceptors, servicios globales  
├── auth/           # Sistema de autenticación
├── {features}/     # Módulos lazy-loaded (clientes, pedidos, etc.)
└── layout/         # Layout principal con menú dinámico
```

**Patrones obligatorios:**
- Componentes standalone con `SharedModule`
- Servicios que extienden `CrudService` para entidades
- Lazy loading con guards (`AuthGuard` + `RoleGuard`)
- Comunicación entre módulos via `EventosService`

**Evitar:**
- Lógica HTTP directa en componentes (usar CrudService)
- Hardcodear rutas API (usar convención `/api/{entity}`)
- Components no-standalone (migración en progreso)

---

# Buenas prácticas obligatorias

Usar:

TypeScript estricto
interfaces para modelos
servicios desacoplados
RxJS correctamente
formularios reactivos
guards para seguridad

Evitar:

componentes gigantes
lógica HTTP en componentes
duplicación de código
acoplamiento entre módulos

---

# Manejo de errores

**Global error handling** via `ErrorInterceptor` automático.

**Para APIs custom** usar patrón del proyecto:

```ts
// Patrón CrudService (ya implementado)
return this.http.get<T>(url).pipe(
  catchError(this.manejarError<T>('operación'))
);

// Para notificaciones específicas
this.notificationService.error('Mensaje específico', { duration: 6000 });
```

**Errores de validación** usar NotificationService integrado:
- `success()`, `error()`, `warning()`, `info()` 
- Auto-styling por tipo
- Auto-dismiss configurable

---

# Estándar de código

Preferir funciones pequeñas.

Nombres claros para variables y métodos.

Ejemplo correcto

```
getActiveOrders()
calculateOrderTotal()
loadClients()
```

Evitar nombres genéricos como:

data
item
temp

---

# Estilos

Los estilos deben:

estar en archivos .scss
no usar css plano

Deben ser responsivos.

Usar Tailwind para layout y utilidades.
Usar Angular Material para componentes visuales.

**Optimización de bundle:**
- Mantener estilos de componente bajo 10kB
- Consolidar reglas repetitivas
- Evitar estilos inline o duplicados

Evitar estilos inline.

---

# Experiencia de usuario

Toda mejora debe considerar:

usabilidad
rendimiento
accesibilidad

Ejemplos:

loading states
mensajes claros
validaciones de formularios
feedback visual al usuario

---

# Compatibilidad

Todas las sugerencias deben funcionar con:

Angular 18
RxJS compatible con Angular 18
Angular Material actual

No proponer librerías obsoletas.

**Específico del proyecto:**
- Usar patrones establecidos: CrudService, EventosService, NotificationService
- Mantener compatibilidad con Prisma schema existente
- Respetar convenciones de API (`/api/` prefix)

---

# Propuestas de cambios

Cuando sugieras modificaciones:

No reescribas módulos completos.

Enfócate en:

fragmentos de código
mejoras específicas
optimización del código existente

Incluye comentarios breves en el código solo cuando ayuden a entender el cambio.

---

# Documentación

No crear documentos adicionales a menos que el usuario lo pida explícitamente.

---

# Git

No realizar commits.

No sugerir flujos de git a menos que el usuario lo solicite.

---

# Si un problema no está claro

Haz preguntas antes de responder.

Ejemplos:

qué componente está involucrado
qué servicio llama la API
qué error aparece en consola

---

# Prioridades del proyecto

1 claridad del código
2 estabilidad
3 escalabilidad
4 experiencia del usuario

---

# Tipo de respuestas esperadas

Buenas respuestas incluyen:

análisis del problema
riesgos del enfoque actual
mejor alternativa
ejemplo de código compatible con Angular 18

Respuestas malas incluyen:

respuestas genéricas
explicaciones vagas
código sin contexto del proyecto

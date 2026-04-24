# Uniformes App 👔

Aplicación web Angular 18 para gestión integral de uniformes con sistema de roles personalizados, autorización basada en roles (RBAC) y características avanzadas de exportación de datos.

## � Demo en Vivo

**🚀 Aplicación desplegada:** https://georgecor-maker.github.io/uniformes-app/

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

## �🎯 Características Principales

### 1. **Sistema de Autenticación y Autorización**
- Autenticación por usuario/contraseña
- Roles predefinidos: ADMIN, VENDEDOR, OPERARIO
- Roles personalizados creables por ADMIN
- Guards de ruta basados en roles
- Página de error 403 Unauthorized

### 2. **Gestión de Usuarios y Roles**
- Crear, editar y eliminar usuarios (ADMIN)
- Asignar roles a usuarios dinámicamente
- Crear roles personalizados con permisos específicos
- Gestión de permisos granular (20+ permisos disponibles)
- Activar/desactivar usuarios y roles

### 3. **Exportación de Datos**
- **Exportar Pedidos a PDF**: Documento profesional con jsPDF
- **Exportar Pedidos a Excel**: Archivo XLSX con formato y estilos
- **Exportar Detalles de Pedidos a Excel**: Con información completa de productos

### 4. **Filtrado Avanzado de Ventas**
- Filtrar por rango de fechas personalizado
- Opciones predefinidas: Últimos 7 días, últimos 30 días, mes actual, año actual
- Estadísticas de ventas por período
- Análisis de ventas por día y por cliente

### 5. **Sistema de Notificaciones**
- Snackbars con 4 tipos: Success, Error, Warning, Info
- Auto-dismiss con temporizador configurable
- Posicionamiento personalizable
- Estilos diferenciados por tipo

### 6. **Manejo Global de Errores**
- Interceptor HTTP que captura errores automáticamente
- Manejo específico para códigos: 400, 401, 403, 404, 409, 422, 429, 500+
- Notificaciones automáticas de error
- Redirección automática en caso de sesión expirada

### 7. **Dashboard Analytics**
- Indicadores principales (pedidos totales, ingresos, etc.)
- Gráficos de ventas diarias
- Top clientes por volumen de compra
- Estadísticas por período de tiempo

### 8. **Menú Dinámico Basado en Roles**
- Los menús se muestran/ocultan según el rol del usuario
- Producción: Solo OPERARIO y ADMIN
- Inventario: Solo ADMIN
- Administración: Solo ADMIN
- Módulos accesibles según permisos

## 🚀 Tecnologías

- **Angular 18.2.14**: Framework principal con componentes standalone
- **Angular Material 18.2.14**: Componentes UI (Table, Dialog, Datepicker, etc.)
- **TypeScript 5.5**: Tipado estricto
- **RxJS**: Manejo reactivo de datos
- **jsPDF + XLSX**: Exportación de datos
- **json-server**: Backend mock
- **SCSS**: Estilos avanzados

## 📋 Prerrequisitos

- Node.js 20.x o superior
- npm 10.x o superior
- Angular CLI 18.x

## 💻 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/GeorgeCore-maker/uniformes-app.git
cd uniformes-app

# Instalar dependencias
npm install

# Iniciar el servidor backend (json-server)
npm run server

# En otra terminal, iniciar la aplicación Angular
npm start

# La aplicación estará disponible en http://localhost:4200
```

## 🔐 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| vendedor | vendedor123 | VENDEDOR |
| operario | operario123 | OPERARIO |

## 📁 Estructura de Carpetas

```
src/app/
├── auth/                    # Módulo de autenticación
│   ├── login/              # Componente de login
│   ├── registro/           # Componente de registro
│   └── auth.service.ts     # Servicio de autenticación
├── core/                    # Servicios y guards centrales
│   ├── guards/             # Guards de ruta
│   ├── interceptors/       # Interceptores HTTP
│   ├── services/           # Servicios compartidos
│   └── pages/              # Páginas especiales (404, 403, etc)
├── shared/                  # Componentes y modelos compartidos
│   ├── layout/             # Componente de layout/sidenav
│   └── models/             # Modelos e interfaces
├── administracion/          # Módulo de administración (ADMIN)
│   ├── gestion-roles/      # Gestión de roles personalizados
│   └── gestion-usuarios/   # Gestión de usuarios
├── dashboard/              # Dashboard con analytics
├── pedidos/                # Gestión de pedidos
├── clientes/               # Gestión de clientes
├── productos/              # Gestión de productos
├── inventario/             # Gestión de inventario
└── produccion/             # Módulo de producción
```

## 🔧 Servicios Principales

### AuthService
```typescript
login(username: string, password: string): Observable<boolean>
logout(): void
getRole(): UserRole | string | null
isAuthenticated(): boolean
hasRole(role: UserRole): boolean
hasAnyRole(roles: (UserRole | string)[]): boolean
```

### ExportService
```typescript
exportarPedidoAPdf(pedido: Pedido): void
exportarPedidosAExcel(pedidos: Pedido[]): void
exportarDetallesPedidoAExcel(detalles: DetallePedido[]): void
```

### NotificationService
```typescript
success(mensaje: string, duracion?: number): void
error(mensaje: string, duracion?: number): void
warning(mensaje: string, duracion?: number): void
info(mensaje: string, duracion?: number): void
```

### RolService
```typescript
obtenerTodos(): Observable<Rol[]>
crear(rol: Rol): Observable<Rol>
actualizar(id: number, rol: Rol): Observable<Rol>
eliminar(id: number): Observable<void>
obtenerPermisosDisponibles(): any[]
```

### UsuarioService
```typescript
obtenerTodos(): Observable<Usuario[]>
crear(usuario: Usuario): Observable<Usuario>
actualizar(id: number, usuario: Usuario): Observable<Usuario>
eliminar(id: number): Observable<void>
cambiarRol(usuarioId: number, nuevoRol: string): Observable<Usuario>
cambiarEstado(usuarioId: number, activo: boolean): Observable<Usuario>
```

## 📊 Modelos de Datos

### Usuario
```typescript
interface Usuario {
  id: number;
  username: string;
  password: string;
  email?: string;
  role: UserRole | string;
  rolId?: number;
  token?: string;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Rol
```typescript
interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: string[];
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Pedido
```typescript
interface Pedido {
  id: number;
  clienteId: number;
  numero: string;
  estado: EstadoPedido;
  detalles: DetallePedido[];
  subtotal: number;
  impuesto?: number;
  total: number;
  margen?: number;
  fechaCreacion: Date;
  observaciones?: string;
}
```

## 🎨 Componentes Principales

### Layout Component
Proporciona estructura general con sidenav, toolbar y menú dinámico basado en roles.

### Gestion-Roles Component
Tabla de roles con opciones para crear, editar y eliminar roles personalizados.

### Gestion-Usuarios Component
Gestión completa de usuarios con asignación de roles dinámicos.

### Dashboard-Ventas Component
Indicadores y gráficos de ventas con análisis por período.

## 🔐 Roles y Permisos

### Permisos Disponibles (20+)
- ver_dashboard
- crear_pedido, editar_pedido, eliminar_pedido
- ver_inventario, editar_inventario
- ver_produccion, editar_produccion
- ver_clientes, crear_cliente, editar_cliente, eliminar_cliente
- ver_usuarios, crear_usuario, editar_usuario, eliminar_usuario
- ver_roles, crear_rol, editar_rol, eliminar_rol

### Roles Predefinidos

**ADMIN**: Acceso total a todos los módulos y permisos.

**VENDEDOR**: Acceso a dashboard, pedidos y clientes.

**OPERARIO**: Acceso a producción e inventario.

**GERENTE**: Acceso casi completo excepto gestión de usuarios.

**SUPERVISOR**: Acceso de solo lectura a reportes.

## 🚀 Scripts Disponibles

```bash
# Iniciar aplicación en desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar pruebas
npm test

# Iniciar json-server (backend)
npm run server

# Ejecutar linting
npm run lint
```

## 📝 Base de Datos (json-server)

El archivo `db.json` contiene:
- **users**: Usuarios del sistema
- **roles**: Roles disponibles
- **clientes**: Clientes
- **productos**: Catálogo de productos
- **pedidos**: Pedidos realizados

## 🐛 Bugs Conocidos y Fixes

### Bug: Producción muestra componente de login
**Solución**: Actualizado RoleGuard para soportar múltiples roles en rutas.

### Bug: Menú no se filtra por rol
**Solución**: Implementado getter `navLinksFiltered` en LayoutComponent.

## 🔄 Control de Versiones

El proyecto usa Git con GitHub para control de versiones.

```bash
# Ver historial de commits
git log

# Ver estado actual
git status

# Crear rama para nuevas características
git checkout -b feature/nueva-caracteristica

# Subir cambios
git push origin main
```

## 📚 Documentación Adicional

Ver [SETUP.md](./SETUP.md) para instrucciones de configuración detalladas.

## 👨‍💻 Autor

**GeorgeCore-maker** - Desarrollo de aplicación Angular con roles personalizados

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para reportar problemas o sugerencias, por favor abre un issue en GitHub.

---

**Última actualización**: 22 de febrero de 2026

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

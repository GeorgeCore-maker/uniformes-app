# Uniformes App - MVP

Aplicación web MVP para la venta y confección de uniformes escolares, trajes médicos y dotación para servicios generales.

## Arquitectura

- **Angular 18** con standalone components
- **TypeScript** para tipificación fuerte
- **Angular Material** para componentes UI
- **json-server** para backend simulado
- **Lazy Loading** en módulos
- **Guards** para protección de rutas

## Instalación

```bash
# Instalar dependencias del proyecto
npm install

# Instalar json-server globalmente (si no lo está)
npm install -g json-server
```

## Ejecutar el proyecto

### Terminal 1: Backend simulado (json-server)
```bash
# Desde la raíz del proyecto
json-server --watch db.json --port 3000
```

### Terminal 2: Servidor de desarrollo Angular
```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

## Credenciales de prueba

### Admin
- **Usuario**: admin
- **Contraseña**: admin123
- **Rol**: ADMIN

### Vendedor
- **Usuario**: vendedor
- **Contraseña**: vendedor123
- **Rol**: VENDEDOR

### Operario
- **Usuario**: operario
- **Contraseña**: operario123
- **Rol**: OPERARIO

## Estructura del proyecto

```
src/app/
├── core/                    # Módulo core (singleton)
│   ├── interceptors/        # Interceptores HTTP
│   ├── guards/              # Guards de autenticación y autorización
│   ├── services/            # Servicios globales
│   └── core.module.ts
├── shared/                  # Módulo compartido
│   ├── components/          # Componentes compartidos
│   ├── directives/          # Directivas personalizadas
│   ├── pipes/               # Pipes personalizados
│   └── shared.module.ts
├── auth/                    # Módulo de autenticación (lazy loading)
│   ├── login/
│   ├── registro/
│   ├── models/              # Modelos de usuario
│   └── auth.service.ts
├── dashboard/               # Dashboard (lazy loading)
├── clientes/                # Gestión de clientes (lazy loading)
├── productos/               # Gestión de productos (lazy loading)
├── pedidos/                 # Gestión de pedidos (lazy loading)
├── produccion/              # Producción (lazy loading)
├── inventario/              # Inventario (lazy loading)
└── app.module.ts
```

## Características implementadas

- ✅ Autenticación con JWT simulado
- ✅ Persistencia de sesión en localStorage
- ✅ Roles: ADMIN, VENDEDOR, OPERARIO
- ✅ Guards de autenticación y autorización
- ✅ Interceptor HTTP para manejo de tokens
- ✅ Servicio base abstracto para CRUD
- ✅ Backend simulado con json-server
- ✅ Componentes standalone
- ✅ Lazy Loading en módulos

## Próximos pasos

1. Implementar módulos de características (clientes, productos, etc.)
2. Crear componentes de listado y CRUD
3. Integrar Angular Material para UI mejorada
4. Agregar validaciones con Reactive Forms
5. Implementar servicios específicos por módulo
6. Configurar Angular Material theming personalizado

## Migración a Supabase o Firebase

El servicio de autenticación está diseñado para facilitar la migración:

1. **AuthService**: Solo cambiar el endpoint de la API y el manejo del token
2. **Modelos**: Los modelos `User` y `AuthResponse` están definidos en `models/user.model.ts`
3. **Interceptor**: El `AuthInterceptor` ya maneja la inyección del token en los headers

Para migrar a Supabase o Firebase:
- Reemplazar las llamadas HTTP en `AuthService` con las del proveedor
- Actualizar los modelos si es necesario
- Los guards y componentes no necesitan cambios

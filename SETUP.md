# Uniformes App - Sistema de Gestión de Confecciones

Aplicación web completa para la gestión de uniformes escolares, trajes médicos y dotación empresarial. Incluye gestión de clientes, productos, pedidos, producción e inventario.

## 🏗️ Arquitectura

- **Angular 18** con standalone components
- **TypeScript** para tipificación fuerte  
- **Angular Material** para componentes UI
- **Prisma ORM** con SQLite para base de datos
- **Express.js** para backend API REST
- **Sistema de autenticación** con detección de inactividad
- **Exportación PDF/Excel** integrada
- **Sincronización en tiempo real** pedidos-producción

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **Git** - [Descargar aquí](https://git-scm.com/)
- **Angular CLI** (recomendado):
  ```bash
  npm install -g @angular/cli
  ```

## 🚀 Instalación desde GitHub

### 1️⃣ Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/GeorgeCore-maker/uniformes-app.git

# Entrar al directorio del proyecto
cd uniformes-app
```

### 2️⃣ Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install
```

### 3️⃣ Configurar Base de Datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear y configurar la base de datos SQLite
npx prisma migrate deploy

# Poblar con datos de prueba (opcional pero recomendado)
node prisma/seed.js
```

### 4️⃣ Ejecutar el Proyecto

**Opción A: Modo Desarrollo (2 terminales)**

Terminal 1 - Backend:
```bash
node server/prisma-api.js
```

Terminal 2 - Frontend:
```bash
npm start
```

**Opción B: Un solo comando (recomendado)**
```bash
npm run dev
```

### 5️⃣ Acceder a la Aplicación

- **Aplicación Web**: `http://localhost:4200`
- **API Backend**: `http://localhost:3001`
- **Base de Datos (Prisma Studio)**: `npx prisma studio` → `http://localhost:5555`

## 🔑 Credenciales de Acceso

```
👤 Usuario: admin
🔒 Contraseña: admin123
🔧 Rol: Administrador completo
```

## 🌐 Despliegue como Página Web

### Opción 1: GitHub Pages (Solo Frontend)

1. **Compilar para producción:**
   ```bash
   npm run build
   ```

2. **Configurar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` o `main`
   - Folder: `/docs` o `/dist`

3. **Automatizar con GitHub Actions:**
   Crear `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm install
         - name: Build
           run: npm run build
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist/uniformes-app
   ```

### Opción 2: Netlify (Gratuito)

1. **Conectar repositorio:**
   - Ve a [netlify.com](https://netlify.com)
   - "New site from Git" → Selecciona tu repositorio

2. **Configuración de build:**
   ```
   Build command: npm run build
   Publish directory: dist/uniformes-app
   ```

### Opción 3: Vercel (Gratuito)

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Desplegar:**
   ```bash
   vercel --prod
   ```

### Opción 4: Heroku (Backend + Frontend)

1. **Crear `Procfile`:**
   ```
   web: node server/prisma-api.js
   ```

2. **Configurar package.json:**
   ```json
   {
     "scripts": {
       "start": "node server/prisma-api.js",
       "heroku-postbuild": "npm run build"
     }
   }
   ```

3. **Desplegar:**
   ```bash
   heroku create tu-app-name
   git push heroku main
   ```

## 📂 Estructura del Proyecto

```
uniformes-app/
├── 🔧 Backend
│   ├── server/
│   │   └── prisma-api.js          # API REST con Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   ├── uniformes.db           # Base de datos SQLite
│   │   ├── migrations/            # Migraciones de BD
│   │   └── seed.js                # Datos de prueba
│   └── docker/                    # Configuración Docker (futuro)
│
├── 🎨 Frontend (Angular 18)
│   ├── src/app/
│   │   ├── shared/                # 📦 Módulos compartidos
│   │   │   ├── services/          # Servicios CRUD
│   │   │   ├── models/            # Interfaces TypeScript
│   │   │   ├── layout/            # Layout principal
│   │   │   └── shared.module.ts   # 40+ módulos Material
│   │   │
│   │   ├── core/                  # 🔐 Servicios core
│   │   │   ├── guards/            # Protección de rutas
│   │   │   ├── interceptors/      # Interceptores HTTP
│   │   │   └── services/          # Auth, Export, Inactivity
│   │   │
│   │   ├── auth/                  # 🚪 Autenticación
│   │   │   └── login/             # Login con toggle password
│   │   │
│   │   ├── dashboard/             # 📊 Panel principal
│   │   ├── clientes/              # 👥 Gestión de clientes
│   │   ├── productos/             # 📦 Gestión de productos
│   │   ├── pedidos/               # 🛒 Gestión de pedidos
│   │   ├── produccion/            # 🏭 Gestión de producción  
│   │   ├── inventario/            # 📋 Control de inventario
│   │   └── administracion/        # ⚙️ Roles y usuarios
│   │
│   ├── assets/                    # 🖼️ Imágenes y recursos
│   └── environments/              # 🌍 Configuración entornos
│
└── 📄 Configuración
    ├── package.json               # Dependencias y scripts
    ├── angular.json               # Configuración Angular
    ├── tsconfig.json              # Configuración TypeScript
    └── README.md                  # Documentación
```

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación
- ✅ Login con validación y toggle de contraseña
- ✅ Detección de inactividad (5 min timeout)
- ✅ Reloj visual de cuenta regresiva
- ✅ Guards de protección por roles
- ✅ Persistencia de sesión

### 👥 Gestión de Clientes
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Formularios reactivos con validaciones
- ✅ Búsqueda y filtrado

### 📦 Gestión de Productos
- ✅ Categorías de productos
- ✅ Control de precios y costos
- ✅ Indicador "Requiere Confección"
- ✅ Gestión de inventario integrada

### 🛒 Gestión de Pedidos
- ✅ Creación de pedidos con múltiples productos
- ✅ Cálculo automático con/sin IVA
- ✅ Estados por detalle (Pendiente, En Confección, Terminado)
- ✅ Exportación a PDF y Excel
- ✅ Sincronización con producción

### 🏭 Sistema de Producción
- ✅ Vista de items que requieren confección
- ✅ Cambio de estados en tiempo real
- ✅ Filtrado por estado de producción
- ✅ Sincronización automática con pedidos

### 📊 Exportación e Informes
- ✅ PDF: Comprobante de pedido con logo
- ✅ Excel: Listado de pedidos con cálculos
- ✅ Información del cliente incluida
- ✅ Cálculo correcto de impuestos

### 🎨 Interfaz de Usuario
- ✅ Angular Material Design
- ✅ Responsive design (móvil y desktop)
- ✅ Animaciones y transiciones
- ✅ Menu lateral con estados activos
- ✅ Tema personalizado Uniformes App

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm start              # Frontend (Angular)
npm run backend        # Backend (Prisma API)
npm run dev           # Ambos al mismo tiempo

# Producción
npm run build         # Compilar para producción
npm run build:prod    # Build optimizado

# Base de datos
npm run db:studio     # Abrir Prisma Studio
npm run db:seed       # Poblar datos de prueba
npm run db:reset      # Reiniciar base de datos

# Utilidades
npm test              # Ejecutar tests
npm run lint          # Verificar código
npm run format        # Formatear código
```

## 🔧 Configuración de Entornos

### Desarrollo
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  appName: 'Uniformes App - DEV'
};
```

### Producción
```typescript
// src/environments/environment.prod.ts  
export const environment = {
  production: true,
  apiUrl: 'https://tu-api.herokuapp.com/api',
  appName: 'Uniformes App'
};
```

## 🆘 Solución de Problemas Comunes

### ❌ Error: Puerto en uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### ❌ Error: Base de datos corrupta
```bash
# Reiniciar completamente
rm prisma/uniformes.db
npx prisma migrate deploy
node prisma/seed.js
```

### ❌ Error: Dependencias desactualizadas
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: Build falla
```bash
# Verificar versión Node.js
node --version  # Debe ser 18+

# Limpiar caché Angular
ng cache clean

# Build paso a paso
npm run build -- --verbose
```

## 🚀 Próximos Pasos

### En Desarrollo
- 🔄 Integración con APIs de terceros
- 📱 Progressive Web App (PWA)
- 🔔 Sistema de notificaciones
- 📈 Dashboard con gráficos avanzados
- 🏪 Módulo de punto de venta

### Mejoras Técnicas
- 🐳 Containerización con Docker
- 🧪 Tests automatizados (Jest + Cypress)
- 📊 Monitoreo y analytics
- 🔒 Autenticación OAuth2/OpenID
- 🌐 Internacionalización (i18n)

## 📞 Soporte

- **Repositorio**: [GitHub](https://github.com/GeorgeCore-maker/uniformes-app)
- **Documentación**: Ver carpeta `/docs`
- **Issues**: Reportar problemas en GitHub Issues

---

**Desarrollado con ❤️ para la gestión eficiente de confecciones**

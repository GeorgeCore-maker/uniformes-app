# 🌐 Uniformes App - Despliegue Web

Este documento contiene instrucciones específicas para desplegar Uniformes App como una página web en diferentes plataformas.

## 🚀 Opciones de Despliegue

### 1. GitHub Pages (Gratuito)

#### Método Automático (Recomendado)
1. **Fork o clona el repositorio en tu cuenta de GitHub**
2. **Habilitar GitHub Pages:**
   - Ve a `Settings` → `Pages`
   - Source: `GitHub Actions`
   - El archivo `.github/workflows/deploy.yml` ya está configurado

3. **Push a la rama main:**
   ```bash
   git push origin main
   ```
   
4. **Tu aplicación estará disponible en:**
   ```
   https://tu-usuario.github.io/uniformes-app
   ```

#### Método Manual
```bash
# Compilar para producción
npm run build:prod

# Desplegar con angular-cli-ghpages
npm install -g angular-cli-ghpages
npm run deploy:gh-pages
```

### 2. Netlify (Gratuito + CDN)

#### Opción A: Desde GitHub
1. Ve a [netlify.com](https://netlify.com)
2. "New site from Git" → Conecta tu repositorio
3. **Configuración de build:**
   ```
   Build command: npm run build:prod
   Publish directory: dist/uniformes-app
   ```

#### Opción B: Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login y desplegar
netlify login
npm run deploy:netlify
```

### 3. Vercel (Gratuito)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
npm run deploy:vercel
```

### 4. Firebase Hosting (Gratuito)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto
firebase init hosting

# Configurar en firebase.json:
{
  "hosting": {
    "public": "dist/uniformes-app",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Compilar y desplegar
npm run build:prod
firebase deploy
```

### 5. Surge.sh (Gratuito)

```bash
# Instalar Surge
npm install -g surge

# Compilar
npm run build:prod

# Desplegar
cd dist/uniformes-app
surge . uniformes-app.surge.sh
```

### 6. AWS S3 + CloudFront

```bash
# Instalar AWS CLI
# Configurar credenciales: aws configure

# Compilar
npm run build:prod

# Sync a S3
aws s3 sync dist/uniformes-app s3://tu-bucket-name --delete

# Invalidar CloudFront (opcional)
aws cloudfront create-invalidation --distribution-id TU-DISTRIBUTION-ID --paths "/*"
```

## ⚙️ Configuración para Producción

### 1. Variables de Entorno
Edita `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-api.herokuapp.com/api',
  appName: 'Uniformes App',
  enableAnalytics: true
};
```

### 2. Configuración de Rutas (Angular Router)
Para SPAs, asegúrate de que el servidor redirija todas las rutas a `index.html`.

**Netlify** - crear `public/_redirects`:
```
/*    /index.html   200
```

**Apache** - crear `.htaccess`:
```apache
RewriteEngine On
RewriteRule ^(?!.*\.).*$ /index.html [L]
```

**Nginx** - configurar:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 3. Optimización de Build

```bash
# Build con optimizaciones máximas
ng build --configuration production \
  --optimization \
  --aot \
  --build-optimizer \
  --source-map=false
```

## 🔒 Backend API

**Nota importante:** Para que la aplicación funcione completamente necesitas un backend. Opciones:

### Opción 1: Backend Estático (Solo Frontend)
Configura la app para usar datos mock:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '', // Sin API
  useStaticData: true
};
```

### Opción 2: Backend en Heroku (Gratuito con limitaciones)

```bash
# Crear Procfile
echo "web: node server/prisma-api.js" > Procfile

# Configurar package.json
{
  "scripts": {
    "start": "node server/prisma-api.js",
    "heroku-postbuild": "npm run build:prod && npx prisma generate"
  }
}

# Desplegar
heroku create uniformes-app-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Opción 3: Backend en Railway/Render

Conecta tu repositorio en [railway.app](https://railway.app) o [render.com](https://render.com)

## 📱 Progressive Web App (PWA)

Convertir en PWA para instalación en móviles:

```bash
# Agregar PWA support
ng add @angular/pwa

# Compilar con PWA
npm run build:prod
```

## 📊 Analytics y SEO

### Google Analytics
```typescript
// En index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Meta Tags SEO
```html
<!-- En index.html -->
<meta name="description" content="Sistema de gestión de uniformes escolares y dotación empresarial">
<meta name="keywords" content="uniformes, confección, pedidos, inventario">
<meta property="og:title" content="Uniformes App">
<meta property="og:description" content="Gestión completa de confecciones">
<meta property="og:image" content="https://tu-dominio.com/assets/logo.png">
```

## 🆘 Troubleshooting Despliegue

### Error: Rutas no funcionan
```bash
# Verificar configuración de redirecciones
# Cada plataforma tiene su método específico
```

### Error: Assets no cargan
```typescript
// angular.json - verificar outputPath y deployUrl
"outputPath": "dist/uniformes-app",
"deployUrl": "/uniformes-app/"  // Solo si no está en root
```

### Error: API CORS
```typescript
// En el backend, configurar CORS
app.use(cors({
  origin: ['https://tu-dominio.com', 'http://localhost:4200'],
  credentials: true
}));
```

---

**¡Tu aplicación Uniformes App estará disponible 24/7 en la web! 🌐✨**

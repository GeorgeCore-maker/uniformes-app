# Guía de Solución de Problemas - Despliegue

## Problemas Comunes de Deployment

### 1. Errores de Prisma Seed - Foreign Key Constraints

**Problema:** Error `Foreign key constraint violated` durante el seed
```
Invalid prisma.itemProduccion.create() invocation
Foreign key constraint violated: foreign key
```

**Causa:** Los datos en `db.json` usan IDs hardcodeados que no coinciden con los IDs auto-generados por Prisma.

**Solución:**
1. Usar el `seed-simple.js` para despliegue web
2. Crear objetos y usar sus IDs reales en lugar de hardcodeados
3. Implementar mapeo de IDs para datos complejos

**Código de ejemplo:**
```javascript
// ❌ Incorrecto - ID hardcodeado
clienteId: 1

// ✅ Correcto - ID real del objeto creado
const cliente = await prisma.cliente.create({...});
const pedido = await prisma.pedido.create({
  data: { clienteId: cliente.id, ... }
});
```

### 2. Errores de Tipo de Fecha en Prisma

**Problema:** Error `Expected String or Null, provided DateTime`

**Causa:** El schema SQLite espera fechas como strings ISO, no objetos Date.

**Solución:**
```javascript
// ❌ Incorrecto
fechaCreacion: new Date()

// ✅ Correcto
fechaCreacion: new Date().toISOString()
```

### 3. Fallos de Build en GitHub Actions

**Problema:** El build falla por dependencias o configuración

**Soluciones:**
1. Verificar que `package.json` tenga todos los scripts necesarios
2. Usar `npm ci` en lugar de `npm install` para builds deterministas
3. Asegurar que `angular.json` tenga la configuración de producción

### 4. Problemas de Rutas en GitHub Pages

**Problema:** La aplicación no carga correctamente en GitHub Pages

**Soluciones:**
1. Configurar `<base href="/uniformes-app/">` en `index.html`
2. Usar el flag `--base-href` en el build:
   ```bash
   ng build --configuration production --base-href /uniformes-app/
   ```

### 5. Variables de Entorno Faltantes

**Problema:** La aplicación no puede conectar con APIs o servicios

**Soluciones:**
1. Crear `environments/environment.prod.ts` con URLs de producción
2. Configurar secrets en GitHub si se necesitan API keys
3. Usar URLs relativas para APIs locales

## Scripts de Diagnóstico

### Verificar Build Local
```bash
npm run build:prod
```

### Probar Seed Local
```bash
npm run db:seed:simple
```

### Verificar Prisma
```bash
npx prisma generate
npx prisma db push
```

### Test de Conexión de Base de Datos
```bash
npx prisma studio
```

## Logs Útiles

### GitHub Actions
- Ir a: `https://github.com/[usuario]/uniformes-app/actions`
- Revisar el último workflow run
- Expandir los steps que fallaron para ver logs detallados

### Errores Comunes en Logs
```
Error: Cannot find module 'prisma/seed.js'
→ Verificar que el archivo existe y la ruta es correcta

Foreign key constraint violated
→ Problema con relaciones en el seed, usar seed-simple.js

Build failed: Cannot resolve 'some-module'
→ Instalar dependencias faltantes o verificar imports
```

## Comandos de Emergencia

### Rollback de Deployment
```bash
git revert HEAD
git push origin main
```

### Limpiar y Reiniciar
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

### Deployment Manual Alternativo
```bash
# Si GitHub Actions falla, deploy manual a Netlify
npm run build:prod
npx netlify deploy --prod --dir dist/uniformes-app
```

## Contactos de Soporte

- **Documentación Prisma:** https://www.prisma.io/docs/
- **Angular Deployment:** https://angular.io/guide/deployment
- **GitHub Pages:** https://pages.github.com/

---
*Última actualización: Enero 2025*

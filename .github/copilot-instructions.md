# Copilot Instructions for this repository

## Contexto del proyecto

Esta es una aplicación web para la gestión de un almacén de confecciones.

Tecnologías del proyecto

Angular CLI 18.2.21
Node 18.20.8
TypeScript
Angular Material
Tailwind
SCSS

La aplicación gestiona inventario, pedidos, productos y procesos relacionados con confección y venta de uniformes.

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

Usar arquitectura modular.

Estructura esperada:

src
core
shared
features
layout
environments

Cada feature debe contener:

pages
components
services
models

Aplicar lazy loading en módulos de features.

Evitar lógica de negocio en componentes.

La lógica debe ir en servicios.

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

Toda llamada HTTP debe manejar errores.

Usar:

HttpInterceptor para errores globales.

Ejemplo esperado

```ts
return this.http.get(url).pipe(
  catchError(error => {
    this.loggerService.error(error);
    return throwError(() => error);
  })
);
```

Mostrar errores al usuario con Angular Material Snackbar.

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

# 🚀 Guía de Deployment - Bulk Update Pro

Guía paso a paso para desplegar **Bulk Update Pro** en Monday.com marketplace.

---

## ✅ Pre-requisitos Verificados

- ✅ **Build exitoso**: `npm run build` genera carpeta `dist/`
- ✅ **Paths relativos**: Configurado `base: './'` en vite.config.js
- ✅ **Monday SDK**: Correctamente implementado en useMonday.js
- ✅ **Assets optimizados**: CSS + JS en carpeta `assets/`
- ✅ **Tamaño del bundle**: ~565 KB (dentro de límites)

---

## 📋 Checklist Pre-Deployment

### 1. Verificar Build Local

```bash
cd bulk-update-pro
npm run build
```

**Resultado esperado:**
```
✓ built in ~5s
dist/
  ├── index.html
  └── assets/
      ├── index-[hash].js
      ├── index-[hash].css
      └── main-[hash].js
```

### 2. Verificar Paths en index.html

Abrir `dist/index.html` y verificar:
```html
<script type="module" crossorigin src="./assets/index-[hash].js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-[hash].css">
```

✅ **IMPORTANTE**: Los paths deben empezar con `./` (relativo), NO con `/` (absoluto)

### 3. Verificar package.json

```json
{
  "name": "bulk-update-pro",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "monday-sdk-js": "^0.5.1",
    "monday-ui-react-core": "^2.149.5"
  }
}
```

---

## 🔧 Paso 1: Crear App en Monday Developer Center

### 1.1 Acceder al Developer Center

1. Ve a https://monday.com/developers
2. Haz clic en **"Create App"** o **"My Apps"**
3. Clic en **"Create new app"**

### 1.2 Configuración Básica

**App Information:**
- **App Name**: Bulk Update Pro
- **Short Description**: Actualización masiva de items con validación y control total
- **Long Description**:
  ```
  Bulk Update Pro permite actualizar múltiples items simultáneamente con:
  - Selección inteligente con búsqueda y filtros
  - Validación en tiempo real
  - Preview de cambios antes de aplicar
  - Soporte para 10+ tipos de columnas
  - Resultados detallados con exportación
  ```
- **Category**: Productivity
- **Icon**: Subir logo (512x512px recomendado)

### 1.3 OAuth & Permissions

**Scopes requeridos:**
```
boards:read
boards:write
```

**Opcional (para futuras features):**
```
me:read
workspaces:read
```

---

## 📦 Paso 2: Crear Build de Producción

### 2.1 Build Final

```bash
cd bulk-update-pro
npm run build
```

### 2.2 Crear ZIP

**Windows:**
```bash
# Desde la carpeta bulk-update-pro
cd dist
tar -a -c -f ../bulk-update-pro-v1.0.0.zip *
cd ..
```

**Mac/Linux:**
```bash
cd dist
zip -r ../bulk-update-pro-v1.0.0.zip *
cd ..
```

**IMPORTANTE**: El ZIP debe contener los archivos directamente, NO la carpeta dist.

**Estructura correcta del ZIP:**
```
bulk-update-pro-v1.0.0.zip
├── index.html
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── main-[hash].js
```

**❌ Estructura INCORRECTA:**
```
bulk-update-pro-v1.0.0.zip
└── dist/
    ├── index.html
    └── assets/
```

---

## 🎯 Paso 3: Agregar Feature "Board View"

### 3.1 Crear Feature

1. En el Developer Center, dentro de tu app
2. Clic en **"Features"**
3. **"Add Feature"** → Seleccionar **"Board View"**

### 3.2 Configurar Feature

**Feature Details:**
- **Name**: Bulk Update Pro
- **Description**: Actualización masiva de items
- **Icon**: (opcional) Subir icono personalizado

**Feature Settings:**
- **Hide board controls**: ❌ (dejar desmarcado)
- **Show in**: Board views
- **Title in view**: "Bulk Update Pro"

### 3.3 Configurar URLs (después del upload)

Estas URLs se configuran automáticamente después de subir el build.

---

## 📤 Paso 4: Subir Build

### 4.1 Upload del ZIP

1. Dentro de la feature "Board View"
2. Pestaña **"Builds"**
3. Clic en **"New Build"**
4. **"Upload Build"** → Seleccionar `bulk-update-pro-v1.0.0.zip`
5. Esperar a que termine de subir (~30 segundos)

### 4.2 Verificar Upload

Después del upload exitoso verás:
- ✅ Build ID generado
- ✅ URL del CDN asignada
- ✅ Status: "Ready to test"

---

## 🧪 Paso 5: Testing

### 5.1 Instalar App en un Board de Prueba

1. Abre un board de Monday.com (workspace de desarrollo)
2. En la barra superior, clic en el menú de vistas
3. Busca tu app: "Bulk Update Pro"
4. Clic para instalar

### 5.2 Verificaciones de Testing

**Test 1: Carga Inicial**
- ✅ La app carga sin errores
- ✅ Se muestra el loader mientras carga
- ✅ Los items del board se cargan correctamente

**Test 2: Selección de Items**
- ✅ Búsqueda funciona
- ✅ Filtros avanzados funcionan
- ✅ Selección múltiple funciona
- ✅ "Seleccionar todos" funciona

**Test 3: Selección de Columna**
- ✅ Dropdown muestra columnas editables
- ✅ Input se adapta al tipo de columna
- ✅ Validación en tiempo real funciona

**Test 4: Preview de Cambios**
- ✅ Tabla muestra valores actuales vs nuevos
- ✅ Botones de confirmación/cancelación funcionan

**Test 5: Actualización**
- ✅ Progreso se muestra correctamente
- ✅ Items se actualizan en Monday
- ✅ Notificación de éxito aparece
- ✅ Board se recarga con nuevos valores

**Test 6: Manejo de Errores**
- ✅ Errores de validación se muestran
- ✅ Errores de API se manejan
- ✅ Resultados parciales se exportan

---

## 🐛 Troubleshooting Común

### Problema 1: App no carga / Pantalla en blanco

**Causa**: Paths absolutos en lugar de relativos

**Solución**:
1. Verificar `vite.config.js` tiene `base: './'`
2. Rebuild: `npm run build`
3. Verificar `dist/index.html` usa `./assets/` no `/assets/`
4. Re-crear ZIP y re-subir

### Problema 2: "Failed to fetch context"

**Causa**: Monday SDK no inicializado correctamente

**Solución**:
1. Verificar `useMonday.js` importa `monday-sdk-js`
2. Verificar que se llama a `monday.listen('context')`
3. Verificar permisos OAuth en Developer Center

### Problema 3: "Permission denied" al actualizar

**Causa**: Falta scope `boards:write`

**Solución**:
1. Developer Center → OAuth & Permissions
2. Agregar scope `boards:write`
3. Guardar cambios
4. Re-instalar app en el board

### Problema 4: Rate limit errors

**Causa**: Muchas peticiones simultáneas

**Solución**:
- Ya implementado en `mondayServiceEnhanced.js`
- Usa batching de 5 items con delays
- Si persiste, reducir batchSize a 3

### Problema 5: Assets no cargan (404)

**Causa**: Estructura incorrecta del ZIP

**Solución**:
1. El ZIP debe tener `index.html` en la raíz
2. NO debe tener carpeta `dist/` dentro
3. Recrear ZIP correctamente (ver Paso 2.2)

---

## 📊 Paso 6: Publicación (Opcional)

### 6.1 Testing Completo

Antes de publicar:
- ✅ Testear con diferentes tipos de columnas
- ✅ Testear con 1, 10, 50, 100+ items
- ✅ Testear en diferentes boards
- ✅ Testear manejo de errores
- ✅ Verificar performance

### 6.2 Preparar para Review

**Materiales necesarios:**
- Screenshots de la app (5-10 imágenes)
- Video demo (1-3 minutos)
- Documentación de usuario
- Casos de uso principales

### 6.3 Submit for Review

1. Developer Center → Tu app
2. Pestaña **"Publishing"**
3. **"Submit for review"**
4. Completar formulario con:
   - Descripción detallada
   - Screenshots
   - Video demo
   - Link a documentación
   - Pricing model (Free/Paid)

### 6.4 Review Process

- Tiempo estimado: 1-2 semanas
- Monday.com revisará:
  - Funcionalidad
  - Seguridad
  - UI/UX
  - Performance
  - Compliance

---

## 🔐 Seguridad y Compliance

### Datos Manejados

La app NO almacena datos de usuario:
- ✅ Toda la data vive en Monday.com
- ✅ No hay backend propio
- ✅ No hay base de datos externa
- ✅ SDK maneja autenticación

### GDPR Compliance

- ✅ No almacenamiento de datos personales
- ✅ No tracking de usuarios
- ✅ No cookies externas

---

## 📚 Recursos Adicionales

### Documentación Official
- [Monday Apps Framework](https://developer.monday.com/apps)
- [SDK Documentation](https://github.com/mondaycom/monday-sdk-js)
- [Vibe Design System](https://vibe.monday.com/)

### Soporte
- [Monday Developer Community](https://community.monday.com/c/developers)
- [Stack Overflow - monday-apps](https://stackoverflow.com/questions/tagged/monday-apps)

---

## ✅ Checklist Final de Deployment

Usa este checklist antes de cada deployment:

- [ ] `npm run build` ejecutado sin errores
- [ ] `dist/index.html` usa paths relativos (`./assets/`)
- [ ] ZIP creado correctamente (sin carpeta dist/ interna)
- [ ] App creada en Developer Center
- [ ] Feature "Board View" agregada
- [ ] Scopes OAuth configurados (`boards:read`, `boards:write`)
- [ ] Build subido en pestaña "Builds"
- [ ] App instalada en board de prueba
- [ ] Tests básicos completados
- [ ] Errores manejados correctamente
- [ ] Performance verificada (< 3s carga inicial)
- [ ] Documentación actualizada

---

## 🎉 Deployment Exitoso

Si llegaste aquí, ¡felicitaciones! **Bulk Update Pro** está listo para ser usado en Monday.com.

**Próximos pasos:**
1. Compartir con beta testers
2. Recolectar feedback
3. Iterar y mejorar
4. Publicar en marketplace

---

*Guía creada: 2026-01-08*
*Versión: 1.0*
*Proyecto: Bulk Update Pro*

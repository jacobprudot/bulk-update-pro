# QA Review Prompt for Qwen

Use this prompt to have Qwen perform an exhaustive code review before marketplace submission:

---

## PROMPT:

```
Eres un experto revisor de código especializado en aplicaciones Monday.com y React. Necesito que hagas una revisión exhaustiva del siguiente proyecto antes de someterlo al Monday.com Marketplace.

## Contexto del Proyecto
- **Nombre**: Bulk Update Pro
- **Tipo**: Board View App para Monday.com
- **Función**: Permite actualizar múltiples items de un board simultáneamente
- **Stack**: React 18, Vite, monday-sdk-js, monday-ui-react-core

## Archivos a Revisar

### 1. src/utils/mondayHelpers.js
[PEGAR CONTENIDO DEL ARCHIVO]

### 2. src/services/mondayService.js
[PEGAR CONTENIDO DEL ARCHIVO]

### 3. src/components/ColumnSelector.jsx
[PEGAR CONTENIDO DEL ARCHIVO]

### 4. src/components/ItemSelector.jsx
[PEGAR CONTENIDO DEL ARCHIVO]

### 5. src/components/PreviewChanges.jsx
[PEGAR CONTENIDO DEL ARCHIVO]

### 6. src/App.jsx
[PEGAR CONTENIDO DEL ARCHIVO]

## Checklist de Revisión

Por favor revisa EXHAUSTIVAMENTE los siguientes aspectos:

### 1. API y Formatos de Monday.com
- [ ] Verificar que TODOS los formatos de columnas coincidan con la documentación oficial de Monday.com API
- [ ] Confirmar que los tipos de columna usados son correctos (long-text vs long_text, etc.)
- [ ] Validar que las mutaciones GraphQL tienen la estructura correcta
- [ ] Verificar el manejo de errores en las llamadas API

### 2. Seguridad
- [ ] Buscar vulnerabilidades XSS (especialmente en inputs de usuario)
- [ ] Verificar que no hay inyección de código en las queries GraphQL
- [ ] Confirmar que los datos sensibles no se exponen
- [ ] Revisar el escape correcto de strings en los valores de columna

### 3. Manejo de Errores
- [ ] Verificar try-catch en todas las operaciones async
- [ ] Confirmar que los errores se muestran al usuario de forma clara
- [ ] Revisar edge cases (board vacío, sin columnas editables, etc.)
- [ ] Validar el manejo de valores null/undefined

### 4. Rendimiento
- [ ] Buscar re-renders innecesarios en React
- [ ] Verificar el uso correcto de useMemo/useCallback
- [ ] Revisar si hay memory leaks potenciales
- [ ] Evaluar el comportamiento con muchos items (+500)

### 5. UX/Accesibilidad
- [ ] Verificar que el dark mode funciona correctamente en todos los componentes
- [ ] Confirmar que los estados de loading son claros
- [ ] Revisar que los mensajes de error son útiles
- [ ] Verificar la accesibilidad básica (labels, contraste, etc.)

### 6. Código Limpio
- [ ] Buscar código duplicado que pueda refactorizarse
- [ ] Identificar variables o funciones no utilizadas
- [ ] Revisar la consistencia en el naming
- [ ] Verificar que los comentarios son precisos

### 7. Compatibilidad Monday.com
- [ ] Verificar que se usa el Vibe Design System correctamente
- [ ] Confirmar que los temas (light/dark/black) se manejan bien
- [ ] Revisar que los permisos requeridos son los mínimos necesarios
- [ ] Verificar compatibilidad con diferentes tamaños de board view

## Formato de Respuesta

Por favor proporciona tu análisis en el siguiente formato:

### CRÍTICOS (Deben arreglarse antes de submit)
- [Descripción del problema]
- [Archivo y línea]
- [Solución sugerida]

### IMPORTANTES (Deberían arreglarse)
- [Descripción del problema]
- [Archivo y línea]
- [Solución sugerida]

### MENORES (Nice to have)
- [Descripción del problema]
- [Archivo y línea]
- [Solución sugerida]

### POSITIVOS (Lo que está bien implementado)
- [Aspecto positivo]

### PREGUNTAS
- [Dudas que necesitan clarificación]

Sé muy detallado y específico. Prefiero encontrar los problemas ahora que después del submit al marketplace.
```

---

## Cómo Usar Este Prompt

1. Copia el prompt de arriba
2. Reemplaza [PEGAR CONTENIDO DEL ARCHIVO] con el contenido real de cada archivo
3. Envía a Qwen para revisión
4. Revisa y aplica las correcciones sugeridas
5. Re-ejecuta la revisión hasta que no haya críticos

## Archivos Adicionales a Incluir (Opcional)

- `src/hooks/useMonday.js` - Hook del SDK
- `src/hooks/useDebounce.js` - Hook de debounce
- `src/styles/global.css` - Estilos globales
- `package.json` - Dependencias

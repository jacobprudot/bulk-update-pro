# Bulk Update Pro

Aplicación para Monday.com que permite actualizar múltiples items de un board de forma masiva, ahorrando tiempo y reduciendo errores en tareas repetitivas.

## Características

- **Selección múltiple de items**: Selecciona los items que deseas actualizar con búsqueda integrada
- **Actualización masiva**: Modifica una columna en todos los items seleccionados simultáneamente
- **Preview de cambios**: Revisa los cambios antes de aplicarlos
- **Progreso en tiempo real**: Visualiza el progreso de la actualización
- **Soporte para múltiples tipos de columna**: Text, Numbers, Status, Date, Checkbox, Dropdown, Email, Phone, Link, y más

## Flujo de Trabajo

La app sigue un flujo de 3 pasos:

1. **Seleccionar Items** - Elige los items que deseas actualizar
2. **Columna y Valor** - Selecciona la columna y define el nuevo valor
3. **Confirmar** - Revisa los cambios y aplícalos

## Estructura del Proyecto

```
bulk-update-pro/
├── src/
│   ├── components/
│   │   ├── ItemSelector.jsx       # Selector de items con búsqueda
│   │   ├── ColumnSelector.jsx     # Selector de columna y valor
│   │   └── PreviewChanges.jsx     # Preview de cambios
│   ├── services/
│   │   └── mondayService.js       # Servicios de Monday API
│   ├── hooks/
│   │   └── useMonday.js           # Hook para Monday SDK
│   ├── App.jsx                    # Componente principal
│   └── index.jsx                  # Entry point
├── public/
├── package.json
├── vite.config.js
└── index.html
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

## Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## Uso en Monday.com

### Configuración Inicial

1. Ve a Monday.com Developer Center
2. Crea una nueva app o usa una existente
3. Agrega una feature de tipo "Board View"
4. Configura los permisos necesarios:
   - `boards:read` - Para leer items y columnas
   - `boards:write` - Para actualizar values

### Deployment

1. Ejecuta `npm run build`
2. Comprime el contenido de la carpeta `dist/` en un archivo ZIP
3. Sube el ZIP en la sección "Builds" del Developer Center
4. Publica la versión

### Instalación en un Board

1. Abre el board donde quieres usar la app
2. Haz clic en el menú de la parte superior
3. Selecciona "Instalar app" y busca tu app
4. La app aparecerá como una nueva vista del board

## Componentes

### ItemSelector

Permite seleccionar items del board con las siguientes características:
- Búsqueda en tiempo real
- Selección individual y múltiple
- Contador de items seleccionados

### ColumnSelector

Selector de columna con input dinámico según tipo:
- Text/Long Text: TextField
- Numbers: Input numérico
- Status: Dropdown con opciones del status
- Date: Date picker
- Checkbox: Radio buttons (marcado/desmarcado)
- Dropdown: Dropdown con opciones configuradas
- Email/Phone/Link: Inputs con validación

### PreviewChanges

Tabla de preview que muestra:
- Nombre del item
- Valor actual
- Nuevo valor
- Confirmación/Cancelación

## API de Monday.com

### Queries GraphQL Utilizadas

**Obtener Items:**
```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    items_page {
      items {
        id
        name
        column_values {
          id
          text
          value
          type
        }
      }
    }
  }
}
```

**Obtener Columnas:**
```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    columns {
      id
      title
      type
      settings_str
    }
  }
}
```

**Actualizar Columna:**
```graphql
mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
  change_column_value(
    board_id: $boardId,
    item_id: $itemId,
    column_id: $columnId,
    value: $value
  ) {
    id
  }
}
```

## Utilidades Compartidas

La app utiliza utilidades de la carpeta `shared/utils/`:

- `formatColumnValue()` - Formatea valores según tipo de columna
- `parseColumnValue()` - Parsea valores de Monday
- `validateColumnValue()` - Valida valores antes de enviar
- `getColumnText()` - Obtiene texto visible de una columna

## Mejoras Futuras

- [ ] Soporte para columnas de tipo Person/People
- [ ] Actualización basada en fórmulas/templates
- [ ] Historial de actualizaciones
- [ ] Exportar/Importar configuraciones
- [ ] Undo/Redo de actualizaciones
- [ ] Actualización condicional (si X entonces Y)
- [ ] Programación de actualizaciones

## Tecnologías

- **React 18** - Framework UI
- **Monday SDK JS** - SDK oficial de Monday.com
- **Vibe Design System** (monday-ui-react-core) - Componentes UI
- **Vite** - Build tool

## Licencia

Propietario: JP Rudot

/**
 * Utilidades compartidas para trabajar con Monday.com API
 */

/**
 * Formatea el valor de una columna según su tipo para Monday.com API
 * Basado en: https://developer.monday.com/api-reference/docs/change-column-values
 * @param {string} type - Tipo de columna
 * @param {*} value - Valor a formatear
 * @returns {string} Valor formateado según el tipo
 */
export const formatColumnValue = (type, value) => {
  switch (type) {
    // Text columns: simple string
    case 'text':
      return `"${String(value).replace(/"/g, '\\"')}"`;

    // Long text columns: simple string (same format as text)
    // Monday API can return type as 'long-text' or 'long_text'
    case 'long-text':
    case 'long_text':
      return `"${String(value).replace(/"/g, '\\"')}"`;

    // Status columns: {"label": "status_name"}
    case 'status':
      return JSON.stringify({ label: value });

    // Date columns: {"date": "YYYY-MM-DD"}
    case 'date':
      return JSON.stringify({ date: value });

    // Number columns: simple string number
    case 'numbers':
    case 'numeric':
      return `"${value}"`;

    // Email columns: {"email": "email@example.com", "text": "email@example.com"}
    case 'email':
      return JSON.stringify({ email: value, text: value });

    // Phone columns: {"phone": "123456789", "countryShortName": "US"}
    case 'phone':
      return JSON.stringify({ phone: value, countryShortName: 'US' });

    // Link columns: {"url": "https://...", "text": "Link text"}
    case 'link':
      return JSON.stringify({ url: value, text: value });

    // Dropdown columns: {"labels": ["option_name"]}
    case 'dropdown':
      return JSON.stringify({ labels: [value] });

    // Checkbox columns: {"checked": "true"} or {"checked": "false"}
    case 'checkbox':
      return JSON.stringify({ checked: String(value) });

    // People columns: {"personsAndTeams": [{"id": 123, "kind": "person"}]}
    case 'people':
    case 'multiple-person':
      // If value is already an object array, use it; otherwise convert user ID to proper format
      if (Array.isArray(value)) {
        return JSON.stringify({ personsAndTeams: value });
      }
      // Single user ID - convert to proper format
      return JSON.stringify({
        personsAndTeams: [{ id: parseInt(value), kind: 'person' }]
      });

    // Timeline columns: {"from": "YYYY-MM-DD", "to": "YYYY-MM-DD"}
    case 'timeline':
      return JSON.stringify({ from: value.from, to: value.to });

    // Board relation columns: {"item_ids": [123, 456]}
    case 'board-relation':
      // value can be a single ID or array of IDs
      const itemIds = Array.isArray(value) ? value : [value];
      return JSON.stringify({ item_ids: itemIds.map(id => parseInt(id)) });

    // Time tracking columns: NOT SUPPORTED for updates via API
    // According to Monday.com docs, time_tracking only supports Read and Filter, not Update
    case 'time_tracking':
      console.warn('Time tracking columns cannot be updated via API');
      return null;

    // World clock / timezone: {"timezone": "America/New_York"}
    case 'world-clock':
    case 'timezone':
      return JSON.stringify({ timezone: value });

    // Tags columns: {"tag_ids": ["123", "456"]} - IDs must be strings
    case 'tags':
      const tagIds = Array.isArray(value) ? value : [value];
      return JSON.stringify({ tag_ids: tagIds.map(id => String(id)) });

    // Country columns: {"countryCode": "US", "countryName": "United States"}
    case 'country':
      // Value can be an object with countryCode and countryName, or just a code string
      if (typeof value === 'object' && value.countryCode && value.countryName) {
        return JSON.stringify({ countryCode: value.countryCode, countryName: value.countryName });
      }
      // Fallback: assume value is just the country code
      return JSON.stringify({ countryCode: value, countryName: value });

    // Week columns: {"week": {"startDate": "2024-01-01", "endDate": "2024-01-07"}}
    case 'week':
      if (typeof value === 'object' && value.startDate && value.endDate) {
        return JSON.stringify({ week: { startDate: value.startDate, endDate: value.endDate } });
      }
      return JSON.stringify({ week: value });

    // Hour columns: {"hour": 14, "minute": 30} (24-hour format)
    case 'hour':
      if (typeof value === 'object' && value.hour !== undefined) {
        return JSON.stringify({ hour: value.hour, minute: value.minute || 0 });
      }
      // If value is a string like "14:30", parse it
      if (typeof value === 'string' && value.includes(':')) {
        const [hour, minute] = value.split(':').map(Number);
        return JSON.stringify({ hour, minute });
      }
      return JSON.stringify({ hour: value, minute: 0 });

    // Location columns: {"lat": "40.7128", "lng": "-74.0060", "address": "New York"}
    // Note: lat/lng must be strings according to API docs
    case 'location':
      if (typeof value === 'object') {
        return JSON.stringify({
          lat: String(value.lat),
          lng: String(value.lng),
          address: value.address || ''
        });
      }
      // If value is just an address string
      return JSON.stringify({ address: value });

    // Rating columns: {"rating": 3} (1-5)
    case 'rating':
      return JSON.stringify({ rating: parseInt(value) });

    // Button columns: {"label": "Click me"}
    case 'button':
      return JSON.stringify({ label: value });

    // Color picker columns: {"color": {"r": 255, "g": 0, "b": 0}}
    case 'color_picker':
    case 'color':
      if (typeof value === 'object' && value.r !== undefined) {
        return JSON.stringify({ color: value });
      }
      // If value is hex color like "#FF0000"
      if (typeof value === 'string' && value.startsWith('#')) {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        return JSON.stringify({ color: { r, g, b } });
      }
      return JSON.stringify({ color: value });

    // Doc columns: {"url": "https://..."}
    case 'doc':
      return JSON.stringify({ url: value });

    // Default: return as JSON string
    default:
      return JSON.stringify(value);
  }
};

/**
 * Parsea el valor de una columna según su tipo
 * @param {string} type - Tipo de columna
 * @param {string} valueStr - Valor en formato JSON string
 * @returns {*} Valor parseado
 */
export const parseColumnValue = (type, valueStr) => {
  if (!valueStr) return null;

  try {
    const value = JSON.parse(valueStr);

    switch (type) {
      case 'status':
        return value.label || value.text || null;

      case 'date':
        return value.date || null;

      case 'people':
        return value.personsAndTeams || [];

      case 'timeline':
        return {
          from: value.from,
          to: value.to
        };

      case 'time_tracking':
        return value.duration || 0;

      case 'dropdown':
        return value.labels?.[0] || null;

      default:
        return value;
    }
  } catch (error) {
    console.error('Error parseando valor de columna:', error);
    return null;
  }
};

/**
 * Valida si un valor es válido para un tipo de columna
 * @param {string} type - Tipo de columna
 * @param {*} value - Valor a validar
 * @returns {boolean} True si es válido
 */
export const validateColumnValue = (type, value) => {
  if (value === null || value === undefined) return false;

  switch (type) {
    case 'text':
    case 'long-text':
    case 'long_text':
      return typeof value === 'string';

    case 'numbers':
      return typeof value === 'number' || !isNaN(parseFloat(value));

    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    case 'phone':
      return /^\+?[\d\s-()]+$/.test(value);

    case 'link':
      return /^https?:\/\/.+/.test(value);

    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(value);

    case 'people':
      return Array.isArray(value);

    case 'timeline':
      return value.from && value.to;

    default:
      return true;
  }
};

/**
 * Obtiene el texto visible de un column_value
 * @param {Object} columnValue - Objeto column_value de Monday
 * @returns {string} Texto visible
 */
export const getColumnText = (columnValue) => {
  return columnValue?.text || columnValue?.value || '';
};

/**
 * Filtra items por valor de columna
 * @param {Array} items - Items a filtrar
 * @param {string} columnId - ID de la columna
 * @param {*} filterValue - Valor a buscar
 * @returns {Array} Items filtrados
 */
export const filterItemsByColumn = (items, columnId, filterValue) => {
  return items.filter((item) => {
    const column = item.column_values?.find((col) => col.id === columnId);
    if (!column) return false;

    const text = getColumnText(column).toLowerCase();
    const filter = String(filterValue).toLowerCase();

    return text.includes(filter);
  });
};

/**
 * Agrupa items por valor de columna
 * @param {Array} items - Items a agrupar
 * @param {string} columnId - ID de la columna
 * @returns {Object} Items agrupados
 */
export const groupItemsByColumn = (items, columnId) => {
  return items.reduce((groups, item) => {
    const column = item.column_values?.find((col) => col.id === columnId);
    const key = getColumnText(column) || 'Sin valor';

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);

    return groups;
  }, {});
};

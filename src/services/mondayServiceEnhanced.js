import mondaySDK from 'monday-sdk-js';

const monday = mondaySDK();

/**
 * Utilidad para reintentar operaciones fallidas
 */
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

/**
 * Manejo mejorado de errores de Monday API
 */
const handleMondayError = (error, context = '') => {
  console.error(`Error en ${context}:`, error);

  if (error.message?.includes('rate limit')) {
    throw new Error('Límite de peticiones excedido. Por favor intenta de nuevo en unos minutos.');
  }

  if (error.message?.includes('authentication')) {
    throw new Error('Error de autenticación. Por favor recarga la página.');
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    throw new Error('Error de conexión. Verifica tu conexión a internet.');
  }

  throw new Error(error.message || 'Error desconocido al comunicarse con Monday.com');
};

/**
 * Obtiene los items de un board con paginación
 * @param {string} boardId - ID del board
 * @param {number} limit - Límite de items por página (default 500)
 * @returns {Promise<Array>} Lista de items
 */
export const getBoardItems = async (boardId, limit = 500) => {
  try {
    const query = `query ($boardId: [ID!], $limit: Int!) {
      boards(ids: $boardId) {
        items_page(limit: $limit) {
          cursor
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
    }`;

    const variables = { boardId: [boardId], limit };

    const response = await retryOperation(
      () => monday.api(query, { variables }),
      3,
      1000
    );

    if (!response?.data?.boards?.[0]) {
      throw new Error('No se pudo acceder al board. Verifica que tengas permisos.');
    }

    return response.data.boards[0].items_page?.items || [];
  } catch (error) {
    handleMondayError(error, 'getBoardItems');
  }
};

/**
 * Obtiene las columnas de un board
 * @param {string} boardId - ID del board
 * @returns {Promise<Array>} Lista de columnas
 */
export const getBoardColumns = async (boardId) => {
  try {
    const query = `query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        columns {
          id
          title
          type
          settings_str
        }
      }
    }`;

    const variables = { boardId: [boardId] };

    const response = await retryOperation(
      () => monday.api(query, { variables }),
      3,
      1000
    );

    if (!response?.data?.boards?.[0]) {
      throw new Error('No se pudo acceder al board. Verifica que tengas permisos.');
    }

    return response.data.boards[0].columns || [];
  } catch (error) {
    handleMondayError(error, 'getBoardColumns');
  }
};

/**
 * Actualiza el valor de una columna en un item
 * @param {string} boardId - ID del board
 * @param {string} itemId - ID del item
 * @param {string} columnId - ID de la columna
 * @param {string} value - Nuevo valor (en formato JSON string)
 * @param {string} itemName - Nombre del item (para logging)
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateColumnValue = async (boardId, itemId, columnId, value, itemName = '') => {
  try {
    const mutation = `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
        name
      }
    }`;

    const variables = {
      boardId,
      itemId,
      columnId,
      value: JSON.stringify(value)
    };

    const response = await retryOperation(
      () => monday.api(mutation, { variables }),
      2,
      500
    );

    return {
      success: true,
      itemId,
      itemName,
      data: response.data.change_column_value
    };
  } catch (error) {
    console.error(`Error actualizando item ${itemId} (${itemName}):`, error);
    return {
      success: false,
      itemId,
      itemName,
      error: error.message || 'Error desconocido'
    };
  }
};

/**
 * Actualiza múltiples items en lote con manejo robusto de errores
 * @param {string} boardId - ID del board
 * @param {Array} updates - Array de objetos {itemId, columnId, value, itemName}
 * @param {Function} onProgress - Callback para reportar progreso
 * @returns {Promise<Object>} Resultados de las actualizaciones
 */
export const bulkUpdateItems = async (boardId, updates, onProgress = null) => {
  const results = [];
  let successCount = 0;
  let failCount = 0;

  try {
    // Procesar en lotes pequeños para evitar rate limiting
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Ejecutar lote en paralelo
      const batchResults = await Promise.all(
        batch.map(({ itemId, columnId, value, itemName }) =>
          updateColumnValue(boardId, itemId, columnId, value, itemName)
        )
      );

      // Contar éxitos y fallos
      batchResults.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
        results.push(result);
      });

      // Reportar progreso
      if (onProgress) {
        onProgress({
          processed: (i + 1) * batchSize,
          total: updates.length,
          success: successCount,
          failed: failCount
        });
      }

      // Pequeño delay entre lotes para evitar rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return {
      success: failCount === 0,
      total: updates.length,
      successCount,
      failCount,
      results
    };
  } catch (error) {
    console.error('Error crítico en actualización masiva:', error);
    throw new Error('Error crítico durante la actualización masiva. Algunos items pueden no haberse actualizado.');
  }
};

/**
 * Obtiene información del board
 * @param {string} boardId - ID del board
 * @returns {Promise<Object>} Información del board
 */
export const getBoardInfo = async (boardId) => {
  try {
    const query = `query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        id
        name
        description
        items_count
        permissions
      }
    }`;

    const variables = { boardId: [boardId] };
    const response = await monday.api(query, { variables });

    return response.data.boards[0] || null;
  } catch (error) {
    handleMondayError(error, 'getBoardInfo');
  }
};

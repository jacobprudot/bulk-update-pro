import mondaySDK from 'monday-sdk-js';

const monday = mondaySDK();

/**
 * Obtiene los items de un board
 * @param {string} boardId - ID del board
 * @returns {Promise<Array>} Lista de items
 */
export const getBoardItems = async (boardId) => {
  try {
    const query = `query ($boardId: [ID!]) {
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
    }`;

    const variables = { boardId: [boardId] };
    const response = await monday.api(query, { variables });

    return response.data.boards[0]?.items_page?.items || [];
  } catch (error) {
    console.error('Error obteniendo items del board:', error);
    throw error;
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
    const response = await monday.api(query, { variables });

    return response.data.boards[0]?.columns || [];
  } catch (error) {
    console.error('Error obteniendo columnas del board:', error);
    throw error;
  }
};

/**
 * Actualiza el valor de una columna en un item
 * @param {string} boardId - ID del board
 * @param {string} itemId - ID del item
 * @param {string} columnId - ID de la columna
 * @param {string} value - Nuevo valor (en formato JSON string)
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateColumnValue = async (boardId, itemId, columnId, value) => {
  try {
    const mutation = `mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }`;

    const variables = {
      boardId,
      itemId,
      columnId,
      value: value // Ya viene formateado desde formatColumnValue
    };

    const response = await monday.api(mutation, { variables });
    return response.data.change_column_value;
  } catch (error) {
    console.error('Error actualizando valor de columna:', error);
    throw error;
  }
};

/**
 * Actualiza múltiples items en lote con manejo de errores granular
 * @param {string} boardId - ID del board
 * @param {Array} updates - Array de objetos {itemId, columnId, value}
 * @param {Function} onProgress - Callback para reportar progreso (optional)
 * @returns {Promise<Object>} Objeto con resultados exitosos y fallidos
 */
export const bulkUpdateItems = async (boardId, updates, onProgress) => {
  const results = {
    successful: [],
    failed: [],
    total: updates.length
  };

  for (let i = 0; i < updates.length; i++) {
    const { itemId, columnId, value } = updates[i];

    try {
      const result = await updateColumnValue(boardId, itemId, columnId, value);
      results.successful.push({ itemId, columnId, result });
    } catch (error) {
      console.error(`Error updating item ${itemId}:`, error);
      results.failed.push({
        itemId,
        columnId,
        error: error.message || 'Unknown error'
      });
    }

    // Report progress if callback provided
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: updates.length,
        percentage: ((i + 1) / updates.length) * 100
      });
    }
  }

  return results;
};

/**
 * Obtiene los usuarios del workspace
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getWorkspaceUsers = async () => {
  try {
    const query = `query {
      users {
        id
        name
        email
        photo_thumb
      }
    }`;

    const response = await monday.api(query);
    return response.data.users || [];
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene items de un board relacionado (para board-relation columns)
 * @param {string} linkedBoardId - ID del board vinculado
 * @returns {Promise<Array>} Lista de items del board
 */
export const getLinkedBoardItems = async (linkedBoardId) => {
  try {
    const query = `query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100) {
          items {
            id
            name
          }
        }
      }
    }`;

    const variables = { boardId: [linkedBoardId] };
    const response = await monday.api(query, { variables });

    return response.data.boards[0]?.items_page?.items || [];
  } catch (error) {
    console.error('Error obteniendo items del board relacionado:', error);
    throw error;
  }
};

/**
 * Obtiene los tags disponibles en un board
 * @param {string} boardId - ID del board
 * @returns {Promise<Array>} Lista de tags
 */
export const getBoardTags = async (boardId) => {
  try {
    const query = `query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        tags {
          id
          name
          color
        }
      }
    }`;

    const variables = { boardId: [boardId] };
    const response = await monday.api(query, { variables });

    return response.data.boards[0]?.tags || [];
  } catch (error) {
    console.error('Error obteniendo tags del board:', error);
    throw error;
  }
};

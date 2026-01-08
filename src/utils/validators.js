/**
 * Validation utilities for column values
 */

/**
 * Validates an email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, error: 'Invalid email. Expected format: user@example.com' };
  }
  return { valid: true };
};

/**
 * Validates a phone number
 */
export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{7,}$/;
  if (!re.test(phone)) {
    return { valid: false, error: 'Invalid phone. Must contain at least 7 digits' };
  }
  return { valid: true };
};

/**
 * Validates a URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL. Must start with http:// or https://' };
  }
};

/**
 * Validates a date
 */
export const validateDate = (date) => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(date)) {
    return { valid: false, error: 'Invalid date. Expected format: YYYY-MM-DD' };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  return { valid: true };
};

/**
 * Validates a number
 */
export const validateNumber = (num) => {
  if (num === '' || num === null || num === undefined) {
    return { valid: false, error: 'Value cannot be empty' };
  }

  if (isNaN(parseFloat(num))) {
    return { valid: false, error: 'Must be a valid number' };
  }

  return { valid: true };
};

/**
 * Validates a value based on column type
 */
export const validateColumnValue = (type, value) => {
  // Allow empty values for "clear"
  if (value === '' || value === null || value === undefined) {
    return { valid: true, isEmpty: true };
  }

  switch (type) {
    case 'email':
      return validateEmail(value);

    case 'phone':
      return validatePhone(value);

    case 'link':
      return validateURL(value);

    case 'date':
      return validateDate(value);

    case 'numbers':
      return validateNumber(value);

    case 'text':
    case 'long-text':
      if (value.length > 10000) {
        return { valid: false, error: 'Text is too long (maximum 10,000 characters)' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
};

/**
 * Validates number of selected items
 */
export const validateBulkUpdateSize = (count) => {
  const MAX_ITEMS = 1000;
  const WARNING_THRESHOLD = 50;

  if (count === 0) {
    return {
      valid: false,
      error: 'Must select at least one item'
    };
  }

  if (count > MAX_ITEMS) {
    return {
      valid: false,
      error: `Cannot update more than ${MAX_ITEMS} items at once. You selected ${count} items.`
    };
  }

  if (count > WARNING_THRESHOLD) {
    return {
      valid: true,
      warning: `You are about to update ${count} items. This operation may take a few minutes.`,
      needsConfirmation: true
    };
  }

  return { valid: true };
};

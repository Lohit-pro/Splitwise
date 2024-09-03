/**
 * Validates if the given value is a valid email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 */
function isValidEmail(email) {
  if (!email) {
    return false;
  }

  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if the given string is a non-empty value.
 * @param {string} value - The string to check.
 * @returns {boolean} - Returns true if the value is non-empty, otherwise false.
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates if the given number is a positive integer.
 * @param {number} value - The number to check.
 * @returns {boolean} - Returns true if the value is a positive integer, otherwise false.
 */
function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validates if the provided amount is a positive decimal number.
 * @param {number} amount - The amount to check.
 * @returns {boolean} - Returns true if the amount is a positive decimal number, otherwise false.
 */
function isPositiveDecimal(amount) {
  return typeof amount === "number" && amount > 0 && !isNaN(amount);
}

/**
 * Validates if the given date string is in a valid ISO 8601 format.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} - Returns true if the date string is valid, otherwise false.
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Validates if the given ID exists in the specified table.
 * @param {number} id - The ID to check.
 * @param {string} table - The table to check the ID against.
 * @returns {Promise<boolean>} - Returns true if the ID exists, otherwise false.
 */
async function isIdExists(id, table) {
  if (!id || !table) {
    throw new Error("ID and table name are required.");
  }

  try {
    const result = await pool.query(`SELECT id FROM ${table} WHERE id = $1`, [
      id,
    ]);

    return result.rows.length > 0;
  } catch (err) {
    console.error(`Error checking ID existence in ${table}:`, err);
    throw new Error("Unable to check ID existence due to a server error.");
  }
}

module.exports = {
  isValidEmail,
  isNonEmptyString,
  isPositiveInteger,
  isPositiveDecimal,
  isValidISODate,
  isIdExists,
};

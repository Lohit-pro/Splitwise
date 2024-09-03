const pool = require("../config/db");

/**
 * Checks if a user exists by their ID.
 * @param {number} userId - The ID of the user to check.
 * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
 */
async function userExists(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  try {
    const result = await pool.query("SELECT id FROM Users WHERE id = $1", [
      userId,
    ]);

    return result.rows.length > 0;
  } catch (err) {
    console.error("Error checking if user exists:", err);
    throw new Error("Unable to check if user exists due to a server error.");
  }
}

/**
 * Retrieves user details by their ID.
 * @param {number} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} - The user details.
 */
async function getUserDetails(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  try {
    const result = await pool.query("SELECT * FROM Users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      throw new Error("User not found.");
    }

    return result.rows[0];
  } catch (err) {
    console.error("Error retrieving user details:", err);
    throw new Error("Unable to retrieve user details due to a server error.");
  }
}

/**
 * Validates if the provided email is valid and not already taken.
 * @param {string} email - The email to validate.
 * @returns {Promise<boolean>} - Returns true if the email is valid and not taken, otherwise false.
 */
async function validateEmail(email) {
  if (!email) {
    throw new Error("Email is required.");
  }

  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  try {
    const result = await pool.query("SELECT id FROM Users WHERE email = $1", [
      email,
    ]);

    return result.rows.length === 0; // True if the email is not taken
  } catch (err) {
    console.error("Error validating email:", err);
    throw new Error("Unable to validate email due to a server error.");
  }
}

/**
 * Updates the user information.
 * @param {number} userId - The ID of the user to update.
 * @param {Object} updates - An object containing the fields to update.
 * @returns {Promise<Object>} - The updated user details.
 */
async function updateUser(userId, updates) {
  if (!userId || !updates || Object.keys(updates).length === 0) {
    throw new Error("User ID and update details are required.");
  }

  const updateFields = [];
  const updateValues = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    updateFields.push(`${key} = $${index}`);
    updateValues.push(value);
    index++;
  }

  try {
    const updateResult = await pool.query(
      `UPDATE Users SET ${updateFields.join(
        ", "
      )} WHERE id = $${index} RETURNING *`,
      [...updateValues, userId]
    );

    if (updateResult.rows.length === 0) {
      throw new Error("User not found.");
    }

    return updateResult.rows[0];
  } catch (err) {
    console.error("Error updating user:", err);
    throw new Error("Unable to update user due to a server error.");
  }
}

module.exports = {
  userExists,
  getUserDetails,
  validateEmail,
  updateUser,
};

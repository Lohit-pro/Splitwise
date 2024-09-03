const pool = require("../config/db");

/**
 * Calculates individual shares for a given expense.
 * @param {number} amount - The total amount of the expense.
 * @param {Array<Object>} members - An array of members in the group with their user ID.
 * @param {string} splitType - The type of split (e.g., "equal", "unequal").
 * @returns {Object} - An object mapping each userId to their calculated share.
 */
async function calculateShares(amount, members, splitType) {
  if (!amount || !members || members.length === 0 || !splitType) {
    throw new Error("Invalid input data for calculating shares.");
  }

  const shares = {};

  try {
    switch (splitType) {
      case "equal":
        const equalShare = amount / members.length;
        members.forEach(member => {
          shares[member.id] = equalShare;
        });
        break;

      case "unequal":
        // For unequal, assume an `unequalShares` object is passed, mapping userId to their share
        members.forEach(member => {
          if (member.share !== undefined) {
            shares[member.id] = member.share;
          } else {
            throw new Error(`Share for user ${member.id} is not provided.`);
          }
        });
        break;

      default:
        throw new Error("Invalid split type provided.");
    }

    return shares;
  } catch (err) {
    console.error("Error calculating shares:", err);
    throw new Error("Failed to calculate shares due to a server error.");
  }
}

/**
 * Validates expense input data.
 * @param {Object} expenseData - The expense data to validate.
 * @returns {boolean} - Returns true if the expense data is valid, otherwise throws an error.
 */
function validateExpenseData(expenseData) {
  const { description, amount, paid_by, split_type, group_id } = expenseData;

  if (!description || !amount || !paid_by || !split_type || !group_id) {
    throw new Error("All fields are required.");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  if (typeof paid_by !== "number") {
    throw new Error("Paid by must be a valid user ID.");
  }

  return true;
}

/**
 * Checks if the user exists in the database.
 * @param {number} userId - The user ID to check.
 * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
 */
async function checkUserExists(userId) {
  try {
    const result = await pool.query(
      `SELECT id FROM Users WHERE id = $1`,
      [userId]
    );

    return result.rows.length > 0;
  } catch (err) {
    console.error("Error checking user existence:", err);
    throw new Error("Unable to verify user existence due to a server error.");
  }
}

/**
 * Retrieves all expenses for a specific group.
 * @param {number} groupId - The ID of the group to retrieve expenses for.
 * @returns {Promise<Array>} - An array of expenses for the group.
 */
async function getExpensesByGroup(groupId) {
  try {
    const expensesResult = await pool.query(
      `SELECT * FROM Expenses WHERE group_id = $1`,
      [groupId]
    );

    return expensesResult.rows;
  } catch (err) {
    console.error("Error retrieving expenses by group:", err);
    throw new Error("Unable to retrieve expenses due to a server error.");
  }
}

/**
 * Retrieves the total expenses paid by each user in a specific group.
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<Object>} - An object mapping each userId to the total amount they paid.
 */
async function getTotalPaidByUsers(groupId) {
  try {
    const totalPaidResult = await pool.query(
      `SELECT paid_by, SUM(amount) as total_paid FROM Expenses 
       WHERE group_id = $1 GROUP BY paid_by`,
      [groupId]
    );

    const totals = {};
    totalPaidResult.rows.forEach(row => {
      totals[row.paid_by] = parseFloat(row.total_paid);
    });

    return totals;
  } catch (err) {
    console.error("Error calculating total paid by users:", err);
    throw new Error("Unable to calculate total paid by users due to a server error.");
  }
}

module.exports = {
  calculateShares,
  validateExpenseData,
  checkUserExists,
  getExpensesByGroup,
  getTotalPaidByUsers
};

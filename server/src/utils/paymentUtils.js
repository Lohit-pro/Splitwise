const pool = require("../config/db");

/**
 * Records a payment between two users in the specified group.
 * @param {number} fromUserId - The ID of the user making the payment.
 * @param {number} toUserId - The ID of the user receiving the payment.
 * @param {number} amount - The amount being paid.
 * @param {number} groupId - The ID of the group where the payment is being made.
 * @returns {Promise<Object>} - The newly created payment record.
 */
async function recordPayment(fromUserId, toUserId, amount, groupId) {
  if (!fromUserId || !toUserId || !amount || !groupId) {
    throw new Error("All fields are required to record a payment.");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  try {
    const paymentResult = await pool.query(
      `INSERT INTO Payments (from_user, to_user, group_id, amount) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [fromUserId, toUserId, groupId, amount]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error("Failed to record payment.");
    }

    return paymentResult.rows[0]; // Returning the newly created payment record
  } catch (err) {
    console.error("Error recording payment:", err);
    throw new Error("Unable to record payment due to a server error.");
  }
}

/**
 * Retrieves all payments made within a specific group.
 * @param {number} groupId - The ID of the group to retrieve payments for.
 * @returns {Promise<Array>} - An array of payments for the group.
 */
async function getPaymentsByGroup(groupId) {
  if (!groupId) {
    throw new Error("Group ID is required to retrieve payments.");
  }

  try {
    const paymentsResult = await pool.query(
      `SELECT * FROM Payments WHERE group_id = $1`,
      [groupId]
    );

    return paymentsResult.rows;
  } catch (err) {
    console.error("Error retrieving payments by group:", err);
    throw new Error("Unable to retrieve payments due to a server error.");
  }
}

/**
 * Validates if a payment can be made between two users within a group.
 * @param {number} fromUserId - The ID of the user making the payment.
 * @param {number} toUserId - The ID of the user receiving the payment.
 * @param {number} groupId - The ID of the group where the payment is intended.
 * @returns {Promise<boolean>} - Returns true if payment is valid, otherwise false.
 */
async function validatePayment(fromUserId, toUserId, groupId) {
  if (!fromUserId || !toUserId || !groupId) {
    throw new Error("All fields are required to validate a payment.");
  }

  try {
    // Check if both users are part of the group
    const usersInGroupResult = await pool.query(
      `SELECT * FROM GroupMembers WHERE user_id IN ($1, $2) AND group_id = $3`,
      [fromUserId, toUserId, groupId]
    );

    if (usersInGroupResult.rows.length < 2) {
      return false; // At least one user is not in the group
    }

    return true;
  } catch (err) {
    console.error("Error validating payment:", err);
    throw new Error("Unable to validate payment due to a server error.");
  }
}

/**
 * Calculates the total amount paid between two users in a group.
 * @param {number} fromUserId - The ID of the user making payments.
 * @param {number} toUserId - The ID of the user receiving payments.
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<number>} - The total amount paid.
 */
async function calculateTotalPaidBetweenUsers(fromUserId, toUserId, groupId) {
  if (!fromUserId || !toUserId || !groupId) {
    throw new Error("All fields are required to calculate total paid.");
  }

  try {
    const totalPaidResult = await pool.query(
      `SELECT SUM(amount) as total_paid FROM Payments 
       WHERE from_user = $1 AND to_user = $2 AND group_id = $3`,
      [fromUserId, toUserId, groupId]
    );

    const totalPaid = totalPaidResult.rows[0].total_paid;

    return totalPaid ? parseFloat(totalPaid) : 0;
  } catch (err) {
    console.error("Error calculating total paid between users:", err);
    throw new Error("Unable to calculate total paid due to a server error.");
  }
}

/**
 * Calculate the net balance of each user in a group.
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of user balances.
 */
async function calculateBalances(groupId) {
  if (!groupId) {
    throw new Error("Group ID is required to calculate balances.");
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id AS user_id, 
        u.name AS user_name, 
        COALESCE(SUM(e.amount * 
          (CASE WHEN e.paid_by = u.id THEN 1 ELSE -1 END)), 0) AS balance
      FROM Users u
      LEFT JOIN Expenses e ON u.id = e.paid_by OR u.id = ANY(e.split_with)
      WHERE e.group_id = $1
      GROUP BY u.id, u.name
      `,
      [groupId]
    );

    return result.rows;
  } catch (err) {
    console.error("Error calculating balances:", err);
    throw new Error("Unable to calculate balances due to a server error.");
  }
}

/**
 * Simplify debts between users in a group.
 * @param {Object[]} balances - Array of user balances.
 * @returns {Object[]} - Array of simplified transactions.
 */
function simplifyDebts(balances) {
  const transactions = [];
  const debtors = [];
  const creditors = [];

  // Separate users into debtors and creditors
  balances.forEach((user) => {
    if (user.balance < 0) {
      debtors.push(user);
    } else if (user.balance > 0) {
      creditors.push(user);
    }
  });

  // Sort debtors by the amount they owe (ascending) and creditors by the amount they are owed (ascending)
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => a.balance - b.balance);

  // Simplify debts
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settlementAmount = Math.min(-debtor.balance, creditor.balance);

    transactions.push({
      from: debtor.user_id,
      to: creditor.user_id,
      amount: settlementAmount,
    });

    debtor.balance += settlementAmount;
    creditor.balance -= settlementAmount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return transactions;
}

/**
 * Settle up a user's debt by recording the payment and adjusting balances.
 * @param {number} userId - The ID of the user making the payment.
 * @param {number} groupId - The ID of the group where the debt exists.
 * @param {number} toUserId - The ID of the user receiving the payment.
 * @param {number} amount - The amount to settle.
 * @returns {Promise<Object>} - A promise that resolves to the result of the settlement.
 */
async function settleUp(userId, groupId, toUserId, amount) {
  if (!userId || !groupId || !toUserId || !amount) {
    throw new Error("All fields are required to settle up.");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  try {
    // Record the payment in the Payments table
    const paymentResult = await pool.query(
      `INSERT INTO Payments (from_user, to_user, group_id, amount) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, toUserId, groupId, amount]
    );

    const newPayment = paymentResult.rows[0];

    // Update balances or expenses table to reflect the settlement
    await pool.query(
      `UPDATE Expenses 
       SET amount = amount - $1 
       WHERE paid_by = $2 AND group_id = $3`,
      [amount, userId, groupId]
    );

    return newPayment;
  } catch (err) {
    console.error("Error settling up:", err);
    throw new Error("Unable to settle up due to a server error.");
  }
}

module.exports = {
  recordPayment,
  getPaymentsByGroup,
  validatePayment,
  calculateTotalPaidBetweenUsers,
  calculateBalances,
  simplifyDebts,
  settleUp,
};

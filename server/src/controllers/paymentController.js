const pool = require("../config/db");
const {
  validateGroupMembership,
  getGroupDetails,
} = require("../utils/groupUtils");
const { calculateBalances, simplifyDebts } = require("../utils/expenseUtils");

// Add a new payment record
exports.addPayment = async (req, res) => {
  const { from_user, to_user, group_id, amount } = req.body;

  if (!from_user || !to_user || !group_id || !amount) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Validate group membership
    const isMemberFrom = await validateGroupMembership(from_user, group_id);
    const isMemberTo = await validateGroupMembership(to_user, group_id);

    if (!isMemberFrom || !isMemberTo) {
      return res
        .status(403)
        .json({ error: "One or both users are not members of the group." });
    }

    const paymentResult = await pool.query(
      "INSERT INTO Payments (from_user, to_user, group_id, amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [from_user, to_user, group_id, amount]
    );

    const newPayment = paymentResult.rows[0];

    res.status(201).json({
      id: newPayment.id,
      from_user: newPayment.from_user,
      to_user: newPayment.to_user,
      group_id: newPayment.group_id,
      amount: newPayment.amount,
      created_at: newPayment.created_at,
      message: "Payment added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all payments for a specific group
exports.getAllPaymentsForGroup = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const paymentsResult = await pool.query(
      "SELECT * FROM Payments WHERE group_id = $1",
      [groupId]
    );

    res.status(200).json(paymentsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get payment history of a specific user
exports.getPaymentHistoryForUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const paymentsResult = await pool.query(
      "SELECT * FROM Payments WHERE from_user = $1 OR to_user = $1",
      [userId]
    );

    res.status(200).json(paymentsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get balance of each user
exports.calculateBalances = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const balances = await calculateBalances(groupId);

    res.status(200).json(balances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get summary of expenses
exports.getGroupSummary = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const groupDetails = await getGroupDetails(groupId);
    const expensesResult = await pool.query(
      "SELECT * FROM Expenses WHERE group_id = $1",
      [groupId]
    );
    const paymentsResult = await pool.query(
      "SELECT * FROM Payments WHERE group_id = $1",
      [groupId]
    );

    res.status(200).json({
      group: groupDetails,
      expenses: expensesResult.rows,
      payments: paymentsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Simplify debts
exports.simplifyDebts = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const simplifiedDebts = await simplifyDebts(groupId);

    res.status(200).json(simplifiedDebts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Settle up
exports.settleUp = async (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res
      .status(400)
      .json({ error: "User ID and group ID are required." });
  }

  try {
    const balances = await calculateBalances(groupId);

    const userBalance = balances.find((balance) => balance.userId === userId);

    if (!userBalance) {
      return res.status(404).json({ error: "User not found in the group." });
    }

    // Logic to settle up user's debt
    const payments = await simplifyDebts(groupId);

    res.status(200).json({
      message: "Debts settled successfully",
      payments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const pool = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
require("dotenv").config();

// Add New Expense
exports.addNewExpense = async (req, res) => {
  const { description, amount, paid_by, split_type } = req.body;
  const groupId = req.params.groupId;

  if (!groupId || !description || !amount || !paid_by || !split_type) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if the group exists
    const groupCheckResult = await pool.query(
      "SELECT * FROM Groups WHERE id = $1",
      [groupId]
    );
    if (groupCheckResult.rows.length === 0) {
      return res.status(404).json({ error: "Group not found." });
    }

    // Check if the user exists
    const userCheckResult = await pool.query(
      "SELECT * FROM Users WHERE id = $1",
      [paid_by]
    );
    if (userCheckResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const expenseResult = await pool.query(
      "INSERT INTO Expenses (group_id, description, amount, paid_by, split_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [groupId, description, amount, paid_by, split_type]
    );

    const newExpense = expenseResult.rows[0];

    res.status(201).json({
      id: newExpense.id,
      description: newExpense.description,
      amount: newExpense.amount,
      paid_by: newExpense.paid_by,
      split_type: newExpense.split_type,
      created_at: newExpense.created_at,
      message: "Expense created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const expensesResult = await pool.query(
      `SELECT * FROM Expenses WHERE group_id = $1`,
      [groupId]
    );

    res.status(200).json(expensesResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Expense Details
exports.getExpense = async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    const expenseResult = await pool.query(
      'SELECT * FROM Expenses WHERE id = $1',
      [expenseId]
    )

    if (expenseResult.rows.length === 0) {
      return res.status(404).json({error: 'Expense not found.'})
    }

    res.status(200).json(expenseResult.rows[0]); // Expense details
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Server error."})
  }
}

// Delete Expense
exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    const deleteResult = await pool.query(
      `DELETE FROM Expenses WHERE id = $1 RETURNING *`,
      [expenseId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update the Expense
exports.updateExpense = async (req, res) => {
  const expenseId = req.params.expenseId;
  const { description, amount, paid_by, split_type } = req.body;

  if (!description || !amount || !paid_by || !split_type) {
    return res.status(400).json({error: "All the feilds are required."});
  }

  try {
    const updateResult = await pool.query(
      "UPDATE Expenses SET description=$1, amount=$1, paid_by=$1, split_type=$1 WHERE id = $5 RETURNING *",
      [description, amount, paid_by, split_type]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({error: 'Expense not found'});
    }

    res.status(200).json({
      message: 'Expense Updated',
      description: updateResult.description,
      amount: updateResult.amount,
      paid_by: updateResult.paid_by,
      split_type: updateResult.split_type
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Server error."});
  }
}

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const { addNewExpense, getAllExpenses, deleteExpense, getExpense, updateExpense } = require('../controllers/expenseController');

// Add Expense
router.post('/groups/:groupId/expenses', authenticateJWT, addNewExpense);

// Get All Expenses
router.get('/groups/:groupId/expenses', authenticateJWT, getAllExpenses);

// Get Expense Details
router.get('/groups/:groupId/expenses/:expenseId', authenticateJWT, getExpense);

// Delete Expense
router.delete('/expenses/:expenseId', authenticateJWT, deleteExpense);

// Update the Expense
router.put('/groups/:groupId/expenses/:expenseId', authenticateJWT, updateExpense);

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const { createGroup, getAllGroups, getGroupDetails, updateGroupDetails, deleteGroup, addNewExpense, getAllExpenses, deleteExpense } = require('../controllers/groupController');

// Create Group
router.post('/groups', authenticateJWT, createGroup);

// Get All Groups for a User
router.get('/groups', authenticateJWT, getAllGroups);

// Get Group Details
router.get('/groups/:groupId', authenticateJWT, getGroupDetails);

// Update Group Details
router.put('/groups/:groupId', authenticateJWT, updateGroupDetails);

// Delete a Group
router.delete('/groups/:groupId', authenticateJWT, deleteGroup);

// // Add Expense to a Group
// router.post('/groups/:groupId/expenses', authenticateJWT, addNewExpense);

// // Get All Expenses for a Group
// router.get('/groups/:groupId/expenses', authenticateJWT, getAllExpenses);

// // Delete an Expense from a Group
// router.delete('/groups/:groupId/expenses/:expenseId', authenticateJWT, deleteExpense);

module.exports = router;

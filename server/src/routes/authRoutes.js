const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// Get User Profile
router.get('/profile', authenticateJWT, getUserProfile);

// Update User Profile
router.put('/profile', authenticateJWT, updateUserProfile);

module.exports = router;

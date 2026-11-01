// Authentication routes for Gram Sahayak
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route: Register a new villager
router.post('/register', register);

// Public route: Login existing user (villager or panchayat)
router.post('/login', login);

// Protected route: Fetch current logged-in user profile
router.get('/me', protect, getMe);

// Protected route: Update user profile name and/or password
router.put('/profile', protect, updateProfile);

module.exports = router;

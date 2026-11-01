// User management routes restricted to Panchayat administrators
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleBlockUser,
  resetUserPassword,
  deleteUser
} = require('../controllers/userController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// All user management routes require both login authentication and Panchayat role
router.use(protect);
router.use(onlyPanchayat);

// Get list of all users with search and filter parameters
router.get('/', getAllUsers);

// Toggle blocked status for a specific user
router.put('/:id/block', toggleBlockUser);

// Reset password for a specific user
router.put('/:id/reset-password', resetUserPassword);

// Delete a user account
router.delete('/:id', deleteUser);

module.exports = router;

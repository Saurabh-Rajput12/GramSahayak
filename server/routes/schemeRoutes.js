// Scheme routes for public viewing and Panchayat management
const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme
} = require('../controllers/schemeController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: Get all schemes with search and category filters
router.get('/', getAllSchemes);

// Public route: Get scheme details by ID
router.get('/:id', getSchemeById);

// Protected routes: Only Panchayat administrators can add, edit, or delete schemes
router.post('/', protect, onlyPanchayat, createScheme);
router.put('/:id', protect, onlyPanchayat, updateScheme);
router.delete('/:id', protect, onlyPanchayat, deleteScheme);

module.exports = router;

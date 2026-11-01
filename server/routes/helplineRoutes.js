// Helpline routes for public directory lookup and Panchayat maintenance
const express = require('express');
const router = express.Router();
const {
  getAllHelplines,
  createHelpline,
  updateHelpline,
  deleteHelpline
} = require('../controllers/helplineController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: View helpline directory with search and category filters
router.get('/', getAllHelplines);

// Protected routes: Panchayat administrators add, update, and remove helpline contacts
router.post('/', protect, onlyPanchayat, createHelpline);
router.put('/:id', protect, onlyPanchayat, updateHelpline);
router.delete('/:id', protect, onlyPanchayat, deleteHelpline);

module.exports = router;

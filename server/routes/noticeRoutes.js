// Notice routes for public announcements and Panchayat publication
const express = require('express');
const router = express.Router();
const {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: View all notices with optional type and search filters
router.get('/', getAllNotices);

// Protected routes: Panchayat administrators publish, edit, or delete notices
router.post('/', protect, onlyPanchayat, createNotice);
router.put('/:id', protect, onlyPanchayat, updateNotice);
router.delete('/:id', protect, onlyPanchayat, deleteNotice);

module.exports = router;

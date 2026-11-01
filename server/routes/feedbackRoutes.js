// Feedback routes for citizen submissions and Panchayat review
const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  markFeedbackAsRead,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Protected villager route: Submit feedback
router.post('/', protect, createFeedback);

// Protected villager route: View own submitted feedback
router.get('/mine', protect, getMyFeedback);

// Protected Panchayat route: View all feedback with optional type filter
router.get('/', protect, onlyPanchayat, getAllFeedback);

// Protected Panchayat route: Mark feedback as read
router.put('/:id/read', protect, onlyPanchayat, markFeedbackAsRead);

// Protected Panchayat route: Delete feedback entry
router.delete('/:id', protect, onlyPanchayat, deleteFeedback);

module.exports = router;

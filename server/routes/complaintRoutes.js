// Complaint routes for villager submission and Panchayat grievance redressal
const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  updateMyComplaint,
  deleteMyComplaint,
  getAllComplaints,
  respondToComplaint
} = require('../controllers/complaintController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Protected villager route: File a new complaint
router.post('/', protect, createComplaint);

// Protected villager route: View complaints filed by the logged-in user
router.get('/mine', protect, getMyComplaints);

// Protected route: Update complaint (villagers edit own open complaint, panchayat updates status/reply)
router.put('/:id', protect, (req, res, next) => {
  if (req.user.role === 'panchayat' && (req.body.status || req.body.panchayatReply !== undefined)) {
    return respondToComplaint(req, res, next);
  }
  return updateMyComplaint(req, res, next);
});

// Protected villager route: Delete own open complaint
router.delete('/:id', protect, deleteMyComplaint);

// Protected Panchayat route: View all village complaints with filters (?status=&category=&search=)
router.get('/', protect, onlyPanchayat, getAllComplaints);

// Protected Panchayat route: Explicit status update and reply endpoint
router.put('/:id/respond', protect, onlyPanchayat, respondToComplaint);

module.exports = router;

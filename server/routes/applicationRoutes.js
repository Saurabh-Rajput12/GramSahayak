// Application routes for villager applications and Panchayat approvals
const express = require('express');
const router = express.Router();
const {
  applyForScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Protected villager route: Submit a scheme application
router.post('/', protect, applyForScheme);

// Protected villager route: View applications submitted by logged-in user
router.get('/mine', protect, getMyApplications);

// Protected Panchayat route: View all applications with optional status filter
router.get('/', protect, onlyPanchayat, getAllApplications);

// Protected Panchayat route: Approve or reject an application with remarks
router.put('/:id', protect, onlyPanchayat, updateApplicationStatus);

module.exports = router;

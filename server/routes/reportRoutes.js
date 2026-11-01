// Report routes for Panchayat village analytics and metrics
const express = require('express');
const router = express.Router();
const { getVillageSummary } = require('../controllers/reportController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// All report endpoints are restricted to Panchayat administrators
router.use(protect);
router.use(onlyPanchayat);

// Get summary metrics of villagers, complaints, applications, orders, and feedback
router.get('/summary', getVillageSummary);
router.get('/', getVillageSummary);

module.exports = router;

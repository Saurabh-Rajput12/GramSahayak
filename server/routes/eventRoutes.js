// Event routes for village community programs and registration
const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration
} = require('../controllers/eventController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: View all events with type and search filters
router.get('/', getAllEvents);

// Protected route: View events registered by the logged-in user
router.get('/mine', protect, getMyEvents);

// Public route: View single event details
router.get('/:id', getEventById);

// Protected routes: Panchayat creates, updates, and deletes events
router.post('/', protect, onlyPanchayat, createEvent);
router.put('/:id', protect, onlyPanchayat, updateEvent);
router.delete('/:id', protect, onlyPanchayat, deleteEvent);

// Protected routes: Villagers register or cancel registration for an event
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;

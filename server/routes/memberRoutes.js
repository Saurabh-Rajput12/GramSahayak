// Member routes for public directory of Panchayat officials and administrative updates
const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: View list of all Panchayat committee members
router.get('/', getAllMembers);

// Protected routes: Panchayat administrators manage member profiles
router.post('/', protect, onlyPanchayat, createMember);
router.put('/:id', protect, onlyPanchayat, updateMember);
router.delete('/:id', protect, onlyPanchayat, deleteMember);

module.exports = router;

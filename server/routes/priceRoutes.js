// Mandi crop price routes for public viewing and Panchayat updates
const express = require('express');
const router = express.Router();
const {
  getAllPrices,
  createPrice,
  updatePrice,
  deletePrice
} = require('../controllers/priceController');
const { protect, onlyPanchayat } = require('../middleware/authMiddleware');

// Public route: View mandi prices with search, district, and price range filters
router.get('/', getAllPrices);

// Protected routes: Panchayat administrators manage crop rates
router.post('/', protect, onlyPanchayat, createPrice);
router.put('/:id', protect, onlyPanchayat, updatePrice);
router.delete('/:id', protect, onlyPanchayat, deletePrice);

module.exports = router;

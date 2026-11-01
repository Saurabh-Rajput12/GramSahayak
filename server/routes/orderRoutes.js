// Order routes for checkout, tracking, and seller processing
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order actions require authentication
router.use(protect);

// Place a new order from current cart
router.post('/', createOrder);

// Get orders placed by current logged-in buyer
router.get('/mine', getMyOrders);

// Get orders received by current logged-in seller
router.get('/received', getReceivedOrders);

// Update order status (Buyer cancels; Seller accepts/delivers)
router.put('/:id', updateOrderStatus);

module.exports = router;

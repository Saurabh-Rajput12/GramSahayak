// Shopping cart routes for logged-in buyers
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart actions require the user to be logged in
router.use(protect);

// View current cart with live total
router.get('/', getCart);

// Add product to cart
router.post('/', addToCart);

// Clear entire shopping cart
router.delete('/', clearCart);

// Update quantity of a specific item in cart
router.put('/:productId', updateCartItemQuantity);

// Remove specific item from cart
router.delete('/:productId', removeFromCart);

module.exports = router;

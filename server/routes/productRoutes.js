// Product routes for rural market operations
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public route: View products with search, category, and price filters
router.get('/', getAllProducts);

// Protected route: View products listed by the logged-in seller
router.get('/mine', protect, getMyProducts);

// Public route: View product details by ID
router.get('/:id', getProductById);

// Protected routes: Add, edit, or delete products
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;

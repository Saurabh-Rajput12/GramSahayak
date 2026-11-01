// Product controller for the rural marketplace
const Product = require('../models/Product');

// Get all products with optional filters for search, category, and price range
const getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const filter = {};

    // Filter by product category
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Search by product name (case-insensitive)
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by price range
    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filter)
      .populate('seller', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ message: 'Server error fetching market products', error: error.message });
  }
};

// Get single product details by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name username');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product by id error:', error.message);
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
};

// Get products listed by the currently logged-in user
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get my products error:', error.message);
    res.status(500).json({ message: 'Server error fetching your products', error: error.message });
  }
};

// Add a new product to the village market
const createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, unit, description, location, contactPhone, isAvailable } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and quantity are required' });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({ message: 'Price and quantity must be non-negative numbers' });
    }

    const product = await Product.create({
      seller: req.user._id,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      unit: unit || 'kg',
      location: location ? location.trim() : 'Gram Panchayat Rampur',
      contactPhone: contactPhone ? contactPhone.trim() : '9876543210',
      description: description ? description.trim() : '',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
};

// Update an existing product (only the seller can modify their listing)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check: only the seller or panchayat admin can edit
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'panchayat') {
      return res.status(403).json({ message: 'You are not authorized to edit this product' });
    }

    const { name, category, price, quantity, unit, description, location, contactPhone, isAvailable } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unit !== undefined) product.unit = unit;
    if (location !== undefined) product.location = location.trim();
    if (contactPhone !== undefined) product.contactPhone = contactPhone.trim();
    if (description !== undefined) product.description = description.trim();
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

// Delete a product listing
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ownership check: only seller or panchayat can delete
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'panchayat') {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};

// Toggle product in-stock / sold-out availability
const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'panchayat') {
      return res.status(403).json({ message: 'You are not authorized to modify this product' });
    }

    product.isAvailable = !product.isAvailable;
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Toggle availability error:', error.message);
    res.status(500).json({ message: 'Server error toggling availability', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability
};

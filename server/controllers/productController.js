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
    const { name, category, price, quantity, unit, description, isAvailable } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Please provide product name, category, price, and quantity' });
    }

    const validCategories = ['vegetables', 'grains', 'dairy', 'fruits', 'handicrafts', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid product category' });
    }

    const newProduct = await Product.create({
      seller: req.user._id,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'kg',
      description: description ? description.trim() : '',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({ message: 'Product listed successfully', product: newProduct });
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ message: 'Server error adding product', error: error.message });
  }
};

// Update an existing product (only the seller can update)
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, unit, description, isAvailable } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: You can only edit your own products' });
    }

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unit) product.unit = unit.trim();
    if (description !== undefined) product.description = description.trim();
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

// Delete a product (only the seller can delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: You can only delete your own products' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct
};

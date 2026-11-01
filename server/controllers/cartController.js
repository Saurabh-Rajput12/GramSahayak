// Cart controller managing user shopping cart and live total calculation
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to calculate total price from populated cart items
const computeTotal = (items) => {
  return items.reduce((sum, item) => {
    if (item.product && typeof item.product.price === 'number') {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);
};

// Get current user's shopping cart with computed total
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }

    // Filter out any items whose product may have been deleted
    cart.items = cart.items.filter(item => item.product != null);
    const total = computeTotal(cart.items);

    res.status(200).json({
      _id: cart._id,
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ message: 'Server error fetching cart', error: error.message });
  }
};

// Add a product to the user's cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;

    // Verify product exists and is currently available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: 'This product is currently out of stock or unavailable' });
    }

    // Find existing cart or create new one for this user
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if the product already exists in the cart
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product information to return updated cart and total
    cart = await Cart.findById(cart._id).populate('items.product');
    cart.items = cart.items.filter(item => item.product != null);
    const total = computeTotal(cart.items);

    res.status(200).json({
      message: 'Item added to cart',
      _id: cart._id,
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ message: 'Server error adding item to cart', error: error.message });
  }
};

// Update quantity of an item in the cart
const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const newQty = Number(quantity);

    // If new quantity is 0 or less, remove the item
    if (newQty <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = newQty;
      } else {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    populatedCart.items = populatedCart.items.filter(item => item.product != null);
    const total = computeTotal(populatedCart.items);

    res.status(200).json({
      message: 'Cart updated',
      _id: populatedCart._id,
      items: populatedCart.items,
      total
    });
  } catch (error) {
    console.error('Update cart item error:', error.message);
    res.status(500).json({ message: 'Server error updating cart', error: error.message });
  }
};

// Remove a specific product from the cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    populatedCart.items = populatedCart.items.filter(item => item.product != null);
    const total = computeTotal(populatedCart.items);

    res.status(200).json({
      message: 'Item removed from cart',
      _id: populatedCart._id,
      items: populatedCart.items,
      total
    });
  } catch (error) {
    console.error('Remove from cart error:', error.message);
    res.status(500).json({ message: 'Server error removing item from cart', error: error.message });
  }
};

// Clear all items from the cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.status(200).json({
      message: 'Cart cleared successfully',
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    res.status(500).json({ message: 'Server error clearing cart', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};

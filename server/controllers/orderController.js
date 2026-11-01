// Order controller managing market checkout, order tracking, and seller status updates
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create a new order from current cart items and clear the cart
const createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    // Validate delivery address
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Please provide a complete village delivery address' });
    }

    // Fetch user's cart populated with current product details
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Please add items before placing an order.' });
    }

    // Filter valid items in case any products were deleted
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'No valid products in your cart.' });
    }

    // Build order items array snapshotting product name and price at checkout
    const orderItems = validItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    // Calculate total order amount
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create the order
    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      total,
      status: 'placed',
      address: address.trim()
    });

    // Clear the cart after order placement
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: 'Server error placing order', error: error.message });
  }
};

// Get all orders placed by the currently logged-in buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get my orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching your orders', error: error.message });
  }
};

// Get orders received by the currently logged-in seller for their listed products
const getReceivedOrders = async (req, res) => {
  try {
    // Find all products owned by the logged-in user
    const sellerProducts = await Product.find({ seller: req.user._id });
    const productIds = sellerProducts.map(p => p._id.toString());

    // Find orders that contain at least one product belonging to this seller
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('buyer', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get received orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching received orders', error: error.message });
  }
};

// Update order status (Seller accepts/delivers; buyer can cancel only while status is 'placed')
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['placed', 'accepted', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();

    // Check if the current user is a seller of any item in this order
    const sellerProducts = await Product.find({ seller: req.user._id });
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    const isSeller = order.items.some(item => item.product && sellerProductIds.includes(item.product.toString()));
    const isPanchayat = req.user.role === 'panchayat';

    // Buyer logic: Can only cancel an order that is currently 'placed'
    if (isBuyer) {
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Buyer can only cancel orders' });
      }
      if (order.status !== 'placed') {
        return res.status(400).json({ message: 'Order cannot be cancelled once accepted or delivered by seller' });
      }
      order.status = 'cancelled';
      await order.save();
      return res.status(200).json({ message: 'Order cancelled successfully', order });
    }

    // Seller or Panchayat logic: Can update status to accepted, delivered, or cancelled
    if (isSeller || isPanchayat) {
      order.status = status;
      await order.save();
      return res.status(200).json({ message: `Order status updated to ${status}`, order });
    }

    return res.status(403).json({ message: 'Not authorized to update this order' });
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus
};

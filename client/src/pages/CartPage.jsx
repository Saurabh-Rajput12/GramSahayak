// Shopping Cart and Order Management page with live checkout, order tracking, and seller processing
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

// CartPage component manages shopping cart items, address checkout, and order lifecycle
const CartPage = () => {
  const [activeTab, setActiveTab] = useState('cart'); // 'cart', 'my_orders', 'received_orders'
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [cartLoading, setCartLoading] = useState(true);

  // Checkout address state
  const [address, setAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Orders lists state
  const [myOrders, setMyOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Feedback alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Authentication token
  const token = localStorage.getItem('token');

  // Fetch user shopping cart from API
  const fetchCart = async () => {
    try {
      setCartLoading(true);
      setError('');
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data || { items: [], total: 0 });
    } catch (err) {
      console.error('Fetch cart error:', err);
      setError('Unable to load cart items.');
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch orders placed by current user as buyer
  const fetchMyOrders = async () => {
    try {
      setOrdersLoading(true);
      setError('');
      const response = await axios.get('/api/orders/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch my orders error:', err);
      setError('Unable to load your placed orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders received by current user as seller
  const fetchReceivedOrders = async () => {
    try {
      setOrdersLoading(true);
      setError('');
      const response = await axios.get('/api/orders/received', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceivedOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch received orders error:', err);
      setError('Unable to load received customer orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Initial cart load
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Load orders when active tab switches
  useEffect(() => {
    if (activeTab === 'my_orders') {
      fetchMyOrders();
    } else if (activeTab === 'received_orders') {
      fetchReceivedOrders();
    }
  }, [activeTab]);

  // Update item quantity in cart (+ or -)
  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      setError('');
      const response = await axios.put(`/api/cart/${productId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (err) {
      console.error('Update quantity error:', err);
      setError('Failed to update item quantity.');
    }
  };

  // Remove a specific product from cart
  const handleRemoveItem = async (productId) => {
    try {
      setError('');
      const response = await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setSuccess('Item removed from cart');
    } catch (err) {
      console.error('Remove item error:', err);
      setError('Failed to remove item from cart.');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    try {
      setError('');
      await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart({ items: [], total: 0 });
      setSuccess('Cart cleared');
    } catch (err) {
      console.error('Clear cart error:', err);
      setError('Failed to clear cart.');
    }
  };

  // Checkout and place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!address.trim()) {
      setError('Please provide a complete village delivery address (House No, Ward, Landmark).');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await axios.post('/api/orders', {
        address: address.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Order placed successfully! Villager seller will be notified.');
      setAddress('');
      setCart({ items: [], total: 0 });

      // Switch to My Orders tab
      setTimeout(() => {
        setActiveTab('my_orders');
      }, 1200);
    } catch (err) {
      console.error('Checkout error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to place order. Please check your network.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Buyer cancels an order (only while status is 'placed')
  const handleCancelOrder = async (orderId) => {
    try {
      setError('');
      await axios.put(`/api/orders/${orderId}`, {
        status: 'cancelled'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Order cancelled successfully.');
      fetchMyOrders();
    } catch (err) {
      console.error('Cancel order error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to cancel order.');
      }
    }
  };

  // Seller updates order status ('accepted', 'delivered', 'cancelled')
  const handleSellerUpdateStatus = async (orderId, newStatus) => {
    try {
      setError('');
      await axios.put(`/api/orders/${orderId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Order marked as ${newStatus}.`);
      fetchReceivedOrders();
    } catch (err) {
      console.error('Seller update order error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update order status.');
      }
    }
  };

  // Helper for order status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return 'badge-status-placed';
      case 'accepted':
        return 'badge-status-accepted';
      case 'delivered':
        return 'badge-status-delivered';
      case 'cancelled':
        return 'badge-status-cancelled';
      default:
        return 'bg-secondary text-white';
    }
  };

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container py-4">
      {/* Header and Tab Pills */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">🛒</span> Cart & Rural Orders
          </h2>
          <p className="text-muted small mb-0">
            Review shopping cart items, place local deliveries, and manage buyer & seller orders
          </p>
        </div>

        {/* Tab Pills */}
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'cart' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
            onClick={() => setActiveTab('cart')}
          >
            <i className="bi bi-cart3 me-1"></i> Active Cart
            {cart.items && cart.items.length > 0 && (
              <span className="badge bg-white text-success ms-2">{cart.items.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'my_orders' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
            onClick={() => setActiveTab('my_orders')}
          >
            <i className="bi bi-bag-check me-1"></i> My Placed Orders
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'received_orders' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
            onClick={() => setActiveTab('received_orders')}
          >
            <i className="bi bi-inbox me-1"></i> Received Seller Orders
          </button>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* TAB 1: ACTIVE SHOPPING CART & CHECKOUT */}
      {activeTab === 'cart' && (
        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Shopping Cart Items</h5>
                {cart.items && cart.items.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    onClick={handleClearCart}
                  >
                    <i className="bi bi-trash3 me-1"></i> Clear Cart
                  </button>
                )}
              </div>

              {cartLoading ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-success" role="status"></div>
                  <p className="small text-muted mt-2 mb-0">Loading your cart items...</p>
                </div>
              ) : !cart.items || cart.items.length === 0 ? (
                <div className="p-5 text-center">
                  <span className="fs-1 text-muted">🛒</span>
                  <h5 className="fw-bold text-dark mt-2">Your Cart is Empty</h5>
                  <p className="text-muted small mb-3">Browse our local rural market and support fellow village farmers.</p>
                  <Link to="/market" className="btn btn-primary btn-sm rounded-pill px-4">
                    Explore Village Market
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light small text-muted text-uppercase">
                      <tr>
                        <th scope="col" className="py-2">Produce Item</th>
                        <th scope="col" className="py-2">Unit Price</th>
                        <th scope="col" className="py-2 text-center" style={{ width: '130px' }}>Quantity</th>
                        <th scope="col" className="py-2 text-end">Subtotal</th>
                        <th scope="col" className="py-2 text-end" style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => {
                        const product = item.product || {};
                        const itemSubtotal = (product.price || 0) * item.quantity;
                        return (
                          <tr key={product._id || Math.random()}>
                            <td className="py-3">
                              <div className="fw-semibold text-dark">{product.name || 'Produce Item'}</div>
                              <span className="badge bg-light text-muted border small text-capitalize">
                                {product.category || 'produce'}
                              </span>
                            </td>
                            <td className="py-3 text-secondary">
                              ₹{product.price} / {product.unit || 'unit'}
                            </td>
                            <td className="py-3 text-center">
                              <div className="input-group input-group-sm d-inline-flex justify-content-center" style={{ width: '110px' }}>
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                                >
                                  -
                                </button>
                                <span className="input-group-text bg-white px-3 font-monospace fw-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-end fw-bold text-dark">
                              ₹{itemSubtotal.toLocaleString()}
                            </td>
                            <td className="py-3 text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-light text-danger rounded-circle"
                                title="Remove item"
                                onClick={() => handleRemoveItem(product._id)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Order Summary Form */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Items Subtotal:</span>
                <span className="fw-semibold text-dark">₹{cart.total?.toLocaleString() || 0}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Delivery Charge:</span>
                <span className="text-success fw-semibold">FREE (Village Delivery)</span>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold text-dark fs-5">Total Payable:</span>
                <span className="fw-bold text-primary-green fs-5">₹{cart.total?.toLocaleString() || 0}</span>
              </div>

              {/* Delivery Address Form */}
              <form onSubmit={handlePlaceOrder}>
                <div className="mb-3">
                  <label htmlFor="addressInput" className="form-label small fw-semibold text-secondary">
                    Village Delivery Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="addressInput"
                    className="form-control rounded-3 small"
                    rows="3"
                    placeholder="Enter House No., Ward No., Near Landmark, Village Name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  ></textarea>
                  <div className="form-text small text-muted">
                    <i className="bi bi-truck me-1 text-success"></i> Direct door-step delivery by local farmer
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={checkoutLoading || !cart.items || cart.items.length === 0}
                >
                  {checkoutLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-bag-check-fill"></i>
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PLACED ORDERS */}
      {activeTab === 'my_orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3">My Placed Orders</h5>

          {ordersLoading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-success" role="status"></div>
              <p className="small text-muted mt-2 mb-0">Loading your placed orders...</p>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="p-5 text-center text-muted">
              You haven't placed any orders yet. Visit the <Link to="/market" className="text-primary-green fw-semibold">Rural Market</Link> to order fresh farm goods.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th scope="col" className="py-3">Order ID / Placed</th>
                    <th scope="col" className="py-3">Items Purchased</th>
                    <th scope="col" className="py-3">Delivery Address</th>
                    <th scope="col" className="py-3">Total Amount</th>
                    <th scope="col" className="py-3">Status</th>
                    <th scope="col" className="py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="py-3">
                        <div className="font-monospace small fw-bold text-dark">#{order._id.slice(-6).toUpperCase()}</div>
                        <div className="small text-muted">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="py-3 small">
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            • {item.name} × {item.quantity} (₹{item.price * item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 small text-secondary" style={{ maxWidth: '200px' }}>
                        {order.address}
                      </td>
                      <td className="py-3 fw-bold text-primary-green">
                        ₹{order.total?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        {order.status === 'placed' ? (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIVED SELLER ORDERS */}
      {activeTab === 'received_orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3">Incoming Orders for Your Listed Products</h5>

          {ordersLoading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-success" role="status"></div>
              <p className="small text-muted mt-2 mb-0">Loading received seller orders...</p>
            </div>
          ) : receivedOrders.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No orders received yet for your listed produce. List more products in the market from your <Link to="/dashboard" className="text-primary-green fw-semibold">Dashboard</Link>.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th scope="col" className="py-3">Order Details</th>
                    <th scope="col" className="py-3">Buyer Info</th>
                    <th scope="col" className="py-3">Items Ordered</th>
                    <th scope="col" className="py-3">Total Value</th>
                    <th scope="col" className="py-3">Current Status</th>
                    <th scope="col" className="py-3 text-end">Seller Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="py-3">
                        <div className="font-monospace small fw-bold text-dark">#{order._id.slice(-6).toUpperCase()}</div>
                        <div className="small text-muted">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="py-3 small">
                        <div className="fw-semibold text-dark">{order.buyer?.name || 'Villager'}</div>
                        <div className="text-muted"><i className="bi bi-geo-alt text-danger me-1"></i>{order.address}</div>
                      </td>
                      <td className="py-3 small">
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            • {item.name} × {item.quantity} (₹{item.price * item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 fw-bold text-primary-green">
                        ₹{order.total?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {order.status === 'placed' && (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm rounded-pill px-3"
                              onClick={() => handleSellerUpdateStatus(order._id, 'accepted')}
                            >
                              <i className="bi bi-check-lg me-1"></i> Accept
                            </button>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm rounded-pill px-3"
                              onClick={() => handleSellerUpdateStatus(order._id, 'delivered')}
                            >
                              <i className="bi bi-truck me-1"></i> Mark Delivered
                            </button>
                          )}
                          {(order.status === 'placed' || order.status === 'accepted') && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill px-2"
                              title="Reject/Cancel"
                              onClick={() => handleSellerUpdateStatus(order._id, 'cancelled')}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
                          {(order.status === 'delivered' || order.status === 'cancelled') && (
                            <span className="small text-muted py-1">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;

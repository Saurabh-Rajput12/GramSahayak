// Comprehensive Villager Dashboard managing profile, applications, complaints, products, events, and feedback
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Dashboard component coordinates all citizen services and personal portal records
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Logged-in user profile state
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Tab Data States
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'vegetables',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    isAvailable: true
  });
  const [productLoading, setProductLoading] = useState(false);

  // Feedback Form State
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Global alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  // Fetch current user details
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setProfileName(response.data.name || '');
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Load content whenever tab switches
  useEffect(() => {
    if (!token) return;
    setError('');
    setSuccess('');

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (activeTab === 'applications') {
          const res = await axios.get('/api/applications/mine', config);
          setApplications(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'complaints') {
          const res = await axios.get('/api/complaints/mine', config);
          setComplaints(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'orders') {
          const res = await axios.get('/api/orders/mine', config);
          setOrders(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'products') {
          const res = await axios.get('/api/products/mine', config);
          setProducts(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'events') {
          const res = await axios.get('/api/events/mine', config);
          setEvents(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'feedback') {
          const res = await axios.get('/api/feedback/mine', config);
          setFeedbackList(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Tab load error:', err);
        setError('Failed to load tab records.');
      } finally {
        setTabLoading(false);
      }
    };

    if (activeTab !== 'profile') {
      loadTabData();
    }
  }, [activeTab, token]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileName.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    if (profilePassword && profilePassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setProfileLoading(true);
    try {
      const payload = { name: profileName.trim() };
      if (profilePassword) payload.password = profilePassword;

      const res = await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated successfully!');
      setProfilePassword('');
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Add new marketplace produce item
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    setError('');
    try {
      await axios.post('/api/products', {
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
        unit: productForm.unit,
        description: productForm.description.trim(),
        isAvailable: productForm.isAvailable
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Product listed on Village Market successfully!');
      setShowAddProductModal(false);
      setProductForm({
        name: '',
        category: 'vegetables',
        price: '',
        quantity: '',
        unit: 'kg',
        description: '',
        isAvailable: true
      });
      // Refresh products list
      const res = await axios.get('/api/products/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.response?.data?.message || 'Failed to list product.');
    } finally {
      setProductLoading(false);
    }
  };

  // Toggle produce availability (In Stock / Sold Out)
  const handleToggleProductAvailability = async (prod) => {
    try {
      await axios.put(`/api/products/${prod._id}`, {
        isAvailable: !prod.isAvailable
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(prev => prev.map(p => p._id === prod._id ? { ...p, isAvailable: !p.isAvailable } : p));
      setSuccess(`Updated stock status for ${prod.name}`);
    } catch (err) {
      console.error('Toggle availability error:', err);
      setError('Failed to update stock status.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p._id !== id));
      setSuccess('Product deleted.');
    } catch (err) {
      console.error('Delete product error:', err);
      setError('Failed to delete product.');
    }
  };

  // Cancel registered event
  const handleCancelEvent = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(prev => prev.filter(e => e._id !== eventId));
      setSuccess('Event reservation cancelled.');
    } catch (err) {
      console.error('Cancel event error:', err);
      setError('Failed to cancel event registration.');
    }
  };

  // Submit citizen feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setError('');
    try {
      const res = await axios.post('/api/feedback', {
        subject: feedbackSubject.trim(),
        message: feedbackMessage.trim(),
        type: feedbackType,
        rating: Number(feedbackRating)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Feedback submitted to Panchayat successfully!');
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackList(prev => [res.data.feedback, ...prev]);
    } catch (err) {
      console.error('Submit feedback error:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge class helper
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
      case 'resolved':
      case 'delivered':
        return 'badge-status-resolved';
      case 'in_progress':
      case 'accepted':
        return 'badge-status-in_progress';
      case 'pending':
      case 'open':
      case 'placed':
        return 'badge-status-pending';
      case 'rejected':
      case 'cancelled':
        return 'badge-status-rejected';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <span className="text-primary-green me-2">🌾</span> Citizen Services Dashboard
        </h2>
        <p className="text-muted small mb-0">
          Manage your village applications, filed complaints, orders, products, and profile settings
        </p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      <div className="row g-4">
        {/* Sidebar Navigation */}
        <div className="col-12 col-md-4 col-lg-3">
          {/* User Profile Card */}
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3 text-center">
            <div className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}>
              👤
            </div>
            <h5 className="fw-bold text-dark mb-0">{user?.name || 'Villager Resident'}</h5>
            <span className="small text-muted mb-2">@{user?.username}</span>
            <div>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small text-capitalize">
                Role: {user?.role || 'villager'}
              </span>
            </div>
          </div>

          {/* Sidebar Menu Pills */}
          <div className="list-group shadow-sm rounded-4 border-0 overflow-hidden bg-white">
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'profile' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person-gear me-2 fs-5"></i> Profile Settings
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'applications' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('applications')}
            >
              <i className="bi bi-journal-check me-2 fs-5"></i> My Applications
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'complaints' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <i className="bi bi-chat-left-dots me-2 fs-5"></i> My Complaints
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'orders' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-bag-check me-2 fs-5"></i> My Orders
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'products' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="bi bi-shop me-2 fs-5"></i> My Market Produce
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'events' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('events')}
            >
              <i className="bi bi-calendar-event me-2 fs-5"></i> My Registered Events
            </button>
            <button
              type="button"
              className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center border-0 ${activeTab === 'feedback' ? 'bg-success text-white fw-bold' : 'text-secondary'}`}
              onClick={() => setActiveTab('feedback')}
            >
              <i className="bi bi-chat-heart me-2 fs-5"></i> My Feedback
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-12 col-md-8 col-lg-9">
          {/* TAB 1: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Profile Information</h5>
              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <FormInput
                      label="Full Name"
                      name="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <FormInput
                      label="Username"
                      name="username"
                      value={user?.username || ''}
                      disabled
                      helperText="Username is permanent and cannot be altered"
                    />
                  </div>
                  <div className="col-12">
                    <FormInput
                      label="Change Password (Optional)"
                      name="profilePassword"
                      type="password"
                      placeholder="Leave blank to keep existing password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      helperText="Minimum 6 characters required if changing"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 mt-2"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">My Scheme Applications</h5>
                <Link to="/schemes" className="btn btn-sm btn-outline-primary rounded-pill">
                  <i className="bi bi-plus-circle me-1"></i> Apply to New Scheme
                </Link>
              </div>

              {tabLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>
              ) : applications.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  You have not applied for any welfare schemes yet. <Link to="/schemes" className="text-primary-green fw-semibold">Browse Available Schemes</Link>.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-muted text-uppercase">
                      <tr>
                        <th>Scheme</th>
                        <th>Applied Date</th>
                        <th>Applicant Details</th>
                        <th>Status</th>
                        <th>Panchayat Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td className="fw-semibold text-dark">
                            {app.scheme?.name || 'Welfare Scheme'}
                            <div><span className="badge bg-light text-secondary border small text-capitalize">{app.scheme?.category}</span></div>
                          </td>
                          <td className="small text-muted">{formatDate(app.appliedAt)}</td>
                          <td className="small">
                            <div>Age: {app.age} yrs | Income: ₹{app.income?.toLocaleString()}</div>
                            {app.landAcres > 0 && <div className="text-muted">Land: {app.landAcres} acres</div>}
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getBadgeClass(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="small text-secondary">{app.remark || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">My Filed Grievances</h5>
                <Link to="/complaints" className="btn btn-sm btn-outline-primary rounded-pill">
                  <i className="bi bi-pencil-square me-1"></i> File New Grievance
                </Link>
              </div>

              {tabLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>
              ) : complaints.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  No grievances logged. Use the <Link to="/complaints" className="text-primary-green fw-semibold">Complaints Page</Link> to report village issues.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {complaints.map((c) => (
                    <div key={c._id} className="p-3 bg-light rounded-4 border">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 small text-capitalize me-2">
                            {c.category}
                          </span>
                          <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getBadgeClass(c.status)}`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="small text-muted">{formatDate(c.createdAt)}</span>
                      </div>
                      <h6 className="fw-bold text-dark mt-2 mb-1">{c.title}</h6>
                      <p className="small text-secondary mb-2">{c.description}</p>
                      {c.panchayatReply && (
                        <div className="p-2 bg-white rounded-3 border small text-success mt-2">
                          <strong>Panchayat Action:</strong> {c.panchayatReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">My Placed Orders</h5>
                <Link to="/cart" className="btn btn-sm btn-outline-primary rounded-pill">
                  <i className="bi bi-cart3 me-1"></i> View Cart
                </Link>
              </div>

              {tabLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>
              ) : orders.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  You haven't placed any orders. Visit the <Link to="/market" className="text-primary-green fw-semibold">Rural Market</Link>.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-muted text-uppercase">
                      <tr>
                        <th>Order ID</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Placed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id}>
                          <td className="font-monospace fw-bold text-dark small">#{o._id.slice(-6).toUpperCase()}</td>
                          <td className="small">
                            {o.items?.map((it, i) => <div key={i}>• {it.name} × {it.quantity}</div>)}
                          </td>
                          <td className="fw-bold text-primary-green">₹{o.total?.toLocaleString()}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getBadgeClass(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="small text-muted">{formatDate(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY MARKET PRODUCE (SELLER MODULE) */}
          {activeTab === 'products' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">My Listed Produce & Goods</h5>
                  <p className="small text-muted mb-0">Manage items you are selling directly to villagers</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <i className="bi bi-plus-lg me-1"></i> List New Product
                </button>
              </div>

              {tabLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>
              ) : products.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  You have not listed any farm produce or goods yet. Click "List New Product" above to start selling!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-muted text-uppercase">
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price / Unit</th>
                        <th>Stock Qty</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td className="fw-semibold text-dark">{p.name}</td>
                          <td>
                            <span className="badge bg-light text-secondary border small text-capitalize">{p.category}</span>
                          </td>
                          <td className="fw-bold text-primary-green">₹{p.price} / {p.unit}</td>
                          <td className="small text-secondary">{p.quantity} {p.unit}s</td>
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-2 py-0 small ${
                                p.isAvailable ? 'btn-outline-success' : 'btn-outline-secondary'
                              }`}
                              onClick={() => handleToggleProductAvailability(p)}
                            >
                              {p.isAvailable ? '✓ In Stock' : '✗ Sold Out'}
                            </button>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-circle p-1"
                              title="Delete listing"
                              onClick={() => handleDeleteProduct(p._id)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MY REGISTERED EVENTS */}
          {activeTab === 'events' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">My Registered Events & Camps</h5>
                <Link to="/events" className="btn btn-sm btn-outline-primary rounded-pill">
                  <i className="bi bi-search me-1"></i> Browse Upcoming Camps
                </Link>
              </div>

              {tabLoading ? (
                <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>
              ) : events.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  You are not registered for any upcoming events. Visit the <Link to="/events" className="text-primary-green fw-semibold">Events Page</Link> to reserve seats.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {events.map((evt) => (
                    <div key={evt._id} className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-1 small text-capitalize me-2">
                          {evt.type}
                        </span>
                        <h6 className="fw-bold text-dark mt-2 mb-1">{evt.title}</h6>
                        <div className="small text-muted">
                          <i className="bi bi-calendar3 me-1 text-primary"></i> {formatDate(evt.date)} | <i className="bi bi-geo-alt me-1 text-danger"></i> {evt.venue}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        onClick={() => handleCancelEvent(evt._id)}
                      >
                        Cancel Seat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MY FEEDBACK & SUGGESTIONS */}
          {activeTab === 'feedback' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Submit Village Feedback or Suggestion</h5>

              {/* Feedback Submission Form */}
              <form onSubmit={handleSubmitFeedback} className="mb-4 p-3 bg-light rounded-4 border">
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <FormInput
                      label="Subject"
                      name="feedbackSubject"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      placeholder="e.g. Request for solar street light in Ward 2"
                      required
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Feedback Type</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                    >
                      <option value="suggestion">Suggestion</option>
                      <option value="appreciation">Appreciation</option>
                      <option value="problem">Problem</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Rating (1 to 5 Stars)</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 - Average)</option>
                      <option value={2}>⭐⭐ (2 - Needs Work)</option>
                      <option value={1}>⭐ (1 - Unsatisfactory)</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Your Message</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Share your suggestion or feedback with the Gram Panchayat..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 mt-3"
                  disabled={feedbackSubmitting}
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit to Panchayat'}
                </button>
              </form>

              {/* Past Feedback History */}
              <h6 className="fw-bold text-dark mb-2">My Submitted Feedback</h6>
              {feedbackList.length === 0 ? (
                <p className="text-muted small">No past feedback submitted.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {feedbackList.map((fb) => (
                    <div key={fb._id} className="p-3 bg-white rounded-3 border small">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-0 text-capitalize me-2">
                            {fb.type}
                          </span>
                          <span className="text-warning">{'⭐'.repeat(fb.rating || 5)}</span>
                        </div>
                        <span className={`badge rounded-pill px-2 py-1 ${fb.isRead ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                          {fb.isRead ? 'Reviewed by Panchayat' : 'Under Review'}
                        </span>
                      </div>
                      <div className="fw-semibold text-dark mt-1">{fb.subject}</div>
                      <div className="text-secondary">{fb.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: List New Produce Item */}
      {showAddProductModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">List Produce on Village Market</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddProductModal(false)}></button>
              </div>

              <form onSubmit={handleAddProduct}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Product Name"
                    name="name"
                    placeholder="e.g. Fresh Organic Tomatoes"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select rounded-3 py-2"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="vegetables">Vegetables</option>
                        <option value="grains">Food Grains</option>
                        <option value="dairy">Dairy & Milk</option>
                        <option value="fruits">Fruits</option>
                        <option value="handicrafts">Handicrafts</option>
                        <option value="other">Other Goods</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Unit of Sale</label>
                      <select
                        className="form-select rounded-3 py-2"
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      >
                        <option value="kg">Per Kilogram (kg)</option>
                        <option value="litre">Per Litre</option>
                        <option value="piece">Per Piece</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mt-1">
                    <div className="col-6">
                      <FormInput
                        label="Price (₹)"
                        name="price"
                        type="number"
                        placeholder="e.g. 40"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <FormInput
                        label="Available Quantity"
                        name="quantity"
                        type="number"
                        placeholder="e.g. 50"
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="Brief details about harvest freshness, quality, or storage..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowAddProductModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={productLoading}>
                    {productLoading ? 'Listing...' : 'Publish to Market'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

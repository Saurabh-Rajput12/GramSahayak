// Villager Self-Service Dashboard for Applications, Complaints, Farm Produce, and Profile
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Dashboard component coordinates all citizen services and personal portal records
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');

  // Logged-in user profile state
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Tab Data States
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [products, setProducts] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

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

  // Fetch data corresponding to active tab
  const fetchTabData = async () => {
    try {
      setTabLoading(true);
      setError('');

      if (activeTab === 'applications') {
        const res = await axios.get('/api/applications/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'complaints') {
        const res = await axios.get('/api/complaints/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'products') {
        const res = await axios.get('/api/products/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Fetch tab data error:', err);
      setError('Unable to load data. Please refresh.');
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab !== 'profile') {
      fetchTabData();
    }
  }, [activeTab]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setError('');
      setSuccess('');

      const updateData = { name: profileName };
      if (profilePassword.trim()) {
        updateData.password = profilePassword;
      }

      const res = await axios.put('/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      setProfilePassword('');
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle produce stock availability
  const handleToggleProductStock = async (prodId) => {
    try {
      await axios.put(`/api/products/${prodId}/toggle-stock`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabData();
    } catch (err) {
      console.error('Toggle stock error:', err);
      setError('Failed to update product stock.');
    }
  };

  // Delete product listing
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      await axios.delete(`/api/products/${prodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Product listing deleted successfully.');
      fetchTabData();
    } catch (err) {
      console.error('Delete product error:', err);
      setError('Failed to delete produce listing.');
    }
  };

  // Delete open complaint
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;
    try {
      await axios.delete(`/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Complaint withdrawn successfully.');
      fetchTabData();
    } catch (err) {
      console.error('Delete complaint error:', err);
      setError(err.response?.data?.message || 'Failed to delete complaint.');
    }
  };

  return (
    <div className="container py-4">
      {/* Dashboard Top Header */}
      <div className="p-4 bg-white rounded-4 border shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small fw-semibold mb-2">
            👤 Villager Portal
          </span>
          <h2 className="fw-bold text-dark mb-0">
            Welcome, {user?.name || user?.username || 'Resident'}
          </h2>
          <p className="text-secondary small mb-0 mt-1">
            Track your scheme applications, complaints, farm produce listings, and profile.
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small">
            Role: <strong>{user?.role}</strong>
          </span>
        </div>
      </div>

      <AlertMessage message={error} type="danger" onClose={() => setError('')} />
      <AlertMessage message={success} type="success" onClose={() => setSuccess('')} />

      {/* Tabs Navigation */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <ul className="nav nav-pills nav-fill p-2 bg-light gap-2 rounded-4">
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'applications' ? 'active bg-success text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('applications')}
            >
              <i className="bi bi-file-earmark-check me-1"></i> My Applications
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'complaints' ? 'active bg-danger text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <i className="bi bi-megaphone me-1"></i> My Complaints
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'products' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="bi bi-shop me-1"></i> My Farm Produce
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'profile' ? 'active bg-secondary text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person-gear me-1"></i> Profile & Password
            </button>
          </li>
        </ul>

        {/* Tab Content Area */}
        <div className="card-body p-4">
          {tabLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Loading your records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: APPLICATIONS */}
              {activeTab === 'applications' && (
                <div>
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-file-earmark-check text-success me-2"></i>
                    Submitted Scheme Applications ({applications.length})
                  </h5>
                  {applications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <p>You have not applied for any welfare schemes yet.</p>
                      <a href="/schemes" className="btn btn-outline-success btn-sm rounded-pill px-4">
                        Browse Welfare Schemes
                      </a>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Scheme Name</th>
                            <th>Applicant</th>
                            <th>Annual Income</th>
                            <th>Status</th>
                            <th>Panchayat Remark</th>
                            <th>Applied Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr key={app._id}>
                              <td className="fw-semibold text-dark">
                                {app.scheme?.name || 'Welfare Scheme'}
                              </td>
                              <td>{app.fullName} ({app.age} yrs)</td>
                              <td>₹{app.income?.toLocaleString('en-IN')}</td>
                              <td>
                                {app.status === 'approved' && (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                                    Approved
                                  </span>
                                )}
                                {app.status === 'rejected' && (
                                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">
                                    Rejected
                                  </span>
                                )}
                                {app.status === 'pending' && (
                                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1">
                                    Under Review
                                  </span>
                                )}
                              </td>
                              <td className="small text-secondary">
                                {app.remark || <span className="text-muted italic">—</span>}
                              </td>
                              <td className="small text-muted">
                                {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div>
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-megaphone text-danger me-2"></i>
                    Your Grievances & Redressal Status ({complaints.length})
                  </h5>
                  {complaints.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <p>No complaints lodged by you.</p>
                      <a href="/complaints" className="btn btn-outline-danger btn-sm rounded-pill px-4">
                        Lodge a Complaint
                      </a>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {complaints.map((c) => (
                        <div key={c._id} className="p-3 rounded-4 border bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-secondary rounded-pill text-capitalize small">
                              {c.category}
                            </span>
                            <div>
                              {c.status === 'resolved' && (
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                                  Resolved
                                </span>
                              )}
                              {c.status === 'in_progress' && (
                                <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-1">
                                  In Progress
                                </span>
                              )}
                              {c.status === 'open' && (
                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1">
                                  Open
                                </span>
                              )}
                            </div>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">{c.title}</h6>
                          <p className="small text-secondary mb-2">{c.description}</p>

                          {c.panchayatReply ? (
                            <div className="p-2 bg-white rounded-3 border-start border-3 border-success small mt-2">
                              <strong>Panchayat Official Reply:</strong> {c.panchayatReply}
                            </div>
                          ) : (
                            <div className="small text-muted italic">Awaiting Panchayat response...</div>
                          )}

                          {c.status === 'open' && (
                            <div className="mt-2 text-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                onClick={() => handleDeleteComplaint(c._id)}
                              >
                                Cancel Grievance
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FARM PRODUCE */}
              {activeTab === 'products' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="bi bi-shop text-warning me-2"></i>
                      Your Krishi Bazaar Listings ({products.length})
                    </h5>
                    <a href="/market" className="btn btn-outline-success btn-sm rounded-pill px-3">
                      <i className="bi bi-plus-circle me-1"></i> Add Produce in Market
                    </a>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <p>You haven't listed any farm produce for sale yet.</p>
                      <a href="/market" className="btn btn-success btn-sm rounded-pill px-4">
                        List Produce Now
                      </a>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Produce</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Available Qty</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p._id}>
                              <td className="fw-semibold text-dark">{p.name}</td>
                              <td className="text-capitalize small">{p.category}</td>
                              <td className="fw-bold text-primary-green">₹{p.price} / {p.unit}</td>
                              <td>{p.quantity} {p.unit}</td>
                              <td>
                                <button
                                  type="button"
                                  className={`btn btn-sm rounded-pill px-3 ${p.isAvailable ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                  onClick={() => handleToggleProductStock(p._id)}
                                >
                                  {p.isAvailable ? 'In Stock' : 'Sold Out'}
                                </button>
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleDeleteProduct(p._id)}
                                >
                                  Delete
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

              {/* TAB 4: PROFILE */}
              {activeTab === 'profile' && (
                <div style={{ maxWidth: '500px' }}>
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="bi bi-person-gear text-secondary me-2"></i>
                    Account Profile Settings
                  </h5>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Username (Cannot be changed)</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={user?.username || ''}
                        disabled
                      />
                    </div>

                    <FormInput
                      label="Full Name"
                      name="name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />

                    <FormInput
                      label="Change Password (leave blank to keep current)"
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                    />

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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

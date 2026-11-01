// User Management panel allowing Panchayat administrators to search, block/unblock, and reset user passwords
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// UserManagement component handles account moderation, status toggling, and administrative password resets
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [blocked, setBlocked] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password reset modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const currentAdminId = userJson ? JSON.parse(userJson)._id : null;

  // Fetch users with search and filter parameters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (role) params.role = role;
      if (blocked !== '') params.blocked = blocked;

      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Unable to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [search, role, blocked, token]);

  // Toggle user blocked status (Block / Unblock)
  const handleToggleBlock = async (user) => {
    try {
      setError('');
      setSuccess('');
      const response = await axios.put(`/api/users/${user._id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      fetchUsers();
    } catch (err) {
      console.error('Toggle block error:', err);
      setError(err.response?.data?.message || 'Failed to update user block status.');
    }
  };

  // Open reset password modal
  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetModal(true);
  };

  // Submit new password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await axios.put(`/api/users/${selectedUser._id}/reset-password`, {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      setShowResetModal(false);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user account "${user.username}"?`)) return;

    try {
      setError('');
      setSuccess('');
      const response = await axios.delete(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">👥</span> Village User Account Management
          </h2>
          <p className="text-muted small mb-0">
            View registered villager profiles, toggle block access, and issue administrative password resets
          </p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search name or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="villager">Villagers</option>
              <option value="panchayat">Panchayat Admins</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={blocked}
              onChange={(e) => setBlocked(e.target.value)}
            >
              <option value="">All Account Statuses</option>
              <option value="false">Active Only</option>
              <option value="true">Blocked Only</option>
            </select>
          </div>

          <div className="col-12 col-md-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill w-100"
              onClick={() => { setSearch(''); setRole(''); setBlocked(''); }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success"></div>
          <p className="small text-muted mt-2 mb-0">Loading village registered users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">
          No user accounts found matching your search.
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Villager Profile</th>
                  <th scope="col" className="py-3">Role</th>
                  <th scope="col" className="py-3">Account Status</th>
                  <th scope="col" className="py-3">Registered On</th>
                  <th scope="col" className="pe-4 py-3 text-end">Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentSelf = u._id === currentAdminId;
                  return (
                    <tr key={u._id}>
                      <td className="ps-4 py-3">
                        <div className="fw-semibold text-dark">{u.name}</div>
                        <span className="small text-muted">@{u.username}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${
                          u.role === 'panchayat' ? 'bg-primary text-white' : 'bg-secondary text-white'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.isBlocked ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 small">
                            <i className="bi bi-slash-circle me-1"></i> Blocked
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small">
                            <i className="bi bi-check-circle me-1"></i> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 small text-muted">{formatDate(u.createdAt)}</td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {/* Block / Unblock Toggle */}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-2 py-1 ${
                              u.isBlocked ? 'btn-outline-success' : 'btn-outline-warning'
                            }`}
                            disabled={isCurrentSelf}
                            title={isCurrentSelf ? 'Cannot block own account' : u.isBlocked ? 'Unblock user' : 'Block user'}
                            onClick={() => handleToggleBlock(u)}
                          >
                            <i className={`bi ${u.isBlocked ? 'bi-unlock' : 'bi-lock'}`}></i>{' '}
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1"
                            title="Reset Password"
                            onClick={() => handleOpenReset(u)}
                          >
                            <i className="bi bi-key"></i> Reset
                          </button>

                          {/* Delete Account */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                            disabled={isCurrentSelf}
                            title={isCurrentSelf ? 'Cannot delete own account' : 'Delete user'}
                            onClick={() => handleDeleteUser(u)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Reset User Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetModal(false)}></button>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="modal-body pt-3">
                  <p className="small text-muted mb-3">
                    Assign a new secure login password for user <strong>@{selectedUser.username}</strong> ({selectedUser.name}).
                  </p>

                  <FormInput
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    helperText="User can use this password to immediately log in"
                  />
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowResetModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={resetLoading}>
                    {resetLoading ? 'Saving...' : 'Set Password'}
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

export default UserManagement;

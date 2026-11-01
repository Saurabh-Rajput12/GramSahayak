// Complaint Management panel for Panchayat grievance inspection and official reply logging
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';

// ComplaintManagement component enables village officials to filter, examine, and address citizen grievances
const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Respond Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [status, setStatus] = useState('in_progress');
  const [panchayatReply, setPanchayatReply] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch complaints with filters
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const response = await axios.get('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setError('Unable to load village complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [statusFilter, categoryFilter, search, token]);

  // Open respond modal
  const handleOpenRespond = (c) => {
    setSelectedComplaint(c);
    setStatus(c.status === 'open' ? 'in_progress' : c.status);
    setPanchayatReply(c.panchayatReply || '');
    setShowRespondModal(true);
  };

  // Submit response & status update
  const handleSaveResponse = async (e) => {
    e.preventDefault();
    setRespondLoading(true);
    try {
      await axios.put(`/api/complaints/${selectedComplaint._id}/respond`, {
        status,
        panchayatReply: panchayatReply.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Response recorded and grievance status updated.');
      setShowRespondModal(false);
      fetchComplaints();
    } catch (err) {
      console.error('Respond complaint error:', err);
      setError(err.response?.data?.message || 'Failed to update complaint response.');
    } finally {
      setRespondLoading(false);
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

  // Status badge styling helper
  const getBadgeClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'badge-status-resolved';
      case 'in_progress':
        return 'badge-status-in_progress';
      case 'open':
      default:
        return 'badge-status-pending';
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <span className="text-warning me-2">🛠️</span> Complaints & Grievance Redressal
        </h2>
        <p className="text-muted small mb-0">Track and respond to civic issues filed by residents</p>
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
                placeholder="Search complaint title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open Only</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="water">Water Supply</option>
              <option value="road">Roads</option>
              <option value="electricity">Electricity / Lighting</option>
              <option value="sanitation">Sanitation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-12 col-md-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill w-100"
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : complaints.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No complaints found.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Complaint / Resident</th>
                  <th scope="col" className="py-3">Category</th>
                  <th scope="col" className="py-3">Date</th>
                  <th scope="col" className="py-3">Status</th>
                  <th scope="col" className="py-3">Panchayat Action</th>
                  <th scope="col" className="pe-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td className="ps-4 py-3">
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <span className="small text-muted">Filed by: {c.user?.name} (@{c.user?.username})</span>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-secondary border small text-capitalize">{c.category}</span>
                    </td>
                    <td className="py-3 small text-muted">{formatDate(c.createdAt)}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getBadgeClass(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 small text-secondary" style={{ maxWidth: '250px' }}>
                      {c.panchayatReply || <span className="text-muted fst-italic">Pending action</span>}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleOpenRespond(c)}
                      >
                        <i className="bi bi-reply-fill me-1"></i> Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {showRespondModal && selectedComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Respond to Grievance</h5>
                <button type="button" className="btn-close" onClick={() => setShowRespondModal(false)}></button>
              </div>

              <form onSubmit={handleSaveResponse}>
                <div className="modal-body pt-3">
                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <div className="mb-1"><strong>Title:</strong> {selectedComplaint.title}</div>
                    <div className="mb-1"><strong>Resident:</strong> {selectedComplaint.user?.name} (@{selectedComplaint.user?.username})</div>
                    <div><strong>Description:</strong> {selectedComplaint.description}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Update Status</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Official Panchayat Action / Reply</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      placeholder="e.g. Panchayat plumber dispatched; new pipeline parts installed..."
                      value={panchayatReply}
                      onChange={(e) => setPanchayatReply(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowRespondModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={respondLoading}>
                    {respondLoading ? 'Saving...' : 'Update & Reply'}
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

export default ComplaintManagement;

// Application Management panel for reviewing and approving villager scheme requests
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';

// ApplicationManagement component enables Panchayat officials to review and sanction scheme applications
const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Review modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [remark, setRemark] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch applications with optional status filter
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setApplications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError('Unable to load applications list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [statusFilter, token]);

  // Open review modal
  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setReviewStatus(app.status === 'pending' ? 'approved' : app.status);
    setRemark(app.remark || '');
    setShowReviewModal(true);
  };

  // Submit review status and remarks
  const handleSaveReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await axios.put(`/api/applications/${selectedApp._id}`, {
        status: reviewStatus,
        remark: remark.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Application marked as ${reviewStatus}.`);
      setShowReviewModal(false);
      fetchApplications();
    } catch (err) {
      console.error('Review application error:', err);
      setError(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setReviewLoading(false);
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

  // Status badge styling helper
  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-status-approved';
      case 'rejected':
        return 'badge-status-rejected';
      case 'pending':
      default:
        return 'badge-status-pending';
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-info me-2">📑</span> Welfare Scheme Applications Review
          </h2>
          <p className="text-muted small mb-0">Review eligibility data, verify revenue documents, and sanction benefits</p>
        </div>

        {/* Status filter dropdown */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Applications</option>
            <option value="pending">Pending Review Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : applications.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No applications found.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Applicant Name</th>
                  <th scope="col" className="py-3">Scheme Applied</th>
                  <th scope="col" className="py-3">Age / Income / Land</th>
                  <th scope="col" className="py-3">Applied Date</th>
                  <th scope="col" className="py-3">Current Status</th>
                  <th scope="col" className="pe-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="ps-4 py-3">
                      <div className="fw-semibold text-dark">{app.fullName}</div>
                      <span className="small text-muted">@{app.user?.username}</span>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">{app.scheme?.name || 'Scheme'}</div>
                      <span className="badge bg-light text-secondary border small text-capitalize">{app.scheme?.category}</span>
                    </td>
                    <td className="py-3 small">
                      <div>Age: <strong>{app.age}</strong> yrs | Income: <strong>₹{app.income?.toLocaleString()}</strong></div>
                      {app.landAcres > 0 && <div className="text-muted">Land: {app.landAcres} acres</div>}
                    </td>
                    <td className="py-3 small text-muted">{formatDate(app.appliedAt)}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-1 text-capitalize ${getBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        onClick={() => handleOpenReview(app)}
                      >
                        <i className="bi bi-pencil-square me-1"></i> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Review Scheme Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>

              <form onSubmit={handleSaveReview}>
                <div className="modal-body pt-3">
                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <div className="mb-1"><strong>Applicant:</strong> {selectedApp.fullName} (@{selectedApp.user?.username})</div>
                    <div className="mb-1"><strong>Scheme:</strong> {selectedApp.scheme?.name}</div>
                    <div className="mb-1"><strong>Age:</strong> {selectedApp.age} years | <strong>Income:</strong> ₹{selectedApp.income?.toLocaleString()}/yr</div>
                    <div><strong>Landholding:</strong> {selectedApp.landAcres} Acres</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Decision Status</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved / Sanctioned</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Panchayat Official Remark / Reason</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="e.g. Documents verified against Gram Panchayat Khatauni register..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={reviewLoading}>
                    {reviewLoading ? 'Saving...' : 'Update Application'}
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

export default ApplicationManagement;

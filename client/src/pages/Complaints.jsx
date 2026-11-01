// Complaints grievance filing and tracking page for villagers
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Complaints component enables villagers to submit and monitor civic grievances
const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Complaint submission form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('water');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit complaint modal state
  const [editComplaint, setEditComplaint] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('water');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch complaints filed by the currently logged-in user
  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/complaints/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setError('Unable to load your grievances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyComplaints();
    }
  }, [token]);

  // Submit a new complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both complaint title and details.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/complaints', {
        title: title.trim(),
        category,
        description: description.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Grievance filed successfully! Panchayat has been notified.');
      setTitle('');
      setDescription('');
      fetchMyComplaints();
    } catch (err) {
      console.error('Submit complaint error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to file complaint.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal for an open complaint
  const handleOpenEdit = (c) => {
    setEditComplaint(c);
    setEditTitle(c.title);
    setEditCategory(c.category);
    setEditDescription(c.description);
    setShowEditModal(true);
  };

  // Save edited complaint
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(`/api/complaints/${editComplaint._id}`, {
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Complaint updated successfully.');
      setShowEditModal(false);
      fetchMyComplaints();
    } catch (err) {
      console.error('Update complaint error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update complaint.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Delete an open complaint
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      setError('');
      await axios.delete(`/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Complaint deleted.');
      fetchMyComplaints();
    } catch (err) {
      console.error('Delete complaint error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete complaint.');
      }
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'badge-status-open';
      case 'in_progress':
        return 'badge-status-in_progress';
      case 'resolved':
        return 'badge-status-resolved';
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
      year: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <span className="text-warning me-2">🛠️</span> Village Grievance Redressal
        </h2>
        <p className="text-muted small mb-0">
          File civic complaints regarding drinking water leaks, street lighting, roads, and village sanitation
        </p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      <div className="row g-4">
        {/* Left Column: Complaint Submission Form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-pencil-square text-success me-2"></i> File a New Complaint
            </h5>

            <form onSubmit={handleSubmit}>
              <FormInput
                label="Complaint Subject / Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken water pipe near Ward 3 handpump"
                required
                helperText="Brief summary of the issue"
              />

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select rounded-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="water">Drinking Water Supply</option>
                  <option value="road">Road & Pathway Repair</option>
                  <option value="electricity">Street Lights & Electricity</option>
                  <option value="sanitation">Waste & Sanitation</option>
                  <option value="other">Other Public Infrastructure</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Detailed Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows="4"
                  placeholder="Describe the issue, location landmark, and when it started..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <i className="bi bi-send-fill"></i> Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List of My Complaints */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">My Submitted Complaints</h5>
              <span className="badge bg-light text-secondary border small">
                {complaints.length} Records
              </span>
            </div>

            {loading ? (
              <div className="p-5 text-center">
                <div className="spinner-border text-success" role="status"></div>
                <p className="small text-muted mt-2 mb-0">Loading your grievances...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-5 text-center text-muted">
                You have not filed any complaints yet. Use the form on the left to submit a village issue.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {complaints.map((c) => (
                  <div key={c._id} className="p-3 bg-light rounded-4 border">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-secondary-subtle text-secondary border rounded-pill px-2 py-1 text-capitalize me-2 small">
                          {c.category}
                        </span>
                        <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getStatusBadge(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="small text-muted">
                        <i className="bi bi-calendar3 me-1"></i> {formatDate(c.createdAt)}
                      </span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1">{c.title}</h6>
                    <p className="small text-secondary mb-2" style={{ whiteSpace: 'pre-line' }}>
                      {c.description}
                    </p>

                    {/* Official Panchayat Reply Box */}
                    {c.panchayatReply ? (
                      <div className="p-3 bg-white rounded-3 border border-success-subtle mt-2 small">
                        <div className="fw-semibold text-success mb-1">
                          <i className="bi bi-chat-left-dots-fill me-1"></i> Panchayat Action & Reply:
                        </div>
                        <div className="text-secondary">{c.panchayatReply}</div>
                      </div>
                    ) : (
                      <div className="small text-muted fst-italic">
                        <i className="bi bi-hourglass-split me-1"></i> Awaiting review by Panchayat Sachiv
                      </div>
                    )}

                    {/* Action buttons (only allowed while status is open) */}
                    {c.status === 'open' && (
                      <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                          onClick={() => handleDelete(c._id)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Complaint Modal */}
      {showEditModal && editComplaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Edit Open Complaint</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Complaint Title"
                    name="editTitle"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      <option value="water">Drinking Water Supply</option>
                      <option value="road">Road & Pathway Repair</option>
                      <option value="electricity">Street Lights & Electricity</option>
                      <option value="sanitation">Waste & Sanitation</option>
                      <option value="other">Other Public Infrastructure</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
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

export default Complaints;

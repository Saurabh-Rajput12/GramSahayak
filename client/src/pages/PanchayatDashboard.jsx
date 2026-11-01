// Unified Panchayat Administrative Dashboard for Mini Project
// Manages Applications, Grievances, Welfare Schemes, and Village Notices
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

const PanchayatDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');

  // Summary counts
  const [summary, setSummary] = useState({
    totalVillagers: 0,
    totalSchemes: 0,
    totalProducts: 0,
    totalNotices: 0,
    complaints: { total: 0, open: 0, in_progress: 0, resolved: 0 },
    applications: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });

  // Tab data lists
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');

  // Modals & Action States
  // 1. Review Application Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewRemark, setReviewRemark] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // 2. Respond to Complaint Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // 3. Add Scheme Modal
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: '',
    category: 'farmer',
    description: '',
    minAge: 18,
    maxIncome: 300000,
    documentsRequired: 'Aadhaar Card, Land Records, Bank Passbook'
  });

  // 4. Add Notice Modal
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    body: '',
    type: 'meeting'
  });

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  // Fetch summary and tab data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch summary stats
      const summaryRes = await axios.get('/api/reports/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(summaryRes.data);

      if (activeTab === 'applications') {
        const params = {};
        if (appStatusFilter) params.status = appStatusFilter;
        const res = await axios.get('/api/applications', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setApplications(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'complaints') {
        const params = {};
        if (complaintStatusFilter) params.status = complaintStatusFilter;
        const res = await axios.get('/api/complaints', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setComplaints(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'schemes') {
        const res = await axios.get('/api/schemes');
        setSchemes(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'notices') {
        const res = await axios.get('/api/notices');
        setNotices(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Fetch panchayat data error:', err);
      setError('Unable to load Panchayat records. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, appStatusFilter, complaintStatusFilter]);

  // Submit Application Review (Approve / Reject)
  const handleReviewApplication = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setReviewLoading(true);
      setError('');
      setSuccess('');

      await axios.put(`/api/applications/${selectedApp._id}`, {
        status: reviewStatus,
        remark: reviewRemark
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Application marked as ${reviewStatus} successfully.`);
      setSelectedApp(null);
      setReviewRemark('');
      fetchData();
    } catch (err) {
      console.error('Review application error:', err);
      setError(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Submit Complaint Response
  const handleRespondComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setReplyLoading(true);
      setError('');
      setSuccess('');

      await axios.put(`/api/complaints/${selectedComplaint._id}/respond`, {
        status: replyStatus,
        panchayatReply: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Grievance response and status updated successfully.');
      setSelectedComplaint(null);
      setReplyText('');
      fetchData();
    } catch (err) {
      console.error('Respond complaint error:', err);
      setError(err.response?.data?.message || 'Failed to update grievance.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Create Scheme
  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      setSchemeLoading(true);
      setError('');
      setSuccess('');

      const docs = newScheme.documentsRequired
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      await axios.post('/api/schemes', {
        name: newScheme.name,
        category: newScheme.category,
        description: newScheme.description,
        minAge: Number(newScheme.minAge),
        maxIncome: Number(newScheme.maxIncome),
        documentsRequired: docs
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Scheme "${newScheme.name}" created successfully.`);
      setShowAddSchemeModal(false);
      setNewScheme({
        name: '',
        category: 'farmer',
        description: '',
        minAge: 18,
        maxIncome: 300000,
        documentsRequired: 'Aadhaar Card, Land Records, Bank Passbook'
      });
      fetchData();
    } catch (err) {
      console.error('Create scheme error:', err);
      setError(err.response?.data?.message || 'Failed to create scheme.');
    } finally {
      setSchemeLoading(false);
    }
  };

  // Delete Scheme
  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await axios.delete(`/api/schemes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Scheme deleted successfully.');
      fetchData();
    } catch (err) {
      console.error('Delete scheme error:', err);
      setError('Failed to delete scheme.');
    }
  };

  // Create Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      setNoticeLoading(true);
      setError('');
      setSuccess('');

      await axios.post('/api/notices', {
        title: newNotice.title,
        body: newNotice.body,
        type: newNotice.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Village notice published successfully.');
      setShowAddNoticeModal(false);
      setNewNotice({ title: '', body: '', type: 'meeting' });
      fetchData();
    } catch (err) {
      console.error('Create notice error:', err);
      setError(err.response?.data?.message || 'Failed to create notice.');
    } finally {
      setNoticeLoading(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await axios.delete(`/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Notice deleted successfully.');
      fetchData();
    } catch (err) {
      console.error('Delete notice error:', err);
      setError('Failed to delete notice.');
    }
  };

  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-4 border shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-3 py-1 rounded-pill small fw-semibold mb-2">
            🛡️ Official Control Panel
          </span>
          <h2 className="fw-bold text-dark mb-0">Panchayat Administration</h2>
          <p className="text-secondary small mb-0 mt-1">
            Review scheme applications, address public grievances, publish circulars, and manage schemes.
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge bg-light text-success border px-3 py-2 rounded-pill small">
            <i className="bi bi-people me-1"></i> {summary.totalVillagers} Registered Citizens
          </span>
        </div>
      </div>

      <AlertMessage message={error} type="danger" onClose={() => setError('')} />
      <AlertMessage message={success} type="success" onClose={() => setSuccess('')} />

      {/* 4 Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <div className="text-muted small">Pending Applications</div>
            <div className="fw-bold fs-3 text-warning">
              {summary.applications?.pending || 0}
            </div>
            <div className="small text-muted">{summary.applications?.total || 0} Total Applied</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <div className="text-muted small">Open Grievances</div>
            <div className="fw-bold fs-3 text-danger">
              {summary.complaints?.open || 0}
            </div>
            <div className="small text-success">{summary.complaints?.resolved || 0} Resolved</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <div className="text-muted small">Welfare Schemes</div>
            <div className="fw-bold fs-3 text-success">
              {summary.totalSchemes || 0}
            </div>
            <div className="small text-muted">Active Programs</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
            <div className="text-muted small">Published Notices</div>
            <div className="fw-bold fs-3 text-info">
              {summary.totalNotices || 0}
            </div>
            <div className="small text-muted">Public Circulars</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <ul className="nav nav-pills nav-fill p-2 bg-light gap-2 rounded-4">
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'applications' ? 'active bg-warning text-dark' : 'text-secondary'}`}
              onClick={() => setActiveTab('applications')}
            >
              <i className="bi bi-file-earmark-check me-1"></i> Review Applications ({summary.applications?.pending || 0} Pending)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'complaints' ? 'active bg-danger text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <i className="bi bi-megaphone me-1"></i> Grievances Redressal ({summary.complaints?.open || 0} Open)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'schemes' ? 'active bg-success text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('schemes')}
            >
              <i className="bi bi-journal-bookmark me-1"></i> Manage Schemes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill py-2 fw-semibold ${activeTab === 'notices' ? 'active bg-info text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('notices')}
            >
              <i className="bi bi-bell me-1"></i> Village Notices
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Loading records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: APPLICATIONS */}
              {activeTab === 'applications' && (
                <div>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <h5 className="fw-bold text-dark mb-0">Citizen Scheme Applications</h5>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm rounded-pill"
                        value={appStatusFilter}
                        onChange={(e) => setAppStatusFilter(e.target.value)}
                        style={{ maxWidth: '180px' }}
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved Only</option>
                        <option value="rejected">Rejected Only</option>
                      </select>
                    </div>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-5 text-muted">No applications found.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Scheme</th>
                            <th>Applicant</th>
                            <th>Age & Income</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr key={app._id}>
                              <td className="fw-semibold text-dark">{app.scheme?.name || 'Scheme'}</td>
                              <td>{app.fullName}</td>
                              <td>{app.age} yrs &bull; ₹{app.income?.toLocaleString('en-IN')}</td>
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
                                    Pending Review
                                  </span>
                                )}
                              </td>
                              <td className="small text-secondary">{app.remark || '—'}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setReviewStatus(app.status === 'pending' ? 'approved' : app.status);
                                    setReviewRemark(app.remark || '');
                                  }}
                                >
                                  Review
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

              {/* TAB 2: COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <h5 className="fw-bold text-dark mb-0">Village Grievances Redressal</h5>
                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm rounded-pill"
                        value={complaintStatusFilter}
                        onChange={(e) => setComplaintStatusFilter(e.target.value)}
                        style={{ maxWidth: '180px' }}
                      >
                        <option value="">All Statuses</option>
                        <option value="open">Open Only</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="text-center py-5 text-muted">No complaints filed yet.</div>
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
                          <div className="small text-muted mb-2">
                            <i className="bi bi-person me-1"></i> Filed by: {c.user?.name || 'Villager'} &bull; {new Date(c.createdAt).toLocaleDateString('en-IN')}
                          </div>

                          {c.panchayatReply && (
                            <div className="p-2 bg-white rounded-3 border-start border-3 border-success small mb-2">
                              <strong>Official Reply:</strong> {c.panchayatReply}
                            </div>
                          )}

                          <div className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              onClick={() => {
                                setSelectedComplaint(c);
                                setReplyStatus(c.status === 'open' ? 'in_progress' : c.status);
                                setReplyText(c.panchayatReply || '');
                              }}
                            >
                              Update Status & Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MANAGE SCHEMES */}
              {activeTab === 'schemes' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Active Welfare Schemes ({schemes.length})</h5>
                    <button
                      type="button"
                      className="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                      onClick={() => setShowAddSchemeModal(true)}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add New Scheme
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Scheme Name</th>
                          <th>Category</th>
                          <th>Eligibility</th>
                          <th>Max Income</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schemes.map((s) => (
                          <tr key={s._id}>
                            <td className="fw-semibold text-dark">{s.name}</td>
                            <td className="text-capitalize small">{s.category}</td>
                            <td className="small text-muted">Min {s.minAge} years</td>
                            <td className="small text-muted">₹{s.maxIncome ? s.maxIncome.toLocaleString('en-IN') : 'No Limit'}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                onClick={() => handleDeleteScheme(s._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: VILLAGE NOTICES */}
              {activeTab === 'notices' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Official Circulars & Notices ({notices.length})</h5>
                    <button
                      type="button"
                      className="btn btn-info text-white btn-sm rounded-pill px-3 fw-semibold"
                      onClick={() => setShowAddNoticeModal(true)}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Publish Notice
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {notices.map((n) => (
                      <div key={n._id} className="p-3 rounded-4 border bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex gap-2 align-items-center mb-1">
                            <span className="badge bg-primary-subtle text-primary rounded-pill small text-uppercase">
                              {n.type}
                            </span>
                            <small className="text-muted">
                              {new Date(n.date).toLocaleDateString('en-IN')}
                            </small>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">{n.title}</h6>
                          <p className="small text-secondary mb-0">{n.body}</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 ms-3"
                          onClick={() => handleDeleteNotice(n._id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Application Modal */}
      {selectedApp && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Review Scheme Application</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedApp(null)}
                ></button>
              </div>
              <form onSubmit={handleReviewApplication}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="text-muted small">Scheme:</label>
                    <div className="fw-bold text-dark">{selectedApp.scheme?.name}</div>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small">Applicant Details:</label>
                    <div className="fw-bold text-dark">{selectedApp.fullName} ({selectedApp.age} years)</div>
                    <div className="small text-muted">Annual Income: ₹{selectedApp.income?.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Application Decision *</label>
                    <select
                      className="form-select"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      required
                    >
                      <option value="approved">Approved (स्वीकृत)</option>
                      <option value="rejected">Rejected (अस्वीकृत)</option>
                      <option value="pending">Keep Pending (लंबित)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Panchayat Remark / Reason</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Land records verified. Approved for grant."
                      value={reviewRemark}
                      onChange={(e) => setReviewRemark(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setSelectedApp(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? 'Saving...' : 'Submit Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Respond Complaint Modal */}
      {selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-danger text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Grievance Status & Response</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedComplaint(null)}
                ></button>
              </div>
              <form onSubmit={handleRespondComplaint}>
                <div className="modal-body p-4">
                  <div className="mb-2">
                    <span className="badge bg-secondary rounded-pill small text-capitalize">{selectedComplaint.category}</span>
                  </div>
                  <h6 className="fw-bold text-dark">{selectedComplaint.title}</h6>
                  <p className="small text-secondary mb-3">{selectedComplaint.description}</p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Grievance Status *</label>
                    <select
                      className="form-select"
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      required
                    >
                      <option value="in_progress">In Progress (कार्यवाही जारी है)</option>
                      <option value="resolved">Resolved (समस्या का समाधान हो गया)</option>
                      <option value="open">Open (खुला है)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Official Reply to Villager *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Maintenance technician dispatched to repair the handpump."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill px-4"
                    disabled={replyLoading}
                  >
                    {replyLoading ? 'Updating...' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Scheme Modal */}
      {showAddSchemeModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Add Government Welfare Scheme</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddSchemeModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateScheme}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Scheme Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. PM Fasal Bima Yojana"
                      value={newScheme.name}
                      onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={newScheme.category}
                        onChange={(e) => setNewScheme({ ...newScheme, category: e.target.value })}
                        required
                      >
                        <option value="farmer">Farmer</option>
                        <option value="health">Health</option>
                        <option value="housing">Housing</option>
                        <option value="pension">Pension</option>
                        <option value="education">Education</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Min Age (Years)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newScheme.minAge}
                        onChange={(e) => setNewScheme({ ...newScheme, minAge: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Max Annual Income Ceiling (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      placeholder="e.g. 300000"
                      value={newScheme.maxIncome}
                      onChange={(e) => setNewScheme({ ...newScheme, maxIncome: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description *</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Describe the scheme benefits and coverage"
                      value={newScheme.description}
                      onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Required Documents (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Aadhaar Card, Land Records, Bank Passbook"
                      value={newScheme.documentsRequired}
                      onChange={(e) => setNewScheme({ ...newScheme, documentsRequired: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddSchemeModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4"
                    disabled={schemeLoading}
                  >
                    {schemeLoading ? 'Creating...' : 'Save Scheme'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddNoticeModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-info text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Publish Village Notice</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddNoticeModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateNotice}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notice Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gram Sabha Monthly Meeting"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notice Type *</label>
                    <select
                      className="form-select"
                      value={newNotice.type}
                      onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                      required
                    >
                      <option value="meeting">Gram Sabha Meeting</option>
                      <option value="camp">Health / Immunization Camp</option>
                      <option value="water">Canal / Water Supply Schedule</option>
                      <option value="general">General Announcement</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notice Body / Message *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Detailed notice information for villagers..."
                      value={newNotice.body}
                      onChange={(e) => setNewNotice({ ...newNotice, body: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddNoticeModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info text-white rounded-pill px-4"
                    disabled={noticeLoading}
                  >
                    {noticeLoading ? 'Publishing...' : 'Publish Notice'}
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

export default PanchayatDashboard;

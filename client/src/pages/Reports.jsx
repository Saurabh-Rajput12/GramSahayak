// Panchayat Village Reports and statistical analytics page
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

// Reports component visualizes village metrics using Bootstrap cards and native CSS progress indicators
const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch report summary counts from backend
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/reports/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (err) {
      console.error('Fetch reports summary error:', err);
      setError('Unable to load village report statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary();
    }
  }, [token]);

  // Calculate resolution percentage for complaints
  const totalComplaints = summary?.complaints?.total || 0;
  const resolvedComplaints = summary?.complaints?.resolved || 0;
  const resolutionPercentage = totalComplaints > 0
    ? Math.round((resolvedComplaints / totalComplaints) * 100)
    : 0;

  // Calculate approval percentage for welfare applications
  const totalApplications = summary?.applications?.total || 0;
  const approvedApplications = summary?.applications?.approved || 0;
  const approvalPercentage = totalApplications > 0
    ? Math.round((approvedApplications / totalApplications) * 100)
    : 0;

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">📊</span> Village Governance Reports & Statistics
          </h2>
          <p className="text-muted small mb-0">
            Real-time metric summary of resident population, welfare approvals, grievance resolution, and market activity
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm"
          onClick={fetchSummary}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Metrics
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status"></div>
          <p className="small text-muted mt-2 mb-0">Calculating village statistics with Mongoose countDocuments...</p>
        </div>
      ) : !summary ? null : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Total Registered Villagers</span>
                  <span className="fs-4">👥</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{summary.totalVillagers}</h3>
                <div className="small text-muted mt-1">
                  {summary.blockedUsers > 0 ? (
                    <span className="text-danger fw-semibold">{summary.blockedUsers} blocked accounts</span>
                  ) : (
                    <span className="text-success">All accounts active</span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Total Welfare Schemes</span>
                  <span className="fs-4">📜</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{summary.totalSchemes}</h3>
                <div className="small text-muted mt-1">Available for villagers</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Village Market Orders</span>
                  <span className="fs-4">🛍️</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{summary.totalOrders}</h3>
                <div className="small text-muted mt-1">{summary.totalProducts} active produce items</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Citizen Feedback</span>
                  <span className="fs-4">💬</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{summary.unreadFeedback}</h3>
                <div className="small text-muted mt-1">
                  {summary.unreadFeedback > 0 ? (
                    <span className="text-warning fw-semibold">Pending review</span>
                  ) : (
                    <span className="text-success">All reviewed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grievance Resolution Progress Section */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Civic Grievance Resolution Rate</h5>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                    {resolutionPercentage}% Resolved
                  </span>
                </div>

                {/* Plain-CSS Progress Bar */}
                <div className="progress mb-3" style={{ height: '16px', borderRadius: '10px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${resolutionPercentage}%` }}
                    aria-valuenow={resolutionPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {resolutionPercentage}%
                  </div>
                </div>

                {/* Status Breakdown Grid */}
                <div className="row g-2 text-center mt-2">
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">Open</div>
                      <div className="fw-bold text-warning fs-5">{summary.complaints?.open || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">In Progress</div>
                      <div className="fw-bold text-primary fs-5">{summary.complaints?.in_progress || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">Resolved</div>
                      <div className="fw-bold text-success fs-5">{summary.complaints?.resolved || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="small text-muted mt-3">
                  <i className="bi bi-info-circle me-1 text-primary"></i> Total {totalComplaints} citizen grievances registered across drinking water, roads, electricity, and sanitation.
                </div>
              </div>
            </div>

            {/* Scheme Applications Breakdown Section */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Welfare Applications Processing</h5>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                    {approvalPercentage}% Sanctioned
                  </span>
                </div>

                {/* Plain-CSS Progress Bar for Approvals */}
                <div className="progress mb-3" style={{ height: '16px', borderRadius: '10px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${approvalPercentage}%` }}
                    aria-valuenow={approvalPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {approvalPercentage}%
                  </div>
                </div>

                {/* Status Breakdown Grid */}
                <div className="row g-2 text-center mt-2">
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">Pending Review</div>
                      <div className="fw-bold text-warning fs-5">{summary.applications?.pending || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">Approved</div>
                      <div className="fw-bold text-success fs-5">{summary.applications?.approved || 0}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 bg-light rounded-3 border">
                      <div className="small text-muted">Rejected</div>
                      <div className="fw-bold text-danger fs-5">{summary.applications?.rejected || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="small text-muted mt-3">
                  <i className="bi bi-info-circle me-1 text-primary"></i> Total {totalApplications} applications filed by eligible villagers for welfare benefits.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

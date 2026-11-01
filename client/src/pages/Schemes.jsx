// Welfare Schemes page with search, category filtering, details modal, and application submission
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import SchemeCard from '../components/SchemeCard';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Schemes component manages scheme discovery, modal inspection, and villager application workflows
const Schemes = () => {
  const location = useLocation();

  // Extract initial search term from navbar global search query if present
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  // State management
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected scheme state for details modal and apply modal
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Application form input state
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    age: '',
    income: '',
    landAcres: ''
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // User authentication check
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let currentUser = null;
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch (e) {
      currentUser = null;
    }
  }

  // Pre-fill applicant name from logged-in user profile
  useEffect(() => {
    if (currentUser) {
      setApplyForm(prev => ({ ...prev, fullName: currentUser.name || '' }));
    }
  }, [userJson]);

  // Sync state if navbar search query in URL changes
  useEffect(() => {
    const term = new URLSearchParams(location.search).get('search') || '';
    setSearch(term);
  }, [location.search]);

  // Fetch schemes from backend with active search and category filters
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();

      const response = await axios.get('/api/schemes', { params });
      setSchemes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch schemes error:', err);
      setError('Unable to load schemes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetching on filter change
  useEffect(() => {
    fetchSchemes();
  }, [search, category]);

  // Open the Scheme Details Modal
  const handleOpenDetails = (scheme) => {
    setSelectedScheme(scheme);
    setShowDetailsModal(true);
  };

  // Open the Application Form Modal
  const handleOpenApply = (scheme) => {
    setSelectedScheme(scheme);
    setApplyError('');
    setApplySuccess('');
    setShowApplyModal(true);
  };

  // Handle application form input changes
  const handleApplyChange = (e) => {
    const { name, value } = e.target;
    setApplyForm(prev => ({ ...prev, [name]: value }));
    setApplyError('');
  };

  // Submit scheme application to backend
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (!token) {
      setApplyError('You must be logged in as a villager to apply.');
      return;
    }

    if (!applyForm.fullName.trim() || !applyForm.age || !applyForm.income) {
      setApplyError('Please fill in your full name, age, and annual family income.');
      return;
    }

    setApplyLoading(true);
    try {
      const response = await axios.post('/api/applications', {
        scheme: selectedScheme._id,
        fullName: applyForm.fullName.trim(),
        age: Number(applyForm.age),
        income: Number(applyForm.income),
        landAcres: applyForm.landAcres ? Number(applyForm.landAcres) : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplySuccess(response.data.message || 'Application submitted successfully!');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess('');
      }, 1500);
    } catch (err) {
      console.error('Submit application error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setApplyError(err.response.data.message);
      } else {
        setApplyError('Failed to submit application. Please check your network.');
      }
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header and Filter Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">📜</span> Government Welfare Schemes
          </h2>
          <p className="text-muted small mb-0">
            Browse and apply for state and central government rural welfare programs
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="d-flex flex-wrap gap-2">
          <div className="input-group input-group-sm" style={{ minWidth: '220px' }}>
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by scheme name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearch('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <select
            className="form-select form-select-sm"
            style={{ width: '160px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="farmer">Farmer Welfare</option>
            <option value="health">Healthcare</option>
            <option value="pension">Pension & Elders</option>
            <option value="housing">Rural Housing</option>
            <option value="education">Education & Women</option>
          </select>
        </div>
      </div>

      {/* Global alert messages */}
      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Schemes Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading schemes...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching welfare schemes from Gram Sahayak database...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">🔍</span>
          <h5 className="fw-bold text-dark mt-2">No Schemes Found</h5>
          <p className="text-muted small mb-3">Try adjusting your search criteria or category filter.</p>
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => { setSearch(''); setCategory(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {schemes.map((scheme) => (
            <div key={scheme._id} className="col-12 col-md-6 col-lg-4">
              <SchemeCard
                scheme={scheme}
                onViewDetails={handleOpenDetails}
                onApply={handleOpenApply}
              />
            </div>
          ))}
        </div>
      )}

      {/* Scheme Details Modal */}
      {showDetailsModal && selectedScheme && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small text-capitalize me-2">
                  {selectedScheme.category}
                </span>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>

              <div className="modal-body pt-2">
                <h4 className="fw-bold text-dark mb-3">{selectedScheme.name}</h4>
                <p className="text-secondary small mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {selectedScheme.description}
                </p>

                {/* Eligibility Grid */}
                <h6 className="fw-bold text-dark small text-uppercase mb-2">Eligibility Criteria</h6>
                <div className="row g-2 mb-4">
                  <div className="col-12 col-sm-6">
                    <div className="p-3 bg-light rounded-3 border small">
                      <div className="text-muted">Minimum Age Requirement:</div>
                      <strong className="text-dark">
                        {selectedScheme.minAge > 0 ? `${selectedScheme.minAge} Years & Above` : 'No Minimum Age Limit'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="p-3 bg-light rounded-3 border small">
                      <div className="text-muted">Annual Income Ceiling:</div>
                      <strong className="text-dark">
                        {selectedScheme.maxIncome > 0 ? `₹${selectedScheme.maxIncome.toLocaleString()} / year` : 'No Income Limit'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Required Documents List */}
                <h6 className="fw-bold text-dark small text-uppercase mb-2">Documents Required</h6>
                <div className="p-3 bg-light rounded-3 border mb-4">
                  {selectedScheme.documentsRequired && selectedScheme.documentsRequired.length > 0 ? (
                    <ul className="list-unstyled mb-0 small">
                      {selectedScheme.documentsRequired.map((doc, idx) => (
                        <li key={idx} className="d-flex align-items-center mb-1 text-secondary">
                          <i className="bi bi-file-earmark-check-fill text-success me-2"></i>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="small text-muted">Aadhaar Card and active Bank Passbook</span>
                  )}
                </div>

                {/* Official External Link */}
                {selectedScheme.applyLink && (
                  <div className="small text-muted mb-2">
                    <i className="bi bi-link-45deg me-1"></i> Official Portal:{' '}
                    <a href={selectedScheme.applyLink} target="_blank" rel="noopener noreferrer" className="text-primary-green fw-semibold">
                      {selectedScheme.applyLink}
                    </a>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenApply(selectedScheme);
                  }}
                >
                  <i className="bi bi-send-check me-1"></i> Apply Online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheme Application Modal Form */}
      {showApplyModal && selectedScheme && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Apply for Welfare Scheme</h5>
                  <p className="small text-muted mb-0">{selectedScheme.name}</p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>

              <div className="modal-body pt-3">
                {/* Check if user is logged in */}
                {!token ? (
                  <div className="text-center p-3">
                    <span className="fs-1 text-warning">🔒</span>
                    <h6 className="fw-bold mt-2">Login Required</h6>
                    <p className="text-muted small">You need to log in as a registered villager to submit applications.</p>
                    <Link to="/login" className="btn btn-primary rounded-pill px-4 mt-2">
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <AlertMessage type="danger" message={applyError} onClose={() => setApplyError('')} />
                    <AlertMessage type="success" message={applySuccess} />

                    <form onSubmit={handleApplySubmit}>
                      <FormInput
                        label="Applicant Full Name"
                        name="fullName"
                        value={applyForm.fullName}
                        onChange={handleApplyChange}
                        placeholder="e.g. Ramesh Kumar Patel"
                        required
                        helperText="As printed on your Aadhaar card"
                      />

                      <div className="row g-2">
                        <div className="col-6">
                          <FormInput
                            label="Age (Years)"
                            name="age"
                            type="number"
                            value={applyForm.age}
                            onChange={handleApplyChange}
                            placeholder="e.g. 35"
                            required
                            helperText={selectedScheme.minAge > 0 ? `Min: ${selectedScheme.minAge} yrs` : ''}
                          />
                        </div>
                        <div className="col-6">
                          <FormInput
                            label="Annual Income (₹)"
                            name="income"
                            type="number"
                            value={applyForm.income}
                            onChange={handleApplyChange}
                            placeholder="e.g. 120000"
                            required
                            helperText={selectedScheme.maxIncome > 0 ? `Max: ₹${selectedScheme.maxIncome}` : ''}
                          />
                        </div>
                      </div>

                      <FormInput
                        label="Agricultural Land Owned (in Acres)"
                        name="landAcres"
                        type="number"
                        value={applyForm.landAcres}
                        onChange={handleApplyChange}
                        placeholder="e.g. 2.5 (Enter 0 if none)"
                        helperText="Optional for non-agricultural schemes"
                      />

                      <div className="p-2 bg-light rounded-3 small text-muted border mb-3">
                        <i className="bi bi-info-circle me-1 text-primary"></i> Application will be reviewed by the Gram Panchayat Sachiv.
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowApplyModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={applyLoading}>
                          {applyLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;

// Emergency and public utility helpline directory page
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

// Helpline component displays emergency and public services contact directory with click-to-call links
const Helpline = () => {
  const [helplines, setHelplines] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch helpline contacts from backend API
  const fetchHelplines = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();

      const response = await axios.get('/api/helplines', { params });
      setHelplines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch helplines error:', err);
      setError('Unable to load helpline numbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts whenever search or category changes
  useEffect(() => {
    fetchHelplines();
  }, [search, category]);

  // Helpline categories list
  const categories = [
    { label: 'All Services', value: '' },
    { label: 'Hospitals & Medical', value: 'hospital' },
    { label: 'Ambulance 108', value: 'ambulance' },
    { label: 'Police Chowki', value: 'police' },
    { label: 'Fire Service', value: 'fire' },
    { label: 'Patwari / Revenue', value: 'patwari' },
    { label: 'Electricity Board', value: 'electricity' },
    { label: 'Water Supply', value: 'water' },
    { label: 'Rural Banking', value: 'bank' }
  ];

  // Category badge color helper
  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'hospital':
      case 'ambulance':
        return 'bg-danger text-white';
      case 'police':
        return 'bg-primary text-white';
      case 'fire':
        return 'bg-warning text-dark';
      case 'electricity':
        return 'bg-warning text-dark';
      case 'water':
        return 'bg-info text-dark';
      case 'bank':
      case 'patwari':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-danger me-2">📞</span> Emergency & Essential Helplines
          </h2>
          <p className="text-muted small mb-0">
            Immediate contacts for healthcare, emergency ambulance, police chowki, revenue lekhpal, and power faults
          </p>
        </div>

        {/* Search input */}
        <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search service or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearch('')}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Category Filter Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((catObj) => (
          <button
            key={catObj.value}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              category === catObj.value ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => setCategory(catObj.value)}
          >
            {catObj.label}
          </button>
        ))}
      </div>

      {/* Helplines Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading helplines...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching helpline directory contacts...</p>
        </div>
      ) : helplines.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">☎️</span>
          <h5 className="fw-bold text-dark mt-2">No Contacts Found</h5>
          <p className="text-muted small mb-3">No helpline contacts match your criteria.</p>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => { setSearch(''); setCategory(''); }}
          >
            Show All Helplines
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {helplines.map((item) => (
            <div key={item._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 d-flex flex-column bg-white">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className={`badge rounded-pill px-3 py-1 small text-capitalize ${getCategoryBadgeClass(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="badge bg-light text-muted border small">
                    <i className="bi bi-clock me-1"></i> {item.timings || '24x7'}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mt-2 mb-1">{item.name}</h5>

                {item.address && (
                  <p className="text-muted small mb-3">
                    <i className="bi bi-geo-alt me-1 text-danger"></i> {item.address}
                  </p>
                )}

                {/* Direct Call Action Button */}
                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  <div className="fw-bold text-primary-green fs-5">
                    {item.phone}
                  </div>
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn btn-success btn-sm rounded-pill px-3 py-1 shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-telephone-fill"></i> Call Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Helpline;

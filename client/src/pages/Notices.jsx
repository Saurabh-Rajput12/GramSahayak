// Notices page displaying all village public circulars with category filtering and keyword search
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoticeCard from '../components/NoticeCard';
import AlertMessage from '../components/AlertMessage';

// Notices component fetches and displays official Gram Panchayat announcements
const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch notices from API based on type filter and search query
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedType) params.type = selectedType;
      if (search.trim()) params.search = search.trim();

      const response = await axios.get('/api/notices', { params });
      setNotices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch notices error:', err);
      setError('Unable to load village notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notices whenever filter or search changes
  useEffect(() => {
    fetchNotices();
  }, [selectedType, search]);

  // Notice type filter options
  const filterTypes = [
    { label: 'All Notices', value: '' },
    { label: 'Meetings', value: 'meeting' },
    { label: 'Camps & Drives', value: 'camp' },
    { label: 'Water Supply', value: 'water' },
    { label: 'General Bulletins', value: 'general' }
  ];

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">📢</span> Official Village Notices
          </h2>
          <p className="text-muted small mb-0">
            Public circulars, Gram Sabha assemblies, water release schedules, and community health camps
          </p>
        </div>

        {/* Search Bar */}
        <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search notice title..."
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

      {/* Type Filter Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filterTypes.map((typeObj) => (
          <button
            key={typeObj.value}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              selectedType === typeObj.value ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => setSelectedType(typeObj.value)}
          >
            {typeObj.label}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading notices...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching village circulars from Panchayat bulletin board...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">📋</span>
          <h5 className="fw-bold text-dark mt-2">No Notices Available</h5>
          <p className="text-muted small mb-3">No circulars match the selected filter or search term.</p>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => { setSelectedType(''); setSearch(''); }}
          >
            Show All Notices
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {notices.map((notice) => (
            <div key={notice._id} className="col-12 col-md-6 col-lg-4">
              <NoticeCard notice={notice} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices;

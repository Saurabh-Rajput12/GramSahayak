// Agricultural Mandi daily crop market rates page with backend filters and price range metrics
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

// Mandi component displays daily crop rates across agricultural markets
const Mandi = () => {
  const [prices, setPrices] = useState([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch crop prices with current filter query parameters
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (district.trim()) params.district = district.trim();
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const response = await axios.get('/api/prices', { params });
      setPrices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch prices error:', err);
      setError('Unable to load crop prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger price fetch whenever filters change
  useEffect(() => {
    fetchPrices();
  }, [search, district, minPrice, maxPrice]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearch('');
    setDistrict('');
    setMinPrice('');
    setMaxPrice('');
  };

  // Calculate highest and lowest crop rate from the active result set using Math.max & Math.min
  const numericPrices = prices.map(p => p.price);
  const highestPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 0;
  const lowestPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 0;
  const highestCrop = prices.find(p => p.price === highestPrice);
  const lowestCrop = prices.find(p => p.price === lowestPrice);

  // Format date helper
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
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <span className="text-primary-green me-2">📈</span> Agricultural Mandi Prices
        </h2>
        <p className="text-muted small mb-0">
          Daily APMC market rates for grains, pulses, oilseeds, and cash crops across major trading mandis
        </p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Summary Stat Cards for Highest and Lowest Rates */}
      {prices.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted fw-semibold">Highest Mandi Rate</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Peak</span>
              </div>
              <h3 className="fw-bold text-success mb-1">₹{highestPrice.toLocaleString()} <span className="fs-6 text-muted fw-normal">/ quintal</span></h3>
              <div className="small text-secondary">{highestCrop ? `${highestCrop.crop} (${highestCrop.market})` : ''}</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted fw-semibold">Lowest Mandi Rate</span>
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill">Floor</span>
              </div>
              <h3 className="fw-bold text-warning mb-1">₹{lowestPrice.toLocaleString()} <span className="fs-6 text-muted fw-normal">/ quintal</span></h3>
              <div className="small text-secondary">{lowestCrop ? `${lowestCrop.crop} (${lowestCrop.market})` : ''}</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-muted fw-semibold">Active Market Quotes</span>
                <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill">Live</span>
              </div>
              <h3 className="fw-bold text-dark mb-1">{prices.length}</h3>
              <div className="small text-muted">Filtered mandi quotes displayed</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search crop name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filter by district..."
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="col-3 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="col-3 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-2 d-flex">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill w-100"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Crop Prices Table */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading prices...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching latest mandi crop market prices...</p>
        </div>
      ) : prices.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">🌾</span>
          <h5 className="fw-bold text-dark mt-2">No Mandi Rates Found</h5>
          <p className="text-muted small mb-3">No matching records found for the specified filters.</p>
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small text-muted">
                <tr>
                  <th scope="col" className="ps-4 py-3">Crop Name</th>
                  <th scope="col" className="py-3">APMC Mandi / Market</th>
                  <th scope="col" className="py-3">District</th>
                  <th scope="col" className="py-3 text-end">Price (₹ / Quintal)</th>
                  <th scope="col" className="pe-4 py-3 text-end">Updated Date</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">
                      <i className="bi bi-flower1 text-success me-2"></i>
                      {p.crop}
                    </td>
                    <td className="py-3 text-secondary">{p.market}</td>
                    <td className="py-3 text-secondary">
                      <span className="badge bg-light text-secondary border">{p.district}</span>
                    </td>
                    <td className="py-3 text-end fw-bold text-primary-green fs-6">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="pe-4 py-3 text-end text-muted small">
                      {formatDate(p.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mandi;

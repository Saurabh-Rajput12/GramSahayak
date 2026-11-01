// Village Krishi Bazaar page where farmers list and sell produce directly to buyers
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import AlertMessage from '../components/AlertMessage';

// Market component facilitates produce browsing, filtering, seller contact modal, and produce listing
const Market = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected produce for contact modal
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Add Produce Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newProduce, setNewProduce] = useState({
    name: '',
    category: 'vegetables',
    price: '',
    quantity: '',
    unit: 'kg',
    location: 'Gram Panchayat Rampur',
    contactPhone: '',
    description: ''
  });

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      user = null;
    }
  }

  // Fetch produce listings with active filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();

      const res = await axios.get('/api/products', { params });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load market produce. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  // Open contact farmer modal
  const handleOpenContact = (prod) => {
    setSelectedProduce(prod);
    setShowContactModal(true);
  };

  // Submit new produce listing
  const handleCreateProduce = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in as a villager to list your farm produce.');
      setShowAddModal(false);
      return;
    }

    try {
      setAddLoading(true);
      setError('');
      setSuccess('');

      await axios.post('/api/products', {
        name: newProduce.name,
        category: newProduce.category,
        price: Number(newProduce.price),
        quantity: Number(newProduce.quantity),
        unit: newProduce.unit,
        location: newProduce.location,
        contactPhone: newProduce.contactPhone || '9876543210',
        description: newProduce.description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`"${newProduce.name}" has been listed in Krishi Bazaar successfully!`);
      setShowAddModal(false);
      setNewProduce({
        name: '',
        category: 'vegetables',
        price: '',
        quantity: '',
        unit: 'kg',
        location: 'Gram Panchayat Rampur',
        contactPhone: '',
        description: ''
      });
      fetchProducts();
    } catch (err) {
      console.error('Create produce error:', err);
      setError(err.response?.data?.message || 'Failed to list produce.');
    } finally {
      setAddLoading(false);
    }
  };

  const categories = [
    { label: 'All Items (सभी)', value: '' },
    { label: 'Vegetables (सब्जियां)', value: 'vegetables' },
    { label: 'Food Grains (अनाज)', value: 'grains' },
    { label: 'Dairy (दूध/घी)', value: 'dairy' },
    { label: 'Fruits (फल)', value: 'fruits' },
    { label: 'Other (अन्य)', value: 'other' }
  ];

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 p-4 bg-white rounded-4 border shadow-sm">
        <div>
          <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-3 py-1 rounded-pill small fw-semibold mb-2">
            🌾 Kisan Direct Market
          </span>
          <h2 className="fw-bold text-dark mb-1">Krishi Bazaar (कृषि बाज़ार)</h2>
          <p className="text-secondary small mb-0">
            Buy fresh farm produce directly from village farmers without middlemen commission.
          </p>
        </div>

        <div>
          {token ? (
            <button
              className="btn btn-success rounded-pill px-4 py-2 shadow-sm fw-semibold"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-circle me-1"></i> Sell Your Produce (फसल बेचें)
            </button>
          ) : (
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i> Log in to list produce for sale
            </div>
          )}
        </div>
      </div>

      <AlertMessage message={error} type="danger" onClose={() => setError('')} />
      <AlertMessage message={success} type="success" onClose={() => setSuccess('')} />

      {/* Filter and Search Controls */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search crops, produce (e.g., गेहूं, टमाटर)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="d-flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${
                    category === c.value ? 'btn-success fw-semibold' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-2 text-muted">Loading farm produce...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div className="display-4 text-muted mb-3">🌾</div>
          <h5 className="text-secondary">No produce found matching your search.</h5>
          <p className="small text-muted mb-3">Try clearing filters or search keywords.</p>
          <button
            type="button"
            className="btn btn-outline-success btn-sm rounded-pill mx-auto px-4"
            onClick={() => { setSearch(''); setCategory(''); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {products.map((prod) => (
            <div key={prod._id} className="col">
              <ProductCard
                product={prod}
                onContact={handleOpenContact}
              />
            </div>
          ))}
        </div>
      )}

      {/* Contact Farmer Modal */}
      {showContactModal && selectedProduce && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-telephone me-2"></i> Contact Farmer
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <span className="badge bg-success-subtle text-success border px-3 py-1 rounded-pill small text-capitalize mb-2">
                    {selectedProduce.category}
                  </span>
                  <h4 className="fw-bold text-dark">{selectedProduce.name}</h4>
                  <div className="text-primary-green fs-4 fw-bold">
                    ₹{selectedProduce.price} / {selectedProduce.unit}
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Farmer Name:</span>
                    <strong className="text-dark">{selectedProduce.seller?.name || 'Local Villager'}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Farm Location:</span>
                    <strong className="text-dark">{selectedProduce.location || 'Gram Rampur'}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Available Quantity:</span>
                    <strong className="text-dark">{selectedProduce.quantity} {selectedProduce.unit}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Phone Number:</span>
                    <strong className="text-success fs-5">{selectedProduce.contactPhone || '9876543210'}</strong>
                  </div>
                </div>

                {selectedProduce.description && (
                  <div className="mb-3">
                    <h6 className="fw-bold small text-muted">Details:</h6>
                    <p className="small text-secondary mb-0">{selectedProduce.description}</p>
                  </div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <a
                    href={`tel:${selectedProduce.contactPhone || '9876543210'}`}
                    className="btn btn-success py-2 rounded-pill fw-semibold shadow-sm"
                  >
                    <i className="bi bi-telephone-outbound me-2"></i> Call Farmer Now ({selectedProduce.contactPhone || '9876543210'})
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill py-2"
                    onClick={() => setShowContactModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2"></i> List Your Produce (फसल दर्ज करें)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateProduce}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Produce / Crop Name (फसल का नाम) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Desi Wheat (देसी गेहूं)"
                      value={newProduce.name}
                      onChange={(e) => setNewProduce({ ...newProduce, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={newProduce.category}
                        onChange={(e) => setNewProduce({ ...newProduce, category: e.target.value })}
                        required
                      >
                        <option value="vegetables">Vegetables (सब्जियां)</option>
                        <option value="grains">Food Grains (अनाज)</option>
                        <option value="dairy">Dairy (दूध/घी)</option>
                        <option value="fruits">Fruits (फल)</option>
                        <option value="other">Other (अन्य)</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Unit *</label>
                      <select
                        className="form-select"
                        value={newProduce.unit}
                        onChange={(e) => setNewProduce({ ...newProduce, unit: e.target.value })}
                        required
                      >
                        <option value="kg">kg (किलो)</option>
                        <option value="quintal">quintal (क्विंटल)</option>
                        <option value="litre">litre (लीटर)</option>
                        <option value="piece">piece (नग)</option>
                        <option value="dozen">dozen (दर्जन)</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Price per Unit (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 25"
                        min="0"
                        value={newProduce.price}
                        onChange={(e) => setNewProduce({ ...newProduce, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Available Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 100"
                        min="1"
                        value={newProduce.quantity}
                        onChange={(e) => setNewProduce({ ...newProduce, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Location (स्थान)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ward 3, Rampur"
                        value={newProduce.location}
                        onChange={(e) => setNewProduce({ ...newProduce, location: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Contact Phone (फोन नंबर)</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="9876543210"
                        value={newProduce.contactPhone}
                        onChange={(e) => setNewProduce({ ...newProduce, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description / Quality Note</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Naturally grown, fresh harvest"
                      value={newProduce.description}
                      onChange={(e) => setNewProduce({ ...newProduce, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={addLoading}
                  >
                    {addLoading ? 'Publishing...' : 'Publish Listing (लिस्ट करें)'}
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

export default Market;

// Mandi Crop Price Management panel for Panchayat administrators
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// PriceManagement component enables Panchayat officials to record and update daily APMC crop rates
const PriceManagement = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [crop, setCrop] = useState('');
  const [market, setMarket] = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch prices
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/prices');
      setPrices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch prices error:', err);
      setError('Unable to load crop prices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingPrice(null);
    setCrop('');
    setMarket('');
    setDistrict('');
    setPrice('');
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (p) => {
    setEditingPrice(p);
    setCrop(p.crop);
    setMarket(p.market);
    setDistrict(p.district);
    setPrice(p.price);
    setShowModal(true);
  };

  // Save (Create or Update) price
  const handleSavePrice = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        crop: crop.trim(),
        market: market.trim(),
        district: district.trim(),
        price: Number(price)
      };

      if (editingPrice) {
        await axios.put(`/api/prices/${editingPrice._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Crop price updated successfully.');
      } else {
        await axios.post('/api/prices', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New crop price recorded successfully.');
      }

      setShowModal(false);
      fetchPrices();
    } catch (err) {
      console.error('Save price error:', err);
      setError(err.response?.data?.message || 'Failed to save crop price.');
    } finally {
      setSaving(false);
    }
  };

  // Delete price
  const handleDeletePrice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this price record?')) return;
    try {
      await axios.delete(`/api/prices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Price record deleted.');
      fetchPrices();
    } catch (err) {
      console.error('Delete price error:', err);
      setError('Failed to delete price record.');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-success me-2">📈</span> Mandi Crop Prices Management
          </h2>
          <p className="text-muted small mb-0">Record and maintain daily agricultural market prices for farmers</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Crop Rate
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : prices.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No crop prices recorded yet.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Crop Name</th>
                  <th scope="col" className="py-3">APMC Mandi</th>
                  <th scope="col" className="py-3">District</th>
                  <th scope="col" className="py-3 text-end">Price (₹ / Quintal)</th>
                  <th scope="col" className="py-3 text-end">Recorded Date</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">{p.crop}</td>
                    <td className="py-3 text-secondary">{p.market}</td>
                    <td className="py-3 text-secondary">{p.district}</td>
                    <td className="py-3 text-end fw-bold text-primary-green">₹{p.price.toLocaleString()}</td>
                    <td className="py-3 text-end small text-muted">{formatDate(p.date)}</td>
                    <td className="pe-4 py-3 text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(p)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeletePrice(p._id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Price Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingPrice ? 'Edit Crop Rate' : 'Add Daily Crop Rate'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSavePrice}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Crop Name"
                    name="crop"
                    placeholder="e.g. Wheat (Sharbati), Soybean, Mustard"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                  />

                  <div className="row g-2">
                    <div className="col-6">
                      <FormInput
                        label="Mandi / Market Name"
                        name="market"
                        placeholder="e.g. Indore APMC Mandi"
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <FormInput
                        label="District"
                        name="district"
                        placeholder="e.g. Indore"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <FormInput
                    label="Price (₹ per Quintal)"
                    name="price"
                    type="number"
                    placeholder="e.g. 2650"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Rate'}
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

export default PriceManagement;

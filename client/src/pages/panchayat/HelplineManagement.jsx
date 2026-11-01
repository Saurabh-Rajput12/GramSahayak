// Helpline Directory Management panel for maintaining village emergency and utility numbers
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// HelplineManagement component coordinates emergency numbers and service directory contacts
const HelplineManagement = () => {
  const [helplines, setHelplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [editingHelpline, setEditingHelpline] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hospital');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timings, setTimings] = useState('24x7');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch helplines
  const fetchHelplines = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/helplines');
      setHelplines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch helplines error:', err);
      setError('Unable to load helplines directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelplines();
  }, []);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingHelpline(null);
    setName('');
    setCategory('hospital');
    setPhone('');
    setAddress('');
    setTimings('24x7');
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (h) => {
    setEditingHelpline(h);
    setName(h.name);
    setCategory(h.category);
    setPhone(h.phone);
    setAddress(h.address || '');
    setTimings(h.timings || '24x7');
    setShowModal(true);
  };

  // Save helpline
  const handleSaveHelpline = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        category,
        phone: phone.trim(),
        address: address.trim(),
        timings: timings.trim()
      };

      if (editingHelpline) {
        await axios.put(`/api/helplines/${editingHelpline._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Helpline contact updated successfully.');
      } else {
        await axios.post('/api/helplines', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New helpline contact created.');
      }

      setShowModal(false);
      fetchHelplines();
    } catch (err) {
      console.error('Save helpline error:', err);
      setError(err.response?.data?.message || 'Failed to save helpline contact.');
    } finally {
      setSaving(false);
    }
  };

  // Delete helpline
  const handleDeleteHelpline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this helpline contact?')) return;
    try {
      await axios.delete(`/api/helplines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Helpline contact deleted.');
      fetchHelplines();
    } catch (err) {
      console.error('Delete helpline error:', err);
      setError('Failed to delete helpline contact.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-secondary me-2">📞</span> Helplines Directory Management
          </h2>
          <p className="text-muted small mb-0">Maintain essential emergency numbers, hospitals, police chowki, and utility lines</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Contact
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : helplines.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No helpline contacts configured.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Service Name</th>
                  <th scope="col" className="py-3">Category</th>
                  <th scope="col" className="py-3">Phone Number</th>
                  <th scope="col" className="py-3">Address & Timings</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {helplines.map((h) => (
                  <tr key={h._id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">{h.name}</td>
                    <td className="py-3">
                      <span className="badge bg-light text-secondary border small text-capitalize">{h.category}</span>
                    </td>
                    <td className="py-3 fw-bold text-success font-monospace">{h.phone}</td>
                    <td className="py-3 small text-secondary">
                      <div>{h.address || '—'}</div>
                      <div className="text-muted">{h.timings}</div>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(h)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeleteHelpline(h._id)}>
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

      {/* Add / Edit Helpline Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingHelpline ? 'Edit Helpline' : 'Add Helpline'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveHelpline}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Service Name"
                    name="name"
                    placeholder="e.g. Primary Health Sub-Centre (PHC)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="hospital">Hospital / Health</option>
                      <option value="police">Police Chowki</option>
                      <option value="fire">Fire Emergency</option>
                      <option value="ambulance">Ambulance Service</option>
                      <option value="patwari">Village Patwari / Lekhpal</option>
                      <option value="electricity">Electricity Board</option>
                      <option value="water">Drinking Water Maintenance</option>
                      <option value="bank">Rural Bank Helpline</option>
                      <option value="other">Other Public Utility</option>
                    </select>
                  </div>

                  <FormInput
                    label="Phone Number"
                    name="phone"
                    placeholder="e.g. 108 or 0755-2741122"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <FormInput
                    label="Physical Office Address"
                    name="address"
                    placeholder="e.g. Opposite Panchayat Bhawan, Main Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <FormInput
                    label="Timings / Availability"
                    name="timings"
                    placeholder="e.g. 24x7 or 10:00 AM - 05:00 PM"
                    value={timings}
                    onChange={(e) => setTimings(e.target.value)}
                  />
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Contact'}
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

export default HelplineManagement;

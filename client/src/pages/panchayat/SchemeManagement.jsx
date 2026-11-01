// Scheme Management panel allowing Panchayat to create, modify, and delete welfare schemes
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// SchemeManagement component coordinates welfare scheme listings and CRUD actions
const SchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'farmer',
    documentsRequired: '',
    minAge: 0,
    maxIncome: 0,
    applyLink: ''
  });
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch schemes from backend
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/schemes');
      setSchemes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch schemes error:', err);
      setError('Unable to load schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingScheme(null);
    setFormData({
      name: '',
      description: '',
      category: 'farmer',
      documentsRequired: '',
      minAge: 0,
      maxIncome: 0,
      applyLink: ''
    });
    setShowModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (s) => {
    setEditingScheme(s);
    setFormData({
      name: s.name,
      description: s.description,
      category: s.category,
      documentsRequired: Array.isArray(s.documentsRequired) ? s.documentsRequired.join(', ') : '',
      minAge: s.minAge || 0,
      maxIncome: s.maxIncome || 0,
      applyLink: s.applyLink || ''
    });
    setShowModal(true);
  };

  // Save (Create or Update) scheme
  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const docsArray = formData.documentsRequired
        ? formData.documentsRequired.split(',').map(d => d.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        documentsRequired: docsArray,
        minAge: Number(formData.minAge) || 0,
        maxIncome: Number(formData.maxIncome) || 0,
        applyLink: formData.applyLink.trim()
      };

      if (editingScheme) {
        await axios.put(`/api/schemes/${editingScheme._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Scheme updated successfully.');
      } else {
        await axios.post('/api/schemes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New scheme published successfully.');
      }

      setShowModal(false);
      fetchSchemes();
    } catch (err) {
      console.error('Save scheme error:', err);
      setError(err.response?.data?.message || 'Failed to save scheme.');
    } finally {
      setSaving(false);
    }
  };

  // Delete scheme
  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;

    try {
      await axios.delete(`/api/schemes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Scheme deleted.');
      fetchSchemes();
    } catch (err) {
      console.error('Delete scheme error:', err);
      setError('Failed to delete scheme.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">📜</span> Schemes Management
          </h2>
          <p className="text-muted small mb-0">Configure government welfare schemes, criteria rules, and documents</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add New Scheme
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : schemes.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No schemes available.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Scheme Name</th>
                  <th scope="col" className="py-3">Category</th>
                  <th scope="col" className="py-3">Age Rule</th>
                  <th scope="col" className="py-3">Income Ceiling</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s._id}>
                    <td className="ps-4 py-3">
                      <div className="fw-semibold text-dark">{s.name}</div>
                      <div className="small text-muted line-clamp-1" style={{ maxWidth: '350px' }}>{s.description}</div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-secondary border small text-capitalize">{s.category}</span>
                    </td>
                    <td className="py-3 small">{s.minAge > 0 ? `${s.minAge}+ yrs` : 'None'}</td>
                    <td className="py-3 small">{s.maxIncome > 0 ? `₹${s.maxIncome.toLocaleString()}` : 'None'}</td>
                    <td className="pe-4 py-3 text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(s)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeleteScheme(s._id)}>
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

      {/* Add / Edit Scheme Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingScheme ? 'Edit Welfare Scheme' : 'Add New Welfare Scheme'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveScheme}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Scheme Name"
                    name="name"
                    placeholder="e.g. PM Kisan Samman Nidhi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <div className="row g-2">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select rounded-3 py-2"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="farmer">Farmer Welfare</option>
                        <option value="health">Healthcare</option>
                        <option value="pension">Pension</option>
                        <option value="housing">Housing</option>
                        <option value="education">Education & Women</option>
                      </select>
                    </div>
                    <div className="col-6 col-md-4">
                      <FormInput
                        label="Min Age (0 for none)"
                        name="minAge"
                        type="number"
                        value={formData.minAge}
                        onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                      />
                    </div>
                    <div className="col-6 col-md-4">
                      <FormInput
                        label="Max Income (0 for none)"
                        name="maxIncome"
                        type="number"
                        value={formData.maxIncome}
                        onChange={(e) => setFormData({ ...formData, maxIncome: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Detailed Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <FormInput
                    label="Documents Required (comma separated)"
                    name="documentsRequired"
                    placeholder="e.g. Aadhaar Card, Land Record Khatauni, Bank Passbook"
                    value={formData.documentsRequired}
                    onChange={(e) => setFormData({ ...formData, documentsRequired: e.target.value })}
                  />

                  <FormInput
                    label="Official External Application Link (Optional)"
                    name="applyLink"
                    placeholder="e.g. https://pmkisan.gov.in"
                    value={formData.applyLink}
                    onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  />
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Scheme'}
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

export default SchemeManagement;

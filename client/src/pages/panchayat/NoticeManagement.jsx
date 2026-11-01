// Notice Management panel for publishing and modifying official village notices
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// NoticeManagement component allows Panchayat officials to post and manage public announcements
const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/notices');
      setNotices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch notices error:', err);
      setError('Unable to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingNotice(null);
    setTitle('');
    setBody('');
    setType('general');
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (n) => {
    setEditingNotice(n);
    setTitle(n.title);
    setBody(n.body);
    setType(n.type);
    setShowModal(true);
  };

  // Save (Create or Update) notice
  const handleSaveNotice = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        type
      };

      if (editingNotice) {
        await axios.put(`/api/notices/${editingNotice._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Notice updated successfully.');
      } else {
        await axios.post('/api/notices', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New notice published successfully.');
      }

      setShowModal(false);
      fetchNotices();
    } catch (err) {
      console.error('Save notice error:', err);
      setError(err.response?.data?.message || 'Failed to save notice.');
    } finally {
      setSaving(false);
    }
  };

  // Delete notice
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await axios.delete(`/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Notice deleted.');
      fetchNotices();
    } catch (err) {
      console.error('Delete notice error:', err);
      setError('Failed to delete notice.');
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
            <span className="text-primary me-2">📢</span> Public Notices Management
          </h2>
          <p className="text-muted small mb-0">Publish official circulars, meeting notices, and community bulletins</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Post New Notice
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : notices.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No notices posted yet.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Notice Title</th>
                  <th scope="col" className="py-3">Type</th>
                  <th scope="col" className="py-3">Posted Date</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n._id}>
                    <td className="ps-4 py-3">
                      <div className="fw-semibold text-dark">{n.title}</div>
                      <div className="small text-muted line-clamp-1" style={{ maxWidth: '400px' }}>{n.body}</div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-secondary border small text-capitalize">{n.type}</span>
                    </td>
                    <td className="py-3 small text-muted">{formatDate(n.date)}</td>
                    <td className="pe-4 py-3 text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(n)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeleteNotice(n._id)}>
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

      {/* Add / Edit Notice Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingNotice ? 'Edit Public Notice' : 'Post Public Notice'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveNotice}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Notice Title"
                    name="title"
                    placeholder="e.g. Gram Sabha General Assembly Meeting"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Announcement Type</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="general">General Notice</option>
                      <option value="meeting">Gram Sabha Meeting</option>
                      <option value="camp">Health / Vaccination Camp</option>
                      <option value="water">Canal / Water Supply</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Notice Text / Circular Details</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      placeholder="Enter the complete bulletin content..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Publishing...' : 'Publish Notice'}
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

export default NoticeManagement;

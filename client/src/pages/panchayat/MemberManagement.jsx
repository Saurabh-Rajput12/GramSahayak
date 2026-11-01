// Panchayat Member Management panel for updating elected council records
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// MemberManagement component handles addition and modification of Gram Panchayat committee officials
const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [name, setName] = useState('');
  const [post, setPost] = useState('');
  const [ward, setWard] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [since, setSince] = useState(2020);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch committee members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/members');
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError('Unable to load committee members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setPost('');
    setWard('');
    setContactNote('');
    setSince(new Date().getFullYear());
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setName(m.name);
    setPost(m.post);
    setWard(m.ward || '');
    setContactNote(m.contactNote || '');
    setSince(m.since || 2020);
    setShowModal(true);
  };

  // Save member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        post: post.trim(),
        ward: ward.trim(),
        contactNote: contactNote.trim(),
        since: Number(since)
      };

      if (editingMember) {
        await axios.put(`/api/members/${editingMember._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Panchayat member record updated.');
      } else {
        await axios.post('/api/members', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New committee member added.');
      }

      setShowModal(false);
      fetchMembers();
    } catch (err) {
      console.error('Save member error:', err);
      setError(err.response?.data?.message || 'Failed to save member record.');
    } finally {
      setSaving(false);
    }
  };

  // Delete member
  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member record?')) return;
    try {
      await axios.delete(`/api/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Member record removed.');
      fetchMembers();
    } catch (err) {
      console.error('Delete member error:', err);
      setError('Failed to delete member record.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-dark me-2">🏛️</span> Panchayat Members Management
          </h2>
          <p className="text-muted small mb-0">Maintain records of Sarpanch, Up-Sarpanch, Secretary, and Ward Panch leaders</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Member
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : members.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No member records found.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Member Name</th>
                  <th scope="col" className="py-3">Designation / Post</th>
                  <th scope="col" className="py-3">Ward / Area</th>
                  <th scope="col" className="py-3">Since Year</th>
                  <th scope="col" className="py-3">Contact Note</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td className="ps-4 py-3 fw-semibold text-dark">{m.name}</td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark border small">{m.post}</span>
                    </td>
                    <td className="py-3 text-secondary small">{m.ward || '—'}</td>
                    <td className="py-3 small">{m.since}</td>
                    <td className="py-3 small text-muted" style={{ maxWidth: '250px' }}>{m.contactNote || '—'}</td>
                    <td className="pe-4 py-3 text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(m)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeleteMember(m._id)}>
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

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingMember ? 'Edit Committee Member' : 'Add Committee Member'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveMember}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Member Name"
                    name="name"
                    placeholder="e.g. Smt. Shanti Devi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div className="row g-2">
                    <div className="col-7">
                      <FormInput
                        label="Designation / Post"
                        name="post"
                        placeholder="e.g. Sarpanch, Up-Sarpanch, Ward Panch"
                        value={post}
                        onChange={(e) => setPost(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-5">
                      <FormInput
                        label="Since Year"
                        name="since"
                        type="number"
                        placeholder="2021"
                        value={since}
                        onChange={(e) => setSince(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <FormInput
                    label="Ward / Jurisdiction"
                    name="ward"
                    placeholder="e.g. Ward 3 or Gram Panchayat Lead"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Contact Note / Availability</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="e.g. Available at Panchayat Bhawan 10 AM to 2 PM on weekdays"
                      value={contactNote}
                      onChange={(e) => setContactNote(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Member'}
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

export default MemberManagement;

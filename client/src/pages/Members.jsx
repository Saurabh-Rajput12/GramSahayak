// Our Panchayat page displaying elected village leaders and administrative committee members
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';

// Members component displays the Gram Panchayat committee council
const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch committee members list from backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/members');
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError('Unable to load Panchayat members list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Post badge styling helper
  const getPostBadge = (post) => {
    const p = (post || '').toLowerCase();
    if (p.includes('sarpanch') && !p.includes('up')) {
      return 'bg-success text-white';
    } else if (p.includes('up-sarpanch')) {
      return 'bg-primary text-white';
    } else if (p.includes('sachiv') || p.includes('secretary')) {
      return 'bg-info text-dark';
    }
    return 'bg-secondary text-white';
  };

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="text-center mb-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small fw-semibold mb-2">
          🏛️ Gram Panchayat Committee
        </span>
        <h2 className="fw-bold text-dark mb-2">Our Village Representatives</h2>
        <p className="text-muted small">
          Meet our democratically elected Sarpanch, Ward Panch members, and administrative officials dedicated to rural welfare and infrastructure development.
        </p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />

      {/* Members Cards Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading members...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching Panchayat committee members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">
          No Panchayat committee member records available.
        </div>
      ) : (
        <div className="row g-4 justify-content-center">
          {members.map((member) => (
            <div key={member._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white d-flex flex-column">
                {/* Member Avatar Silhouette */}
                <div className="mb-3 mx-auto">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm border"
                    style={{
                      width: '75px',
                      height: '75px',
                      backgroundColor: '#E8F5E9',
                      fontSize: '2rem'
                    }}
                  >
                    👤
                  </div>
                </div>

                {/* Name & Post */}
                <h5 className="fw-bold text-dark mb-1">{member.name}</h5>
                <div>
                  <span className={`badge rounded-pill px-3 py-1 small ${getPostBadge(member.post)}`}>
                    {member.post}
                  </span>
                </div>

                {/* Ward and Tenure */}
                <div className="d-flex justify-content-center gap-3 my-3 small text-muted">
                  {member.ward && (
                    <span><i className="bi bi-geo-alt me-1 text-danger"></i>{member.ward}</span>
                  )}
                  <span><i className="bi bi-calendar3 me-1 text-primary"></i>Since {member.since}</span>
                </div>

                {/* Contact Note */}
                {member.contactNote && (
                  <p className="text-secondary small bg-light p-2 rounded-3 border mb-0 mt-auto">
                    <i className="bi bi-chat-quote me-1 text-success"></i> {member.contactNote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;

// Village Events and Camps page with seat reservation, category filtering, and details modal
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import AlertMessage from '../components/AlertMessage';

// Events component manages community gathering schedules, camp bookings, and cancellations
const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected event state for details modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Authenticated user check
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let currentUserId = null;
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      currentUserId = u._id;
    } catch (e) {
      currentUserId = null;
    }
  }

  // Fetch events from backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedType) params.type = selectedType;
      if (search.trim()) params.search = search.trim();

      const response = await axios.get('/api/events', { params });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Unable to load village events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedType, search]);

  // Handle seat registration
  const handleRegister = async (eventId) => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Please log in to your account to register for events.');
      return;
    }

    try {
      const response = await axios.post(`/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message || 'Seat registered successfully!');
      fetchEvents();
    } catch (err) {
      console.error('Register event error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register for event.');
      }
    }
  };

  // Handle registration cancellation
  const handleCancelRegistration = async (eventId) => {
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete(`/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message || 'Event registration cancelled.');
      fetchEvents();
    } catch (err) {
      console.error('Cancel event error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to cancel event registration.');
      }
    }
  };

  // Open details modal
  const handleOpenDetails = (evt) => {
    setSelectedEvent(evt);
    setShowDetailsModal(true);
  };

  const types = [
    { label: 'All Events', value: '' },
    { label: 'Health Camps', value: 'health camp' },
    { label: 'Vaccination Drives', value: 'vaccination' },
    { label: 'Gram Sabha Meetings', value: 'meeting' },
    { label: 'Farmer Training', value: 'training' },
    { label: 'Festivals', value: 'festival' }
  ];

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      {/* Header and Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <span className="text-primary-green me-2">📅</span> Village Camps & Community Events
          </h2>
          <p className="text-muted small mb-0">
            Book seats for free eye checkup camps, livestock disease vaccinations, and farmer workshops
          </p>
        </div>

        {/* Search Input */}
        <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search event title..."
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
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {/* Event Type Filter Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {types.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              selectedType === t.value ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => setSelectedType(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading events...</span>
          </div>
          <p className="small text-muted mt-2 mb-0">Fetching village events and community programs...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
          <span className="fs-1 text-muted">🗓️</span>
          <h5 className="fw-bold text-dark mt-2">No Scheduled Events</h5>
          <p className="text-muted small mb-3">No events found matching your selected category.</p>
          <button
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => { setSelectedType(''); setSearch(''); }}
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {events.map((evt) => {
            const isUserRegistered = evt.registeredUsers?.some(
              u => (typeof u === 'string' ? u : u._id) === currentUserId
            );
            return (
              <div key={evt._id} className="col-12 col-md-6 col-lg-4">
                <EventCard
                  event={evt}
                  isRegistered={isUserRegistered}
                  onRegister={handleRegister}
                  onCancelRegistration={handleCancelRegistration}
                  onViewDetails={handleOpenDetails}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 text-capitalize small">
                  {selectedEvent.type}
                </span>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>

              <div className="modal-body pt-2">
                <h4 className="fw-bold text-dark mb-3">{selectedEvent.title}</h4>

                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6">
                    <div className="p-3 bg-light rounded-3 border small">
                      <div className="text-muted">Date & Time:</div>
                      <strong className="text-dark"><i className="bi bi-calendar3 me-1 text-primary"></i>{formatDate(selectedEvent.date)}</strong>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="p-3 bg-light rounded-3 border small">
                      <div className="text-muted">Venue / Location:</div>
                      <strong className="text-dark"><i className="bi bi-geo-alt me-1 text-danger"></i>{selectedEvent.venue}</strong>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-dark small text-uppercase mb-2">Program Overview</h6>
                <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-line' }}>
                  {selectedEvent.description}
                </p>

                {/* Seat Capacity Bar */}
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Registered Attendees: {selectedEvent.registeredUsers?.length || 0}</span>
                    <span>Total Seat Limit: {selectedEvent.seatLimit}</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, (((selectedEvent.registeredUsers?.length || 0) / selectedEvent.seatLimit) * 100))}%`
                      }}
                      aria-valuenow={selectedEvent.registeredUsers?.length || 0}
                      aria-valuemin="0"
                      aria-valuemax={selectedEvent.seatLimit}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

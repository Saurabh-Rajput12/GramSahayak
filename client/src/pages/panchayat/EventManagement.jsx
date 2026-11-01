// Event Management panel for scheduling community events and reviewing attendee rosters
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import FormInput from '../../components/FormInput';

// EventManagement component coordinates village camps, workshops, and attendee registers
const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training',
    date: '',
    venue: '',
    seatLimit: 50
  });
  const [saving, setSaving] = useState(false);

  // Attendees Modal state
  const [attendeesEvent, setAttendeesEvent] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Open add modal
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'training',
      date: '',
      venue: '',
      seatLimit: 50
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      type: evt.type,
      date: evt.date ? new Date(evt.date).toISOString().slice(0, 16) : '',
      venue: evt.venue,
      seatLimit: evt.seatLimit
    });
    setShowModal(true);
  };

  // View registered attendees
  const handleViewAttendees = async (eventId) => {
    try {
      setError('');
      const res = await axios.get(`/api/events/${eventId}`);
      setAttendeesEvent(res.data);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Fetch event attendees error:', err);
      setError('Unable to fetch attendee register.');
    }
  };

  // Save event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        date: new Date(formData.date),
        venue: formData.venue.trim(),
        seatLimit: Number(formData.seatLimit)
      };

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Event updated successfully.');
      } else {
        await axios.post('/api/events', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('New event scheduled successfully.');
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Save event error:', err);
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Event deleted.');
      fetchEvents();
    } catch (err) {
      console.error('Delete event error:', err);
      setError('Failed to delete event.');
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
            <span className="text-danger me-2">📅</span> Events & Camps Management
          </h2>
          <p className="text-muted small mb-0">Organize village camps, health drives, and view registered resident attendees</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-3 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Schedule New Event
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border"><div className="spinner-border text-success"></div></div>
      ) : events.length === 0 ? (
        <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">No scheduled events.</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th scope="col" className="ps-4 py-3">Event Title / Program</th>
                  <th scope="col" className="py-3">Type</th>
                  <th scope="col" className="py-3">Date & Venue</th>
                  <th scope="col" className="py-3 text-center">Registrations</th>
                  <th scope="col" className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const regCount = evt.registeredUsers?.length || 0;
                  return (
                    <tr key={evt._id}>
                      <td className="ps-4 py-3">
                        <div className="fw-semibold text-dark">{evt.title}</div>
                        <div className="small text-muted line-clamp-1" style={{ maxWidth: '300px' }}>{evt.description}</div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-light text-secondary border small text-capitalize">{evt.type}</span>
                      </td>
                      <td className="py-3 small">
                        <div><i className="bi bi-calendar3 me-1 text-primary"></i>{formatDate(evt.date)}</div>
                        <div className="text-muted"><i className="bi bi-geo-alt me-1 text-danger"></i>{evt.venue}</div>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info rounded-pill px-2 py-0 small"
                          onClick={() => handleViewAttendees(evt._id)}
                        >
                          <i className="bi bi-people me-1"></i> {regCount} / {evt.seatLimit} Registered
                        </button>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1" onClick={() => handleOpenEdit(evt)}>
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => handleDeleteEvent(evt._id)}>
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{editingEvent ? 'Edit Community Event' : 'Schedule Community Event'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveEvent}>
                <div className="modal-body pt-3">
                  <FormInput
                    label="Event Title"
                    name="title"
                    placeholder="e.g. Free Livestock Vaccination Drive"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />

                  <div className="row g-2">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Event Type</label>
                      <select
                        className="form-select rounded-3 py-2"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="vaccination">Vaccination Drive</option>
                        <option value="health camp">Health Camp</option>
                        <option value="meeting">Gram Sabha Meeting</option>
                        <option value="training">Farmer Workshop / Training</option>
                        <option value="festival">Village Festival</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <FormInput
                        label="Date & Time"
                        name="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <FormInput
                        label="Maximum Seat Limit"
                        name="seatLimit"
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.seatLimit}
                        onChange={(e) => setFormData({ ...formData, seatLimit: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <FormInput
                    label="Venue / Location in Village"
                    name="venue"
                    placeholder="e.g. Panchayat Bhawan Main Hall"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Event Details & Description</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Specify who can attend, doctors visiting, items to bring..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                    {saving ? 'Scheduling...' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Roster Modal */}
      {showAttendeesModal && attendeesEvent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Registered Attendees</h5>
                  <p className="small text-muted mb-0">{attendeesEvent.title}</p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowAttendeesModal(false)}></button>
              </div>

              <div className="modal-body pt-3">
                <div className="p-2 bg-light rounded-3 small border mb-3 d-flex justify-content-between">
                  <span>Capacity: <strong>{attendeesEvent.seatLimit}</strong></span>
                  <span>Registered: <strong>{attendeesEvent.registeredUsers?.length || 0}</strong></span>
                </div>

                {!attendeesEvent.registeredUsers || attendeesEvent.registeredUsers.length === 0 ? (
                  <p className="text-muted small text-center my-3">No villagers have registered for this event yet.</p>
                ) : (
                  <ul className="list-group list-group-flush small">
                    {attendeesEvent.registeredUsers.map((u, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div>
                          <strong>{u.name || 'Villager'}</strong>
                          <span className="text-muted ms-2">@{u.username}</span>
                        </div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Confirmed</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowAttendeesModal(false)}>
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

export default EventManagement;

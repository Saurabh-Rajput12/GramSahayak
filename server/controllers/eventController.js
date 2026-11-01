// Event controller managing village camps, training workshops, and resident registrations
const Event = require('../models/Event');

// Get all village events with optional type and search filtering
const getAllEvents = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};

    if (type && type.trim()) {
      filter.type = type.trim();
    }

    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Get all events error:', error.message);
    res.status(500).json({ message: 'Server error fetching events', error: error.message });
  }
};

// Get events where current logged-in user is registered
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user._id }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Get my events error:', error.message);
    res.status(500).json({ message: 'Server error fetching registered events', error: error.message });
  }
};

// Get single event details with populated registered user names (Panchayat or details view)
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredUsers', 'name username');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Get event by id error:', error.message);
    res.status(500).json({ message: 'Server error fetching event details', error: error.message });
  }
};

// Create a new event (Panchayat only)
const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, venue, seatLimit } = req.body;

    // Validate required fields
    if (!title || !description || !type || !date || !venue || seatLimit === undefined) {
      return res.status(400).json({ message: 'Please provide title, description, type, date, venue, and seatLimit' });
    }

    const validTypes = ['vaccination', 'health camp', 'meeting', 'training', 'festival'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      date: new Date(date),
      venue: venue.trim(),
      seatLimit: Number(seatLimit),
      registeredUsers: []
    });

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({ message: 'Server error creating event', error: error.message });
  }
};

// Update an existing event (Panchayat only)
const updateEvent = async (req, res) => {
  try {
    const { title, description, type, date, venue, seatLimit } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (type) event.type = type.trim();
    if (date) event.date = new Date(date);
    if (venue) event.venue = venue.trim();
    if (seatLimit !== undefined) event.seatLimit = Number(seatLimit);

    await event.save();
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error.message);
    res.status(500).json({ message: 'Server error updating event', error: error.message });
  }
};

// Delete an event (Panchayat only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(500).json({ message: 'Server error deleting event', error: error.message });
  }
};

// Register the logged-in villager for an event
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userIdStr = req.user._id.toString();

    // Check if user is already registered
    const isAlreadyRegistered = event.registeredUsers.some(uid => uid.toString() === userIdStr);
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if seats are fully booked
    if (event.registeredUsers.length >= event.seatLimit) {
      return res.status(400).json({ message: 'Event is already fully booked. No seats remaining.' });
    }

    event.registeredUsers.push(req.user._id);
    await event.save();

    res.status(200).json({ message: 'Registered successfully for the event', event });
  } catch (error) {
    console.error('Register for event error:', error.message);
    res.status(500).json({ message: 'Server error registering for event', error: error.message });
  }
};

// Cancel registration for an event
const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userIdStr = req.user._id.toString();
    event.registeredUsers = event.registeredUsers.filter(uid => uid.toString() !== userIdStr);
    await event.save();

    res.status(200).json({ message: 'Event registration cancelled successfully', event });
  } catch (error) {
    console.error('Cancel registration error:', error.message);
    res.status(500).json({ message: 'Server error cancelling registration', error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration
};

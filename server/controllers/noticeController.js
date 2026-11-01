// Notice controller for public village circulars and Panchayat announcements
const Notice = require('../models/Notice');

// Get all notices with optional type and search filtering
const getAllNotices = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};

    // Filter by announcement type (meeting, camp, water, general)
    if (type && type.trim()) {
      filter.type = type.trim();
    }

    // Search by notice title (case-insensitive)
    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const notices = await Notice.find(filter).sort({ date: -1 });
    res.status(200).json(notices);
  } catch (error) {
    console.error('Get notices error:', error.message);
    res.status(500).json({ message: 'Server error fetching notices', error: error.message });
  }
};

// Create a new notice (Panchayat only)
const createNotice = async (req, res) => {
  try {
    const { title, body, type, date } = req.body;

    if (!title || !body || !type) {
      return res.status(400).json({ message: 'Please provide notice title, body text, and type' });
    }

    const validTypes = ['meeting', 'camp', 'water', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid notice type. Allowed types: meeting, camp, water, general.' });
    }

    const newNotice = await Notice.create({
      title: title.trim(),
      body: body.trim(),
      type: type.trim(),
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ message: 'Notice published successfully', notice: newNotice });
  } catch (error) {
    console.error('Create notice error:', error.message);
    res.status(500).json({ message: 'Server error creating notice', error: error.message });
  }
};

// Update an existing notice (Panchayat only)
const updateNotice = async (req, res) => {
  try {
    const { title, body, type, date } = req.body;

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (title) notice.title = title.trim();
    if (body) notice.body = body.trim();
    if (type) {
      const validTypes = ['meeting', 'camp', 'water', 'general'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid notice type' });
      }
      notice.type = type.trim();
    }
    if (date) notice.date = new Date(date);

    await notice.save();
    res.status(200).json({ message: 'Notice updated successfully', notice });
  } catch (error) {
    console.error('Update notice error:', error.message);
    res.status(500).json({ message: 'Server error updating notice', error: error.message });
  }
};

// Delete a notice (Panchayat only)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await Notice.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error.message);
    res.status(500).json({ message: 'Server error deleting notice', error: error.message });
  }
};

module.exports = {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice
};

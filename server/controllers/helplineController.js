// Helpline controller for village emergency and public utility contacts
const Helpline = require('../models/Helpline');

// Get all helpline contacts with search and category filters
const getAllHelplines = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Filter by emergency service category
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Search by contact name or phone number
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex }
      ];
    }

    const helplines = await Helpline.find(filter).sort({ name: 1 });
    res.status(200).json(helplines);
  } catch (error) {
    console.error('Get helplines error:', error.message);
    res.status(500).json({ message: 'Server error fetching helplines', error: error.message });
  }
};

// Create a new helpline contact (Panchayat only)
const createHelpline = async (req, res) => {
  try {
    const { name, category, phone, address, timings } = req.body;

    if (!name || !category || !phone) {
      return res.status(400).json({ message: 'Please provide helpline name, category, and phone number' });
    }

    const validCategories = ['hospital', 'police', 'fire', 'ambulance', 'patwari', 'electricity', 'water', 'bank', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid helpline category' });
    }

    const newHelpline = await Helpline.create({
      name: name.trim(),
      category: category.trim(),
      phone: phone.trim(),
      address: address ? address.trim() : '',
      timings: timings ? timings.trim() : '24x7'
    });

    res.status(201).json({ message: 'Helpline added successfully', helpline: newHelpline });
  } catch (error) {
    console.error('Create helpline error:', error.message);
    res.status(500).json({ message: 'Server error creating helpline', error: error.message });
  }
};

// Update an existing helpline contact (Panchayat only)
const updateHelpline = async (req, res) => {
  try {
    const { name, category, phone, address, timings } = req.body;

    const helpline = await Helpline.findById(req.params.id);
    if (!helpline) {
      return res.status(404).json({ message: 'Helpline contact not found' });
    }

    if (name) helpline.name = name.trim();
    if (category) helpline.category = category.trim();
    if (phone) helpline.phone = phone.trim();
    if (address !== undefined) helpline.address = address.trim();
    if (timings !== undefined) helpline.timings = timings.trim();

    await helpline.save();
    res.status(200).json({ message: 'Helpline updated successfully', helpline });
  } catch (error) {
    console.error('Update helpline error:', error.message);
    res.status(500).json({ message: 'Server error updating helpline', error: error.message });
  }
};

// Delete a helpline contact (Panchayat only)
const deleteHelpline = async (req, res) => {
  try {
    const helpline = await Helpline.findById(req.params.id);
    if (!helpline) {
      return res.status(404).json({ message: 'Helpline contact not found' });
    }

    await Helpline.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Helpline deleted successfully' });
  } catch (error) {
    console.error('Delete helpline error:', error.message);
    res.status(500).json({ message: 'Server error deleting helpline', error: error.message });
  }
};

module.exports = {
  getAllHelplines,
  createHelpline,
  updateHelpline,
  deleteHelpline
};

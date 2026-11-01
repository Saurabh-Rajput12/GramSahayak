// Scheme controller for managing government and panchayat welfare schemes
const Scheme = require('../models/Scheme');

// Get all schemes with optional backend search and category filtering
const getAllSchemes = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Filter by category if provided
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Search by scheme name (case-insensitive)
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.status(200).json(schemes);
  } catch (error) {
    console.error('Get schemes error:', error.message);
    res.status(500).json({ message: 'Server error fetching schemes', error: error.message });
  }
};

// Get single scheme details by ID
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.status(200).json(scheme);
  } catch (error) {
    console.error('Get scheme by id error:', error.message);
    res.status(500).json({ message: 'Server error fetching scheme details', error: error.message });
  }
};

// Create a new scheme (Panchayat only)
const createScheme = async (req, res) => {
  try {
    const { name, description, category, documentsRequired, minAge, maxIncome, applyLink } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Please provide scheme name, description, and category' });
    }

    // Ensure documentsRequired is an array of strings
    let docs = [];
    if (Array.isArray(documentsRequired)) {
      docs = documentsRequired;
    } else if (typeof documentsRequired === 'string' && documentsRequired.trim()) {
      docs = documentsRequired.split(',').map(d => d.trim()).filter(Boolean);
    }

    const newScheme = await Scheme.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      documentsRequired: docs,
      minAge: Number(minAge) || 0,
      maxIncome: Number(maxIncome) || 0,
      applyLink: applyLink ? applyLink.trim() : ''
    });

    res.status(201).json({ message: 'Scheme created successfully', scheme: newScheme });
  } catch (error) {
    console.error('Create scheme error:', error.message);
    res.status(500).json({ message: 'Server error creating scheme', error: error.message });
  }
};

// Update an existing scheme (Panchayat only)
const updateScheme = async (req, res) => {
  try {
    const { name, description, category, documentsRequired, minAge, maxIncome, applyLink } = req.body;

    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    if (name) scheme.name = name.trim();
    if (description) scheme.description = description.trim();
    if (category) scheme.category = category.trim();
    if (documentsRequired !== undefined) {
      scheme.documentsRequired = Array.isArray(documentsRequired)
        ? documentsRequired
        : documentsRequired.split(',').map(d => d.trim()).filter(Boolean);
    }
    if (minAge !== undefined) scheme.minAge = Number(minAge) || 0;
    if (maxIncome !== undefined) scheme.maxIncome = Number(maxIncome) || 0;
    if (applyLink !== undefined) scheme.applyLink = applyLink.trim();

    await scheme.save();
    res.status(200).json({ message: 'Scheme updated successfully', scheme });
  } catch (error) {
    console.error('Update scheme error:', error.message);
    res.status(500).json({ message: 'Server error updating scheme', error: error.message });
  }
};

// Delete a scheme (Panchayat only)
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    await Scheme.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('Delete scheme error:', error.message);
    res.status(500).json({ message: 'Server error deleting scheme', error: error.message });
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme
};

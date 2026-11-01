// Complaint controller handling grievances filed by villagers and addressed by Panchayat
const Complaint = require('../models/Complaint');

// Create a new grievance complaint (Villager)
const createComplaint = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    // Validate required fields
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Please provide complaint title, category, and description' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      status: 'open',
      panchayatReply: ''
    });

    res.status(201).json({ message: 'Complaint filed successfully', complaint });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ message: 'Server error filing complaint', error: error.message });
  }
};

// Get all complaints filed by the currently logged-in villager
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    res.status(500).json({ message: 'Server error fetching your complaints', error: error.message });
  }
};

// Update an open complaint (Villager can edit only while status is 'open')
const updateMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this complaint' });
    }

    // Villagers can only edit complaints while in 'open' status
    if (complaint.status !== 'open') {
      return res.status(400).json({
        message: 'Cannot edit complaint once it has been processed or resolved by Panchayat'
      });
    }

    if (title) complaint.title = title.trim();
    if (category) complaint.category = category.trim();
    if (description) complaint.description = description.trim();

    await complaint.save();
    res.status(200).json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({ message: 'Server error updating complaint', error: error.message });
  }
};

// Delete an open complaint (Villager can delete only while status is 'open')
const deleteMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    // Villagers can only delete complaints while in 'open' status
    if (complaint.status !== 'open') {
      return res.status(400).json({
        message: 'Cannot delete complaint once it has been processed or resolved by Panchayat'
      });
    }

    await Complaint.deleteOne({ _id: id });
    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error.message);
    res.status(500).json({ message: 'Server error deleting complaint', error: error.message });
  }
};

// Get all complaints with filters (Panchayat only, ?status=&category=&search=)
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status.trim()) {
      filter.status = status.trim();
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    if (search && search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Get all complaints error:', error.message);
    res.status(500).json({ message: 'Server error fetching all complaints', error: error.message });
  }
};

// Update complaint status and reply (Panchayat only)
const respondToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, panchayatReply } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be open, in_progress, or resolved.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (panchayatReply !== undefined) complaint.panchayatReply = panchayatReply.trim();

    await complaint.save();
    res.status(200).json({ message: 'Complaint response recorded successfully', complaint });
  } catch (error) {
    console.error('Respond to complaint error:', error.message);
    res.status(500).json({ message: 'Server error recording complaint response', error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  updateMyComplaint,
  deleteMyComplaint,
  getAllComplaints,
  respondToComplaint
};

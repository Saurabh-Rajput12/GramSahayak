// Feedback controller managing citizen suggestions, appreciations, and issues submitted to Panchayat
const Feedback = require('../models/Feedback');

// Submit new feedback or suggestion (Villager)
const createFeedback = async (req, res) => {
  try {
    const { subject, message, type, rating } = req.body;

    // Validate required fields
    if (!subject || !message || !type || rating === undefined) {
      return res.status(400).json({ message: 'Please provide subject, message, type, and rating (1-5)' });
    }

    const validTypes = ['suggestion', 'appreciation', 'problem'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid feedback type. Must be suggestion, appreciation, or problem.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
      type: type.trim(),
      rating: numRating,
      isRead: false
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Create feedback error:', error.message);
    res.status(500).json({ message: 'Server error submitting feedback', error: error.message });
  }
};

// Get feedback submitted by the currently logged-in user
const getMyFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error('Get my feedback error:', error.message);
    res.status(500).json({ message: 'Server error fetching your feedback', error: error.message });
  }
};

// Get all citizen feedback with optional type filter (Panchayat only)
const getAllFeedback = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type && type.trim()) {
      filter.type = type.trim();
    }

    const feedbackList = await Feedback.find(filter)
      .populate('user', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbackList);
  } catch (error) {
    console.error('Get all feedback error:', error.message);
    res.status(500).json({ message: 'Server error fetching feedback list', error: error.message });
  }
};

// Mark feedback entry as read (Panchayat only)
const markFeedbackAsRead = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.isRead = true;
    await feedback.save();

    res.status(200).json({ message: 'Feedback marked as read', feedback });
  } catch (error) {
    console.error('Mark feedback read error:', error.message);
    res.status(500).json({ message: 'Server error updating feedback status', error: error.message });
  }
};

// Delete feedback entry (Panchayat only)
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await Feedback.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error.message);
    res.status(500).json({ message: 'Server error deleting feedback', error: error.message });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  markFeedbackAsRead,
  deleteFeedback
};

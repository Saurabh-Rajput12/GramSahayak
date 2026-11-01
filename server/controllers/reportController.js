// Report controller generating village statistics and summary counts for Panchayat dashboard
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Application = require('../models/Application');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const Scheme = require('../models/Scheme');

// Get village report summary using countDocuments
const getVillageSummary = async (req, res) => {
  try {
    // Total villagers registered in portal
    const totalVillagers = await User.countDocuments({ role: 'villager' });

    // Blocked user accounts count
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Complaints breakdown by status
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const totalComplaints = openComplaints + inProgressComplaints + resolvedComplaints;

    // Applications breakdown by status
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const totalApplications = pendingApplications + approvedApplications + rejectedApplications;

    // Total orders, market products, and events count
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalSchemes = await Scheme.countDocuments();

    // Unread feedback waiting for review
    const unreadFeedback = await Feedback.countDocuments({ isRead: false });

    res.status(200).json({
      totalVillagers,
      blockedUsers,
      totalSchemes,
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        in_progress: inProgressComplaints,
        resolved: resolvedComplaints
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications
      },
      totalOrders,
      totalProducts,
      totalEvents,
      unreadFeedback
    });
  } catch (error) {
    console.error('Get village summary error:', error.message);
    res.status(500).json({ message: 'Server error generating village reports', error: error.message });
  }
};

module.exports = {
  getVillageSummary
};

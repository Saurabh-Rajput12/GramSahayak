// Report controller generating village statistics and summary counts for Panchayat dashboard
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Application = require('../models/Application');
const Product = require('../models/Product');
const Scheme = require('../models/Scheme');
const Notice = require('../models/Notice');

// Get village report summary using simple countDocuments for mini project
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

    // Total market products, schemes, and notices count
    const totalProducts = await Product.countDocuments();
    const totalSchemes = await Scheme.countDocuments();
    const totalNotices = await Notice.countDocuments();

    res.status(200).json({
      totalVillagers,
      blockedUsers,
      totalSchemes,
      totalProducts,
      totalNotices,
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
      }
    });
  } catch (error) {
    console.error('Village summary error:', error.message);
    res.status(500).json({ message: 'Server error generating village summary', error: error.message });
  }
};

module.exports = {
  getVillageSummary
};

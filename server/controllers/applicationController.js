// Application controller handling scheme applications by villagers and reviews by Panchayat
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');

// Submit a new scheme application by a villager
const applyForScheme = async (req, res) => {
  try {
    const { scheme, fullName, age, income, landAcres } = req.body;

    // Validate required fields
    if (!scheme || !fullName || age === undefined || income === undefined) {
      return res.status(400).json({ message: 'Please provide scheme ID, full name, age, and annual income' });
    }

    const applicantAge = Number(age);
    const applicantIncome = Number(income);
    const landArea = landAcres !== undefined ? Number(landAcres) : 0;

    // Fetch the target scheme to verify eligibility rules
    const targetScheme = await Scheme.findById(scheme);
    if (!targetScheme) {
      return res.status(404).json({ message: 'The selected scheme does not exist' });
    }

    // Check for duplicate application by the same villager for this scheme
    const existingApp = await Application.findOne({ user: req.user._id, scheme: scheme });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this scheme' });
    }

    // Enforce scheme minimum age requirement if configured
    if (targetScheme.minAge > 0 && applicantAge < targetScheme.minAge) {
      return res.status(400).json({
        message: `Eligibility criteria not met: Minimum age required for this scheme is ${targetScheme.minAge} years`
      });
    }

    // Enforce scheme maximum income requirement if configured
    if (targetScheme.maxIncome > 0 && applicantIncome > targetScheme.maxIncome) {
      return res.status(400).json({
        message: `Eligibility criteria not met: Annual family income exceeds the ceiling of ₹${targetScheme.maxIncome}`
      });
    }

    // Create the scheme application
    const application = await Application.create({
      user: req.user._id,
      scheme: targetScheme._id,
      fullName: fullName.trim(),
      age: applicantAge,
      income: applicantIncome,
      landAcres: landArea,
      status: 'pending',
      remark: ''
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Apply for scheme error:', error.message);
    res.status(500).json({ message: 'Server error submitting application', error: error.message });
  }
};

// Get all applications submitted by the logged-in villager
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('scheme', 'name category')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get my applications error:', error.message);
    res.status(500).json({ message: 'Server error fetching your applications', error: error.message });
  }
};

// Get all scheme applications across the village (Panchayat only, optional ?status= filter)
const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status.trim()) {
      filter.status = status.trim();
    }

    const applications = await Application.find(filter)
      .populate('user', 'name username')
      .populate('scheme', 'name category')
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get all applications error:', error.message);
    res.status(500).json({ message: 'Server error fetching all applications', error: error.message });
  }
};

// Review and update application status with remark (Panchayat only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    // Validate valid status enum
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be pending, approved, or rejected.' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (remark !== undefined) {
      application.remark = remark.trim();
    }

    await application.save();

    res.status(200).json({ message: 'Application status updated successfully', application });
  } catch (error) {
    console.error('Update application status error:', error.message);
    res.status(500).json({ message: 'Server error updating application status', error: error.message });
  }
};

module.exports = {
  applyForScheme,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus
};

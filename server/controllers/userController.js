// User controller for Panchayat administrator management of village accounts
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get all registered users with optional search, role, and blocked status filters
const getAllUsers = async (req, res) => {
  try {
    const { search, role, blocked } = req.query;
    const filter = {};

    // Filter by role if specified
    if (role) {
      filter.role = role;
    }

    // Filter by blocked status if specified
    if (blocked !== undefined && blocked !== '') {
      filter.isBlocked = blocked === 'true';
    }

    // Search by name or username (case-insensitive)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { username: searchRegex }
      ];
    }

    // Fetch matching users excluding password field
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ message: 'Server error fetching user list', error: error.message });
  }
};

// Toggle user blocked status (block or unblock)
const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent panchayat administrator from blocking their own account
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block your own panchayat account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle blocked status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: user.isBlocked ? 'User has been blocked successfully' : 'User has been unblocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Toggle block user error:', error.message);
    res.status(500).json({ message: 'Server error updating user block status', error: error.message });
  }
};

// Reset a user's password directly by the Panchayat
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword.trim(), salt);
    await user.save();

    res.status(200).json({ message: `Password for user ${user.username} has been reset successfully` });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error resetting user password', error: error.message });
  }
};

// Delete a user account from the system
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent panchayat administrator from deleting their own account
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own panchayat account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user using plain Mongoose deleteOne
    await User.deleteOne({ _id: id });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  toggleBlockUser,
  resetUserPassword,
  deleteUser
};

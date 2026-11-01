// Auth controller handling registration, login, and profile operations
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token with 7-day validity
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || 'gram_sahayak_super_secret_lab_key_2026',
    { expiresIn: '7d' }
  );
};

// Register a new villager account
const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Validate required fields
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, username, and password' });
    }

    // Validate password length
    if (password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check if username already exists
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(409).json({ message: 'Username is already taken. Please choose another.' });
    }

    // Hash the password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Create new user with default 'villager' role
    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password: hashedPassword,
      role: 'villager',
      isBlocked: false
    });

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    // Return created user details without password
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        isBlocked: newUser.isBlocked
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login user and return JWT token
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter both username and password' });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Find user by username
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by the Panchayat. Please contact the panchayat office.' });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user details and authentication token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Get current logged-in user profile
const getMe = async (req, res) => {
  try {
    // req.user was already fetched and verified by protect middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// Update logged-in user profile name and/or password
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};

// Main server entry point for Gram Sahayak (College Mini Project)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import 5 core module routes + auth and reports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const productRoutes = require('./routes/productRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gram_sahayak';

// Built-in and third-party middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start database connection
connectDB();

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Gram Sahayak Mini Project API is running smoothly' });
});

// Mount application API routes for 5 core modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/reports', reportRoutes);

// Global error handling middleware for handling unexpected server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

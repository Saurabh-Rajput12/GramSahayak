// Scheme model representing government and panchayat welfare schemes
const mongoose = require('mongoose');

// Define schema for village welfare schemes
const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['farmer', 'health', 'pension', 'housing', 'education'],
    required: true
  },
  documentsRequired: [
    {
      type: String,
      trim: true
    }
  ],
  minAge: {
    type: Number,
    default: 0
  },
  maxIncome: {
    type: Number,
    default: 0
  },
  applyLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', schemeSchema);

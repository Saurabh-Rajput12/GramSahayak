// Notice model for official panchayat circulars and public bulletins
const mongoose = require('mongoose');

// Define schema for village announcements and notices
const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting', 'camp', 'water', 'general'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', noticeSchema);

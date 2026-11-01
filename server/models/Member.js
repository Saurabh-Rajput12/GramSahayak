// Member model representing elected and administrative Gram Panchayat representatives
const mongoose = require('mongoose');

// Define schema for panchayat committee members
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  post: {
    type: String,
    required: true,
    trim: true
  },
  ward: {
    type: String,
    default: '',
    trim: true
  },
  contactNote: {
    type: String,
    default: '',
    trim: true
  },
  since: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', memberSchema);

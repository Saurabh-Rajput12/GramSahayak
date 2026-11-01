// Helpline model for village emergency and essential public contact numbers
const mongoose = require('mongoose');

// Define schema for village helpline directory contacts
const helplineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['hospital', 'police', 'fire', 'ambulance', 'patwari', 'electricity', 'water', 'bank', 'other'],
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  timings: {
    type: String,
    default: '24x7',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Helpline', helplineSchema);

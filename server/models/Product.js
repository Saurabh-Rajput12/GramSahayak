// Product model for rural marketplace items sold directly by villagers
const mongoose = require('mongoose');

// Define schema for village market produce and goods
const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'grains', 'dairy', 'fruits', 'handicrafts', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'piece', 'quintal', 'dozen'],
    default: 'kg'
  },
  location: {
    type: String,
    default: 'Gram Panchayat Rampur'
  },
  contactPhone: {
    type: String,
    default: '9876543210'
  },
  description: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

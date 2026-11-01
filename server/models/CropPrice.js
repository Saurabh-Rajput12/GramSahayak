// CropPrice model representing agricultural mandi market rates
const mongoose = require('mongoose');

// Define schema for daily mandi crop prices
const cropPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    trim: true
  },
  market: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CropPrice', cropPriceSchema);

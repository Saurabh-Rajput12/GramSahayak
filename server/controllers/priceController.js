// CropPrice controller for managing daily mandi agricultural rates
const CropPrice = require('../models/CropPrice');

// Get all crop prices with backend filtering by search, district, and price range
const getAllPrices = async (req, res) => {
  try {
    const { search, district, minPrice, maxPrice } = req.query;
    const filter = {};

    // Search by crop name (case-insensitive)
    if (search && search.trim()) {
      filter.crop = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by district name (case-insensitive)
    if (district && district.trim()) {
      filter.district = { $regex: district.trim(), $options: 'i' };
    }

    // Filter by minimum and maximum price range
    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const prices = await CropPrice.find(filter).sort({ date: -1 });
    res.status(200).json(prices);
  } catch (error) {
    console.error('Get prices error:', error.message);
    res.status(500).json({ message: 'Server error fetching crop prices', error: error.message });
  }
};

// Create a new crop price record (Panchayat only)
const createPrice = async (req, res) => {
  try {
    const { crop, market, district, price, date } = req.body;

    if (!crop || !market || !district || price === undefined) {
      return res.status(400).json({ message: 'Please provide crop name, market, district, and price' });
    }

    const newPrice = await CropPrice.create({
      crop: crop.trim(),
      market: market.trim(),
      district: district.trim(),
      price: Number(price),
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ message: 'Crop price recorded successfully', cropPrice: newPrice });
  } catch (error) {
    console.error('Create price error:', error.message);
    res.status(500).json({ message: 'Server error creating crop price', error: error.message });
  }
};

// Update an existing crop price record (Panchayat only)
const updatePrice = async (req, res) => {
  try {
    const { crop, market, district, price, date } = req.body;

    const cropPrice = await CropPrice.findById(req.params.id);
    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price record not found' });
    }

    if (crop) cropPrice.crop = crop.trim();
    if (market) cropPrice.market = market.trim();
    if (district) cropPrice.district = district.trim();
    if (price !== undefined) cropPrice.price = Number(price);
    if (date) cropPrice.date = new Date(date);

    await cropPrice.save();
    res.status(200).json({ message: 'Crop price updated successfully', cropPrice });
  } catch (error) {
    console.error('Update price error:', error.message);
    res.status(500).json({ message: 'Server error updating crop price', error: error.message });
  }
};

// Delete a crop price record (Panchayat only)
const deletePrice = async (req, res) => {
  try {
    const cropPrice = await CropPrice.findById(req.params.id);
    if (!cropPrice) {
      return res.status(404).json({ message: 'Crop price record not found' });
    }

    await CropPrice.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Crop price deleted successfully' });
  } catch (error) {
    console.error('Delete price error:', error.message);
    res.status(500).json({ message: 'Server error deleting crop price', error: error.message });
  }
};

module.exports = {
  getAllPrices,
  createPrice,
  updatePrice,
  deletePrice
};

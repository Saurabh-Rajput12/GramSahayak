// Member controller managing elected Gram Panchayat representatives
const Member = require('../models/Member');

// Get list of all Panchayat members
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ since: 1, createdAt: 1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('Get members error:', error.message);
    res.status(500).json({ message: 'Server error fetching panchayat members', error: error.message });
  }
};

// Create a new Panchayat member record (Panchayat only)
const createMember = async (req, res) => {
  try {
    const { name, post, ward, contactNote, since } = req.body;

    if (!name || !post || since === undefined) {
      return res.status(400).json({ message: 'Please provide member name, post, and since year' });
    }

    const newMember = await Member.create({
      name: name.trim(),
      post: post.trim(),
      ward: ward ? ward.trim() : '',
      contactNote: contactNote ? contactNote.trim() : '',
      since: Number(since)
    });

    res.status(201).json({ message: 'Member added successfully', member: newMember });
  } catch (error) {
    console.error('Create member error:', error.message);
    res.status(500).json({ message: 'Server error adding member', error: error.message });
  }
};

// Update an existing Panchayat member record (Panchayat only)
const updateMember = async (req, res) => {
  try {
    const { name, post, ward, contactNote, since } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (name) member.name = name.trim();
    if (post) member.post = post.trim();
    if (ward !== undefined) member.ward = ward.trim();
    if (contactNote !== undefined) member.contactNote = contactNote.trim();
    if (since !== undefined) member.since = Number(since);

    await member.save();
    res.status(200).json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Update member error:', error.message);
    res.status(500).json({ message: 'Server error updating member', error: error.message });
  }
};

// Delete a Panchayat member record (Panchayat only)
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await Member.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error.message);
    res.status(500).json({ message: 'Server error deleting member', error: error.message });
  }
};

module.exports = {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember
};

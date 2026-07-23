const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');
require('../models/Member');

// ✅ GET all appointments for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ createdBy: req.user._id })
      .populate('member', 'name relation age')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('❌ Appointment GET error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ CREATE appointment
router.post('/', protect, async (req, res) => {
  try {
    const { member, title, doctor, date, time, location, notes } = req.body;

    console.log('📥 Appointment POST body:', req.body); // 👈 ADDED
    console.log('👤 User:', req.user._id);              // 👈 ADDED

    if (!mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({ success: false, error: 'Invalid member ID' });
    }

    const appointment = new Appointment({
      member,
      title,
      doctor,
      date,
      time,
      location: location || '',
      notes: notes || '',
      status: 'scheduled',
      createdBy: req.user._id
    });

    await appointment.save();
    await appointment.populate('member', 'name relation age');

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('❌ Appointment POST error:', error.message); // 👈 ADDED
    console.error('❌ Full error:', error);                     // 👈 ADDED
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ GET appointments by member
router.get('/member/:memberId', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      member: req.params.memberId,
      createdBy: req.user._id
    }).sort({ date: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('❌ Appointment GET by member error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ DELETE appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('❌ Appointment DELETE error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ UPDATE status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('❌ Appointment PATCH error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
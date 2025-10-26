const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth'); // ✅ FIXED IMPORT

// Create appointment
router.post('/', protect, async (req, res) => {
  try {
    console.log('🟡 [BACKEND] Full request body:', req.body);

    const { member, title, doctor, date, time, location, notes } = req.body;

    // Check if member ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member ID format'
      });
    }

    // Check if all required fields exist
    const missingFields = [];
    if (!member) missingFields.push('member');
    if (!title) missingFields.push('title');
    if (!doctor) missingFields.push('doctor');
    if (!date) missingFields.push('date');
    if (!time) missingFields.push('time');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    console.log('🟡 [BACKEND] Creating appointment for user:', req.user._id);

    const appointment = new Appointment({
      member: member,
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

    console.log('✅ [BACKEND] Appointment created successfully:', appointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    console.error('❌ [BACKEND] Detailed error:', error);
    console.error('❌ [BACKEND] Error name:', error.name);
    console.error('❌ [BACKEND] Error message:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment: ' + error.message
    });
  }
});

// Get appointments by member
router.get('/member/:memberId', protect, async (req, res) => { // ✅ Use 'protect'
  try {
    const appointments = await Appointment.find({
      member: req.params.memberId,
      createdBy: req.user._id
    })
    .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete appointment
router.delete('/:id', protect, async (req, res) => { // ✅ Use 'protect'
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    await Appointment.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update appointment status
router.patch('/:id/status', protect, async (req, res) => { // ✅ Use 'protect'
  try {
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        familyId: req.user.familyId
      },
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
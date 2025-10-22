const Record = require('../models/Record');
const Member = require('../models/Member');

// @desc    Get all records for a member
// @route   GET /api/records/member/:memberId
// @access  Private
exports.getRecordsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { recordType } = req.query;

    // Verify member belongs to user
    const member = await Member.findOne({ 
      _id: memberId, 
      userId: req.userId 
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    const query = { memberId };
    if (recordType) {
      query.recordType = recordType;
    }

    const records = await Record.find(query)
      .populate('memberId', 'name age')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/records/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Record.find({
      userId: req.userId,
      recordType: 'appointment',
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'rescheduled'] }
    })
      .populate('memberId', 'name age')
      .sort({ appointmentDate: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get single record by ID
// @route   GET /api/records/:id
// @access  Private
exports.getRecordById = async (req, res) => {
  try {
    const record = await Record.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    }).populate('memberId', 'name age');

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: 'Record not found' 
      });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Create new record
// @route   POST /api/records
// @access  Private
exports.createRecord = async (req, res) => {
  try {
    const recordData = req.body;

    // Validate required fields
    if (!recordData.memberId || !recordData.recordType || !recordData.title) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide all required fields' 
      });
    }

    // Verify member belongs to user
    const member = await Member.findOne({ 
      _id: recordData.memberId, 
      userId: req.userId 
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    const record = await Record.create({
      ...recordData,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      record
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private
exports.updateRecord = async (req, res) => {
  try {
    let record = await Record.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: 'Record not found' 
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        record[key] = req.body[key];
      }
    });

    await record.save();

    res.json({
      success: true,
      message: 'Record updated successfully',
      record
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Delete record
// @route   DELETE /api/records/:id
// @access  Private
exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: 'Record not found' 
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
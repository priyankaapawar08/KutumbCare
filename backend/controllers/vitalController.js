const Vital = require('../models/Vital');
const Member = require('../models/Member');

// @desc    Get all vitals for a member
// @route   GET /api/vitals/member/:memberId
// @access  Private
exports.getVitalsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    console.log('🟡 [BACKEND] Fetching vitals for member:', memberId);

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

    const vitals = await Vital.find({ memberId })
      .populate('memberId', 'name age')
      .sort({ date: -1, time: -1 });

    console.log('✅ [BACKEND] Found vitals:', vitals.length);

    res.json({
      success: true,
      count: vitals.length,
      vitals
    });
  } catch (error) {
    console.error('❌ Get vitals error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get vitals by type for a member
// @route   GET /api/vitals/member/:memberId/type/:vitalType
// @access  Private
exports.getVitalsByType = async (req, res) => {
  try {
    const { memberId, vitalType } = req.params;
    const { limit = 30 } = req.query;

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

    const vitals = await Vital.find({ 
      memberId, 
      vitalType 
    })
      .sort({ date: -1, time: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: vitals.length,
      vitalType,
      vitals
    });
  } catch (error) {
    console.error('❌ Get vitals by type error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get single vital by ID
// @route   GET /api/vitals/:id
// @access  Private
exports.getVitalById = async (req, res) => {
  try {
    const vital = await Vital.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    }).populate('memberId', 'name age');

    if (!vital) {
      return res.status(404).json({ 
        success: false,
        error: 'Vital record not found' 
      });
    }

    res.json({
      success: true,
      vital
    });
  } catch (error) {
    console.error('❌ Get vital error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Create new vital record
// @route   POST /api/vitals
// @access  Private
exports.createVital = async (req, res) => {
  try {
    const { memberId, vitalType, value, date, time, notes } = req.body;

    console.log('🟡 [BACKEND] Creating vital:', { memberId, vitalType, value, date, time });

    // Validate required fields
    if (!memberId || !vitalType || !value || !time) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide memberId, vitalType, value, and time' 
      });
    }

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

    // Create vital record
    const vital = await Vital.create({
      memberId,
      userId: req.userId,
      vitalType,
      value,
      date: date || new Date(),
      time,
      notes: notes || ''
    });

    console.log('✅ [BACKEND] Vital created:', vital._id);

    res.status(201).json({
      success: true,
      message: 'Vital record created successfully',
      vital
    });
  } catch (error) {
    console.error('❌ Create vital error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error: ' + error.message
    });
  }
};

// @desc    Update vital record
// @route   PUT /api/vitals/:id
// @access  Private
exports.updateVital = async (req, res) => {
  try {
    let vital = await Vital.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!vital) {
      return res.status(404).json({ 
        success: false,
        error: 'Vital record not found' 
      });
    }

    // Update fields
    const { value, date, time, notes } = req.body;
    if (value) vital.value = value;
    if (date) vital.date = date;
    if (time) vital.time = time;
    if (notes !== undefined) vital.notes = notes;

    await vital.save();

    res.json({
      success: true,
      message: 'Vital record updated successfully',
      vital
    });
  } catch (error) {
    console.error('❌ Update vital error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Delete vital record
// @route   DELETE /api/vitals/:id
// @access  Private
exports.deleteVital = async (req, res) => {
  try {
    const vital = await Vital.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!vital) {
      return res.status(404).json({ 
        success: false,
        error: 'Vital record not found' 
      });
    }

    await vital.deleteOne();

    res.json({
      success: true,
      message: 'Vital record deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete vital error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get vital trends/statistics
// @route   GET /api/vitals/trends/:memberId/:vitalType
// @access  Private
exports.getVitalTrends = async (req, res) => {
  try {
    const { memberId, vitalType } = req.params;
    const { days = 30 } = req.query;

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

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const vitals = await Vital.find({
      memberId,
      vitalType,
      date: { $gte: startDate }
    }).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: vitals.length,
      days: parseInt(days),
      trends: vitals
    });
  } catch (error) {
    console.error('❌ Get vital trends error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
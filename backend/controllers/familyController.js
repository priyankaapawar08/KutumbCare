const Family = require('../models/Family');
const Member = require('../models/Member');

// @desc    Get user's family
// @route   GET /api/families
// @access  Private
exports.getFamily = async (req, res) => {
  try {
    const family = await Family.findOne({ userId: req.userId })
      .populate('members', 'name age gender relation bloodGroup');

    if (!family) {
      return res.status(404).json({ 
        success: false,
        error: 'Family not found' 
      });
    }

    res.json({
      success: true,
      family
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Create family for user
// @route   POST /api/families
// @access  Private
exports.createFamily = async (req, res) => {
  try {
    const { familyName } = req.body;

    if (!familyName) {
      return res.status(400).json({ 
        success: false,
        error: 'Family name is required' 
      });
    }

    // Check if user already has a family
    const existingFamily = await Family.findOne({ userId: req.userId });
    if (existingFamily) {
      return res.status(400).json({ 
        success: false,
        error: 'User already has a family' 
      });
    }

    const family = await Family.create({
      familyName,
      userId: req.userId,
      members: []
    });

    res.status(201).json({
      success: true,
      message: 'Family created successfully',
      family
    });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Update family
// @route   PUT /api/families/:id
// @access  Private
exports.updateFamily = async (req, res) => {
  try {
    const family = await Family.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!family) {
      return res.status(404).json({ 
        success: false,
        error: 'Family not found' 
      });
    }

    if (req.body.familyName) {
      family.familyName = req.body.familyName;
    }

    await family.save();

    res.json({
      success: true,
      message: 'Family updated successfully',
      family
    });
  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
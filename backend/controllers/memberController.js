const Member = require('../models/Member');
const Family = require('../models/Family');

// @desc    Get all members for logged-in user
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res) => {
  try {
    console.log('🟡 [BACKEND] Fetching members for user:', req.userId);
    
    const members = await Member.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    console.log('✅ [BACKEND] Found members:', members.length);
    console.log('✅ [BACKEND] Members data:', JSON.stringify(members, null, 2));

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('❌ Get members error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findOne({ 
  _id: req.params.id, 
  userId: req.userId 
}); 

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    res.json({
      success: true,
      member
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private
// @desc    Create new member
// @route   POST /api/members
// @access  Private
exports.createMember = async (req, res) => {
  try {
    const memberData = req.body;

    console.log('🟡 [BACKEND] Received member data:', memberData);
    console.log('👤 User ID:', req.userId);

    // Validate required fields - REMOVE familyId from required fields temporarily
    if (!memberData.name || !memberData.age || !memberData.gender || !memberData.relation) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide name, age, gender, and relation' 
      });
    }

    // If familyId is provided, check if it exists and belongs to user
    if (memberData.familyId) {
      const family = await Family.findOne({ 
        _id: memberData.familyId, 
        userId: req.userId 
      });

      if (!family) {
        return res.status(404).json({ 
          success: false,
          error: 'Family not found' 
        });
      }
    }

    // Create member without familyId for now, or use a default
    const member = await Member.create({
      name: memberData.name,
      age: memberData.age,
      gender: memberData.gender,
      relation: memberData.relation,
      bloodGroup: memberData.bloodGroup || 'unknown',
      userId: req.userId
      // Remove familyId temporarily
    });

    console.log('✅ [BACKEND] Member created successfully:', member);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      member
    });
  } catch (error) {
    console.error('❌ [BACKEND] Create member error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during member creation' 
    });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = async (req, res) => {
  try {
    let member = await Member.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        member[key] = req.body[key];
      }
    });

    await member.save();

    res.json({
      success: true,
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    // Remove member from family only if familyId exists
if (member.familyId) {
  await Family.updateOne(
    { _id: member.familyId },
    { $pull: { members: member._id } }
  );
}

    await member.deleteOne();

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
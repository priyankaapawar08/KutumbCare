const Medication = require('../models/Medication');
const Member = require('../models/Member');

// @desc    Get all medications for a member
// @route   GET /api/medications/member/:memberId
// @access  Private
exports.getMedicationsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    console.log('🟡 [BACKEND] Fetching medications for member:', memberId);

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

    const medications = await Medication.find({ memberId })
      .populate('memberId', 'name age')
      .sort({ createdAt: -1 });

    console.log('✅ [BACKEND] Found medications:', medications.length);

    res.json({
      success: true,
      count: medications.length,
      medications
    });
  } catch (error) {
    console.error('❌ Get medications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get active medications for a member
// @route   GET /api/medications/member/:memberId/active
// @access  Private
exports.getActiveMedications = async (req, res) => {
  try {
    const { memberId } = req.params;

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

    const medications = await Medication.find({ 
      memberId,
      isActive: true 
    })
      .populate('memberId', 'name age')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: medications.length,
      medications
    });
  } catch (error) {
    console.error('❌ Get active medications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Get single medication by ID
// @route   GET /api/medications/:id
// @access  Private
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    }).populate('memberId', 'name age');

    if (!medication) {
      return res.status(404).json({ 
        success: false,
        error: 'Medication not found' 
      });
    }

    res.json({
      success: true,
      medication
    });
  } catch (error) {
    console.error('❌ Get medication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private
exports.createMedication = async (req, res) => {
  try {
    const medicationData = req.body;

    console.log('🟡 [BACKEND] Creating medication:', medicationData);

    // Validate required fields
    if (!medicationData.memberId || !medicationData.medicationName || !medicationData.dosage || !medicationData.frequency) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide memberId, medicationName, dosage, and frequency' 
      });
    }

    // Verify member belongs to user
    const member = await Member.findOne({ 
      _id: medicationData.memberId, 
      userId: req.userId 
    });

    if (!member) {
      return res.status(404).json({ 
        success: false,
        error: 'Member not found' 
      });
    }

    const medication = await Medication.create({
      ...medicationData,
      userId: req.userId
    });

    console.log('✅ [BACKEND] Medication created:', medication._id);

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      medication
    });
  } catch (error) {
    console.error('❌ Create medication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error: ' + error.message
    });
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
exports.updateMedication = async (req, res) => {
  try {
    let medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!medication) {
      return res.status(404).json({ 
        success: false,
        error: 'Medication not found' 
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        medication[key] = req.body[key];
      }
    });

    await medication.save();

    res.json({
      success: true,
      message: 'Medication updated successfully',
      medication
    });
  } catch (error) {
    console.error('❌ Update medication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!medication) {
      return res.status(404).json({ 
        success: false,
        error: 'Medication not found' 
      });
    }

    await medication.deleteOne();

    res.json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete medication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Toggle medication active status
// @route   PATCH /api/medications/:id/toggle
// @access  Private
exports.toggleMedicationStatus = async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!medication) {
      return res.status(404).json({ 
        success: false,
        error: 'Medication not found' 
      });
    }

    medication.isActive = !medication.isActive;
    await medication.save();

    res.json({
      success: true,
      message: `Medication ${medication.isActive ? 'activated' : 'deactivated'} successfully`,
      medication
    });
  } catch (error) {
    console.error('❌ Toggle medication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
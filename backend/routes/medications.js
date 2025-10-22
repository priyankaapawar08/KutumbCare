const express = require('express');
const router = express.Router();
const {
  getMedicationsByMember,
  getActiveMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  toggleMedicationStatus
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Medication CRUD
router.route('/')
  .post(createMedication);

router.route('/:id')
  .get(getMedicationById)
  .put(updateMedication)
  .delete(deleteMedication);

// Toggle active status
router.patch('/:id/toggle', toggleMedicationStatus);

// Get medications by member
router.get('/member/:memberId', getMedicationsByMember);

// Get active medications
router.get('/member/:memberId/active', getActiveMedications);

module.exports = router;
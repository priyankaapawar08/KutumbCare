const express = require('express');
const router = express.Router();
const {
  getVitalsByMember,
  getVitalsByType,
  getVitalById,
  createVital,
  updateVital,
  deleteVital,
  getVitalTrends
} = require('../controllers/vitalController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Vital CRUD
router.route('/')
  .post(createVital);

router.route('/:id')
  .get(getVitalById)
  .put(updateVital)
  .delete(deleteVital);

// Get vitals by member
router.get('/member/:memberId', getVitalsByMember);

// Get vitals by type for a member
router.get('/member/:memberId/type/:vitalType', getVitalsByType);

// Get vital trends
router.get('/trends/:memberId/:vitalType', getVitalTrends);

module.exports = router;
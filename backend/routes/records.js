const express = require('express');
const router = express.Router();
const {
  getRecordsByMember,
  getUpcomingAppointments,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Record CRUD
router.route('/')
  .post(createRecord);

router.route('/:id')
  .get(getRecordById)
  .put(updateRecord)
  .delete(deleteRecord);

// Get records by member
router.get('/member/:memberId', getRecordsByMember);

// Get upcoming appointments
router.get('/appointments/upcoming', getUpcomingAppointments);

module.exports = router;
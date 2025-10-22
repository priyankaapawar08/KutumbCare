const express = require('express');
const router = express.Router();
const {
  getFamily,
  createFamily,
  updateFamily
} = require('../controllers/familyController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getFamily)
  .post(createFamily);

router.route('/:id')
  .put(updateFamily);

module.exports = router;
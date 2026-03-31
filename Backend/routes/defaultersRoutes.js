const express = require('express');
const router = express.Router();
const {
  getAllDefaulters,
  checkPropertyStatus,
  getDefaulterStats,
  resolveDefaulter
} = require('../controllers/defaulterController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDefaulterStats);
router.get('/check/:propertyId', protect, checkPropertyStatus);

router.route('/')
  .get(protect, getAllDefaulters);

router.route('/:id/resolve')
  .put(protect, resolveDefaulter);

module.exports = router;

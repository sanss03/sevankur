const express = require('express');
const router = express.Router();
const {
  getTaxRecords,
  createTaxRecord,
  updatePayment,
  detectOverdue,
  getTaxStats
} = require('../controllers/taxRecordController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getTaxStats);
router.post('/detect-overdue', protect, detectOverdue);

router.route('/')
  .get(protect, getTaxRecords)
  .post(protect, createTaxRecord);

router.route('/:id/pay')
  .put(protect, updatePayment);

module.exports = router;

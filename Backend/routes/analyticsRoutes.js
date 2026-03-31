const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getTaxAnalytics,
  getPropertyAnalytics,
  getComplianceReport
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard accessible to all officers
router.get('/dashboard', protect, getDashboardOverview);

// Advanced analytics restricted to admins only
router.get('/tax', protect, authorize('admin'), getTaxAnalytics);
router.get('/property', protect, authorize('admin'), getPropertyAnalytics);
router.get('/compliance', protect, authorize('admin'), getComplianceReport);

module.exports = router;

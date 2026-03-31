const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  searchProperties
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getPropertyStats);

router.route('/')
  .get(protect, getProperties)
  .post(protect, createProperty);

router.get('/search', protect, searchProperties);

router.route('/:id')
  .get(protect, getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;

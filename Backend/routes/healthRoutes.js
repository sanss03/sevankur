const express = require('express');
const router = express.Router();
const { getHealth, getMetrics } = require('../controllers/healthController');

router.get('/health', getHealth);
router.get('/metrics', getMetrics);

module.exports = router;

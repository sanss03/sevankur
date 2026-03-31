const mongoose = require('mongoose');

// @desc    Basic health check
// @route   GET /api/health
const getHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const llmStatus = process.env.GROK_API_KEY ? 'Configured' : 'Missing';
    
    const status = (dbStatus === 'Connected') ? 200 : 503;

    res.status(status).json({
      success: true,
      status: 'OK',
      database: dbStatus,
      llm: llmStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    System metrics
// @route   GET /api/metrics
const getMetrics = async (req, res) => {
  try {
    const uptimeInSeconds = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      metrics: {
        uptime: `${uptimeInSeconds}s`,
        formattedUptime: formatDuration(uptimeInSeconds),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
        },
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to format seconds into hours, mins, secs
 */
const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

module.exports = {
  getHealth,
  getMetrics
};

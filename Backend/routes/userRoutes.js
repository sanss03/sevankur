const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route GET /api/user/profile
 */
router.get('/profile', async (req, res) => {
  try {
    // In a real app, 'req.user.id' would come from auth middleware
    const user = await User.findOne().lean(); // For now, just find any user
    if (!user) return res.status(404).json({ message: "No user found" });
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      status: user.status
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route PUT /api/user/profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findOneAndUpdate({}, { username, email }, { new: true });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route GET /api/user/settings
 */
router.get('/settings', async (req, res) => {
  try {
    const user = await User.findOne().lean();
    res.json(user?.settings || {
      theme: 'light',
      language: 'en',
      notifications: true,
      autoSave: true,
      fontSize: 14
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

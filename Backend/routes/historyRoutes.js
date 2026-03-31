const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

/**
 * @route GET /api/history
 */
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ timestamp: 1 })
      .lean();
    
    // Format to match frontend structure
    const formatted = messages.map(m => ({
      id: m._id,
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp
    }));
    
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route POST /api/history/save
 */
router.post('/save', async (req, res) => {
  try {
    const { sender, text } = req.body;
    const newMessage = await Message.create({ sender, text });
    
    res.status(201).json({
      id: newMessage._id,
      sender: newMessage.sender,
      text: newMessage.text,
      timestamp: newMessage.timestamp
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route DELETE /api/history/:messageId
 */
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndDelete(messageId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route DELETE /api/history/clear
 */
router.delete('/clear', async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    res.json({ success: true, count: result.deletedCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * @route GET /api/history/export
 */
router.get('/export', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).lean();
    res.json({
      exportDate: new Date(),
      totalMessages: messages.length,
      messages: messages.map(m => ({
        id: m._id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

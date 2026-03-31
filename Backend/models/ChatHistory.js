const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for fast lookup
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  metadata: {
    intent: String,
    confidence: Number,
    tokens: Number,
    model: { type: String, default: 'grok-1' }
  }
}, { timestamps: true });

// Text index for search functionality
chatHistorySchema.index({ message: 'text' });

// Add pagination plugin
chatHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);

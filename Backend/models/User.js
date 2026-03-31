const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'officer'], default: 'officer' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  settings: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true },
    fontSize: { type: Number, default: 14 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const taxRecordSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  taxYear: { type: String, required: true },
  taxAmount: { type: Number, required: true },
  taxRate: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue', 'waived'],
    default: 'pending' 
  },
  isDefaulter: { type: Boolean, default: false },
  remainingAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TaxRecord', taxRecordSchema);

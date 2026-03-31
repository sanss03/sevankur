const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  propertyId: { type: String, required: true, unique: true },
  taxId: { type: String, required: true, unique: true },
  propertyType: { 
    type: String, 
    enum: ['residential', 'commercial', 'industrial', 'land'],
    required: true 
  },
  value: { type: Number, required: true },
  ward: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'disputed'],
    default: 'active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);

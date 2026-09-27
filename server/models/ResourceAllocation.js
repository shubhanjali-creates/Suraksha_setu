const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  AllocationID: { type: Number, required: true, unique: true },
  ResourceID: { type: Number, required: true },
  IncidentID: { type: Number, required: true },
  Quantity: { type: Number, required: true, min: 1 },
  AllocatedBy: { type: Number, required: true },
  AllocatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('ResourceAllocation', schema);

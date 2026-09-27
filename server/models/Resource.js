const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  ResourceID: { type: Number, required: true, unique: true },
  Name: { type: String, required: true, trim: true },
  Quantity: { type: Number, required: true, min: 0 },
  QuantityType: { type: String, required: true },
  LocationID: Number,
  Status: { type: String, enum: ['available','unavailable'], default: 'available' },
  UpdatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Resource', schema);

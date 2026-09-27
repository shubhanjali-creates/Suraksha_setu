const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  NotificationID: { type: Number, required: true, unique: true },
  UserID: { type: Number, required: true },
  Title: { type: String, required: true },
  Message: { type: String, required: true },
  Type: { type: String, enum: ['incident','task','announcement','sos','system'], default: 'system' },
  Read: { type: Boolean, default: false },
  CreatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', schema);

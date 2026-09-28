const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  AuditID: { type: Number, required: true, unique: true },
  UserID: { type: Number, required: true },
  Action: { type: String, required: true, trim: true },
  EntityType: { type: String, required: true, trim: true },
  EntityID: { type: Number },
  Details: { type: String, default: '' },
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  Email: { type: String, required: true, lowercase: true, trim: true, index: true },
  OTPHash: { type: String, required: true },
  RegistrationData: { type: mongoose.Schema.Types.Mixed, required: true },
  Attempts: { type: Number, default: 0 },
  LastSentAt: { type: Date, default: Date.now },
  ExpiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

schema.index({ ExpiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ Email: 1 }, { unique: true });

module.exports = mongoose.model('OTPVerification', schema);

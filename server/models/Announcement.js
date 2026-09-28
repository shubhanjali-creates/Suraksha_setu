const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    AnnouncementID: { type: Number, required: true, unique: true },
    Title: { type: String, default: 'Emergency Announcement', trim: true },
    Content: {
        type: String,
        required: true
    },
    CreatedBy: {
        type: Number,
        required: true
    },
    CreationDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    CommunityID: { type: Number, required: false },
    TargetType: { type: String, enum: ['global', 'community'], default: 'global' },
    ExpiresAt: { type: Date },
    IsActive: { type: Boolean, default: true },
    Urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
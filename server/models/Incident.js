const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  event: {
    type: String,
    enum: ['Reported', 'Verified', 'Rejected', 'Team assigned', 'Response started', 'Resolved'],
    required: true
  },
  at: { type: Date, default: Date.now },
  by: { type: Number },
  note: { type: String, default: '' }
}, { _id: false });

const responseNoteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  by: { type: Number, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const incidentSchema = new mongoose.Schema({
  IncidentID: { type: Number, required: true, unique: true },

  IsSOS: { type: Boolean, default: false },

  SOSID: { type: String, default: '' },
  Volunteers: { type: [Number], default: [] },
  Responders: { type: [Number], default: [] },
  AffectedIndividual: { type: [Number], default: [] },
  ApproximateaffectedCount: { type: Number, default: 0, min: 0 },
  LocationID: { type: Number, required: true },
  IncidentType: {
    type: String,
    enum: ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Drought', 'Heatwave', 'Accident', 'Medical Emergency', 'Others'],
    required: true
  },
  Description: { type: String, required: true, trim: true },
  CommunityID: { type: Number },
  ReportedBy: { type: Number },
  DateReported: { type: Date, default: Date.now },
  Priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium', required: true },
  Urgency: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  Status: {
    type: String,
    enum: ['Reported', 'Verified', 'Responding', 'Resolved', 'Rejected', 'Running', 'Expired'],
    default: 'Reported',
    required: true
  },
  Timeline: { type: [timelineEntrySchema], default: [] },
  ResponseNotes: { type: [responseNoteSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now },
  RejectionReason: { type: String, default: '' },
  State: String,
  District: String,
  Tehsil: String,
  Village: String,
  Latitude: Number,
  Longitude: Number,
  IncidentLocation: String
});

module.exports = mongoose.model('Incident', incidentSchema);

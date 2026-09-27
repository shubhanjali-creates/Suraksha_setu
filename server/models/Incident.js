const mongoose = require('mongoose');
const incidentSchema = new mongoose.Schema({
  IncidentID: { type: Number, required: true, unique: true },
  Volunteers: { type: [Number], default: [] },
  AffectedIndividual: { type: [Number], default: [] },
  ApproximateaffectedCount: { type: Number, default: 0, min: 0 },
  LocationID: { type: Number, required: true },
  IncidentType: { type: String, enum: ['Flood','Earthquake','Fire','Cyclone','Landslide','Drought','Heatwave','Accident','Medical Emergency','Others'], required: true },
  Description: { type: String, required: true, trim: true },
  CommunityID: { type: Number },
  ReportedBy: { type: Number },
  DateReported: { type: Date, default: Date.now },
  Urgency: { type: String, enum: ['High','Medium','Low'], required: true },
  Status: { type: String, enum: ['Reported','Verified','Responding','Resolved','Running','Expired'], default: 'Reported', required: true },
  State: String,
  District: String,
  Tehsil: String,
  Village: String,
  Latitude: Number,
  Longitude: Number,
  IncidentLocation: String
});
module.exports = mongoose.model('Incident', incidentSchema);

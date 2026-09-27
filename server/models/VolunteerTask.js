const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  TaskID: { type: Number, required: true, unique: true },
  Description: { type: String, required: true },
  AssignedTo: { type: Number, required: true },
  IncidentID: { type: Number, required: true },
  Status: { type: String, enum: ['Assigned','Running','Completed'], default: 'Assigned' },
  AssignedDate: { type: Date, default: Date.now },
  DateCompleted: Date
});
module.exports = mongoose.model('VolunteerTask', schema);

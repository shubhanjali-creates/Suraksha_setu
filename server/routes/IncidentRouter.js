const express = require('express');

const router = express.Router();

const {
  getAllIncidents,
  createIncident,
  createSOSIncident,
  updateIncident,
  verifyIncident,
  rejectIncident,
  assignIncidentTeam,
  advanceIncidentStatus,
  addResponseNote
} = require('../controllers/Incident');

const auth = require('../middleware/auth');

const role = require('../middleware/role');


// Get all incidents
router.get('/', getAllIncidents);


// Create normal incident
router.post('/create', auth, createIncident);


// Create SOS incident
router.post('/sos', auth, createSOSIncident);


// Update incident
router.put('/:IncidentID', auth, updateIncident);


// Verify incident
router.post(
  '/:IncidentID/verify',
  auth,
  role('admin', 'responder'),
  verifyIncident
);


// Reject incident
router.post(
  '/:IncidentID/reject',
  auth,
  role('admin', 'responder'),
  rejectIncident
);


// Assign response team
router.post(
  '/:IncidentID/assign',
  auth,
  role('admin', 'responder'),
  assignIncidentTeam
);


// Advance incident status
router.patch(
  '/:IncidentID/status',
  auth,
  role('admin', 'responder'),
  advanceIncidentStatus
);


// Add response note
router.post(
  '/:IncidentID/notes',
  auth,
  addResponseNote
);


module.exports = router;
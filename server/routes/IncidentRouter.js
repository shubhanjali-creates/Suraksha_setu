const express = require('express');
const router = express.Router();
const {
  getAllIncidents,
  createIncident,
  updateIncident,
  verifyIncident,
  rejectIncident,
  assignIncidentTeam,
  advanceIncidentStatus,
  addResponseNote
} = require('../controllers/Incident');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', getAllIncidents);
router.post('/create', auth, createIncident);
router.put('/:IncidentID', auth, updateIncident);
router.post('/:IncidentID/verify', auth, role('admin', 'responder'), verifyIncident);
router.post('/:IncidentID/reject', auth, role('admin', 'responder'), rejectIncident);
router.post('/:IncidentID/assign', auth, role('admin', 'responder'), assignIncidentTeam);
router.patch('/:IncidentID/status', auth, role('admin', 'responder'), advanceIncidentStatus);
router.post('/:IncidentID/notes', auth, addResponseNote);

module.exports = router;

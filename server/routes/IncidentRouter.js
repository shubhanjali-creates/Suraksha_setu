const express = require('express');
const router = express.Router();
const { getAllIncidents, createIncident, updateIncident } = require('../controllers/Incident');
const auth = require('../middleware/auth');
router.get('/', getAllIncidents);
router.post('/create', auth, createIncident);
router.put('/:IncidentID', auth, updateIncident);
module.exports = router;

const Incident = require('../models/Incident');
const Location = require('../models/Location');
const HelpCenter = require('../models/HelpCenter');
const User = require('../models/User');

const {
  urgencyFromPriority,
  initialTimeline,
  appendTimeline,
  notifyUsers,
  enrichIncidents
} = require('../utils/incidentHelpers');

function isOpsUser(user) {
  const types = Array.isArray(user?.UserType) ? user.UserType : [];
  return types.includes('admin') || types.includes('responder');
}

function canRespondOnIncident(user, incident) {
  if (isOpsUser(user)) return true;

  const uid = user.UserID;

  return (
    (incident.Volunteers || []).includes(uid) ||
    (incident.Responders || []).includes(uid)
  );
}

async function nextIncidentId() {
  const last = await Incident.findOne()
    .sort({ IncidentID: -1 })
    .select('IncidentID')
    .lean();

  return last ? last.IncidentID + 1 : 1;
}

const createIncident = async (req, res) => {
  try {
    const {
      LocationID,
      IncidentType,
      Description,
      CommunityID,
      DateReported,
      Urgency,
      Priority,
      Status = 'Reported',
      ApproximateaffectedCount = 0,
      Latitude,
      Longitude,
      State,
      District,
      Tehsil,
      Village,
      IncidentLocation
    } = req.body;

    const resolvedPriority =
      Priority ||
      (Urgency === 'High'
        ? 'High'
        : Urgency === 'Low'
          ? 'Low'
          : 'Medium');

    const resolvedUrgency =
      Urgency || urgencyFromPriority(resolvedPriority);

    if (
      !LocationID ||
      !IncidentType ||
      !Description ||
      (!Urgency && !Priority)
    ) {
      return res.status(400).json({
        error:
          'LocationID, IncidentType, Description and Priority (or Urgency) are required.'
      });
    }

    const IncidentID = await nextIncidentId();
    const now = new Date();

    const newIncident = await Incident.create({
      IncidentID,
      LocationID: Number(LocationID),
      IncidentType,
      Description,
      CommunityID:
        CommunityID !== undefined ? Number(CommunityID) : undefined,
      ReportedBy: req.user.UserID,
      DateReported: DateReported || now,
      Priority: resolvedPriority,
      Urgency: resolvedUrgency,
      Status:
        Status === 'Running' || Status === 'Expired'
          ? 'Reported'
          : Status,
      ApproximateaffectedCount:
        Number(ApproximateaffectedCount) || 0,
      Latitude: Number(Latitude),
      Longitude: Number(Longitude),
      State,
      District,
      Tehsil,
      Village,
      IncidentLocation,
      Timeline: initialTimeline(req.user.UserID),
      lastUpdated: now
    });

    await Location.updateOne(
      { LocationID: Number(LocationID) },
      { $addToSet: { IncidentID } }
    );

    res.status(201).json({ newIncident });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// CREATE SOS INCIDENT
// =====================================================

const createSOSIncident = async (req, res) => {
  try {
    const {
      Latitude,
      Longitude
    } = req.body;

    if (
      Latitude === undefined ||
      Longitude === undefined
    ) {
      return res.status(400).json({
        error: 'GPS coordinates are required for SOS.'
      });
    }

    const latitude = Number(Latitude);
    const longitude = Number(Longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        error: 'Invalid GPS coordinates.'
      });
    }

    let location = await Location.findOne({
      Latitude: {
        $gte: latitude - 0.001,
        $lte: latitude + 0.001
      },
      Longitude: {
        $gte: longitude - 0.001,
        $lte: longitude + 0.001
      }
    });

    if (!location) {
      const lastLocation = await Location
        .findOne()
        .sort({ LocationID: -1 })
        .select('LocationID')
        .lean();

      const LocationID = lastLocation
        ? lastLocation.LocationID + 1
        : 1;

      location = await Location.create({
        LocationID,
        IncidentID: [],
        Latitude: latitude,
        Longitude: longitude,
        Address: `SOS Location (${latitude}, ${longitude})`
      });
    }

    // =================================================
    // FIND NEAREST HELP CENTER
    // =================================================

    const helpCenters = await HelpCenter.find().lean();

    let nearestCenter = null;
    let nearestDistance = Infinity;

    for (const center of helpCenters) {
      const centerLocation = await Location.findOne({
        LocationID: center.LocationID
      }).lean();

      if (!centerLocation) continue;

      const latDiff =
        centerLocation.Latitude - latitude;

      const lonDiff =
        centerLocation.Longitude - longitude;

      const distance = Math.sqrt(
        (latDiff * latDiff) +
        (lonDiff * lonDiff)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;

        nearestCenter = {
          ...center,
          Latitude: centerLocation.Latitude,
          Longitude: centerLocation.Longitude,
          Address: centerLocation.Address
        };
      }
    }

    const IncidentID = await nextIncidentId();

    const SOSID = `SOS-${Date.now()}-${IncidentID}`;

    const now = new Date();

    const newIncident = await Incident.create({
      IncidentID,
      IsSOS: true,
      SOSID,
      LocationID: location.LocationID,
      IncidentType: 'Medical Emergency',
      Description:
        'Emergency SOS triggered by user. Immediate assistance requested.',
      ReportedBy: req.user.UserID,
      DateReported: now,
      Priority: 'Critical',
      Urgency: 'High',
      Status: 'Reported',
      ApproximateaffectedCount: 1,
      Latitude: latitude,
      Longitude: longitude,
      IncidentLocation: location.Address,
      Timeline: initialTimeline(req.user.UserID),
      lastUpdated: now
    });

    await Location.updateOne(
      {
        LocationID: location.LocationID
      },
      {
        $addToSet: {
          IncidentID
        }
      }
    );

    // =================================================
    // NOTIFY AVAILABLE RESPONDERS
    // =================================================

    const availableResponders = await User.find({
      Available: true,
      UserType: 'responder'
    })
      .select('UserID')
      .lean();

    const responderIds = availableResponders.map(
      user => user.UserID
    );

    if (responderIds.length) {
      await notifyUsers(
        responderIds,
        'Emergency SOS Alert',
        `A critical SOS has been triggered. Incident #${IncidentID} requires immediate response.`
      );
    }

    res.status(201).json({
      message: 'SOS sent successfully.',
      incident: newIncident,
      SOSID,
      LocationID: location.LocationID,
      nearestCenter: nearestCenter
        ? {
            CenterID: nearestCenter.CenterID,
            Name: nearestCenter.Name,
            Role: nearestCenter.Role,
            Phone: nearestCenter.Phone,
            Latitude: nearestCenter.Latitude,
            Longitude: nearestCenter.Longitude,
            Address: nearestCenter.Address
          }
        : null
    });

  } catch (e) {
    console.error('SOS creation error:', e);

    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// GET ALL INCIDENTS
// =====================================================

const getAllIncidents = async (req, res) => {
  try {
    const [incidents, locations] = await Promise.all([
      Incident.find({})
        .sort({ DateReported: -1 })
        .lean(),

      Location.find({})
        .lean()
    ]);

    const locationMap = locations.reduce(
      (m, l) => {
        m[l.LocationID] = l;
        return m;
      },
      {}
    );

    const enriched =
      await enrichIncidents(incidents);

    res.json({
      incidents: enriched.map(
        i => ({
          ...i,
          Location:
            locationMap[i.LocationID] || null
        })
      )
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// UPDATE INCIDENT
// =====================================================

const updateIncident = async (req, res) => {
  try {
    if (!isOpsUser(req.user)) {
      return res.status(403).json({
        error:
          'Only administrators or responders can update incident details.'
      });
    }

    const IncidentID =
      Number(req.params.IncidentID);

    if (!Number.isInteger(IncidentID)) {
      return res.status(400).json({
        error: 'Invalid IncidentID.'
      });
    }

    const allowed = [
      'AffectedIndividual',
      'ApproximateaffectedCount',
      'LocationID',
      'IncidentType',
      'Description',
      'CommunityID',
      'Priority',
      'State',
      'District',
      'Tehsil',
      'Village',
      'IncidentLocation',
      'Latitude',
      'Longitude'
    ];

    const updates = {
      lastUpdated: new Date()
    };

    allowed.forEach(k => {
      if (req.body[k] !== undefined) {
        updates[k] = req.body[k];
      }
    });

    if (req.body.Priority !== undefined) {
      updates.Urgency =
        urgencyFromPriority(req.body.Priority);
    }

    const updatedIncident =
      await Incident.findOneAndUpdate(
        { IncidentID },
        updates,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedIncident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    res.json({
      updatedIncident
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// VERIFY INCIDENT
// =====================================================

const verifyIncident = async (req, res) => {
  try {
    if (!isOpsUser(req.user)) {
      return res.status(403).json({
        error:
          'Only administrators or responders can verify incidents.'
      });
    }

    const IncidentID =
      Number(req.params.IncidentID);

    const incident =
      await Incident.findOne({
        IncidentID
      });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    if (
      !['Reported', 'Running']
        .includes(incident.Status)
    ) {
      return res.status(400).json({
        error:
          'Only reported incidents can be verified.'
      });
    }

    incident.Status = 'Verified';

    incident.Timeline =
      appendTimeline(
        incident,
        'Verified',
        req.user.UserID,
        req.body.note ||
          'Incident validated by operations'
      );

    incident.lastUpdated =
      new Date();

    await incident.save();

    res.json({
      incident
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// REJECT INCIDENT
// =====================================================

const rejectIncident = async (req, res) => {
  try {
    if (!isOpsUser(req.user)) {
      return res.status(403).json({
        error:
          'Only administrators or responders can reject incidents.'
      });
    }

    const IncidentID =
      Number(req.params.IncidentID);

    const reason =
      String(
        req.body.reason || ''
      ).trim() ||
      'Incident could not be verified';

    const incident =
      await Incident.findOne({
        IncidentID
      });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    if (
      !['Reported', 'Running']
        .includes(incident.Status)
    ) {
      return res.status(400).json({
        error:
          'Only reported incidents can be rejected.'
      });
    }

    incident.Status = 'Rejected';

    incident.RejectionReason =
      reason;

    incident.Timeline =
      appendTimeline(
        incident,
        'Rejected',
        req.user.UserID,
        reason
      );

    incident.lastUpdated =
      new Date();

    await incident.save();

    res.json({
      incident
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// ASSIGN INCIDENT TEAM
// =====================================================

const assignIncidentTeam = async (req, res) => {
  try {
    if (!isOpsUser(req.user)) {
      return res.status(403).json({
        error:
          'Only administrators or responders can assign teams.'
      });
    }

    const IncidentID =
      Number(req.params.IncidentID);

    const volunteerIds =
      (
        req.body.volunteerIds ||
        req.body.Volunteers ||
        []
      )
        .map(Number)
        .filter(Number.isInteger);

    const responderIds =
      (
        req.body.responderIds ||
        req.body.Responders ||
        []
      )
        .map(Number)
        .filter(Number.isInteger);

    const incident =
      await Incident.findOne({
        IncidentID
      });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    if (
      [
        'Resolved',
        'Rejected',
        'Expired'
      ].includes(incident.Status)
    ) {
      return res.status(400).json({
        error:
          'Cannot assign team to a closed incident.'
      });
    }

    const prevVolunteers =
      new Set(
        incident.Volunteers || []
      );

    const prevResponders =
      new Set(
        incident.Responders || []
      );

    incident.Volunteers = [
      ...new Set([
        ...(incident.Volunteers || []),
        ...volunteerIds
      ])
    ];

    incident.Responders = [
      ...new Set([
        ...(incident.Responders || []),
        ...responderIds
      ])
    ];

    const newlyAssigned = [
      ...volunteerIds.filter(
        id => !prevVolunteers.has(id)
      ),
      ...responderIds.filter(
        id => !prevResponders.has(id)
      )
    ];

    if (newlyAssigned.length) {
      incident.Timeline =
        appendTimeline(
          incident,
          'Team assigned',
          req.user.UserID,
          `Assigned ${newlyAssigned.length} responder/volunteer(s) to incident #${IncidentID}`
        );

      await notifyUsers(
        newlyAssigned,
        'Incident assignment',
        `You have been assigned to ${incident.IncidentType} incident #${IncidentID} (${incident.Priority || incident.Urgency} priority).`
      );
    }

    if (
      incident.Status === 'Verified' &&
      (
        incident.Volunteers.length ||
        incident.Responders.length
      )
    ) {
      // keep verified until response explicitly starts
    }

    incident.lastUpdated =
      new Date();

    await incident.save();

    const [enriched] =
      await enrichIncidents([
        incident.toObject()
      ]);

    res.json({
      incident: enriched
    });

  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// ADVANCE INCIDENT STATUS
// =====================================================

const advanceIncidentStatus = async (req, res) => {
  try {
    if (!isOpsUser(req.user)) {
      return res.status(403).json({
        error:
          'Only administrators or responders can advance workflow status.'
      });
    }

    const IncidentID =
      Number(req.params.IncidentID);

    const { status } =
      req.body;

    const incident =
      await Incident.findOne({
        IncidentID
      });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    const isSOS =
      incident.IsSOS === true;

    // =================================================
    // SOS STATUS WORKFLOW
    // =================================================

    if (isSOS) {

      if (status === 'Responding') {

        if (
          !['Reported', 'Verified', 'Running']
            .includes(incident.Status)
        ) {
          return res.status(400).json({
            error:
              'SOS must be in a valid active state before response starts.'
          });
        }

        incident.Status =
          'Responding';

        incident.Timeline =
          appendTimeline(
            incident,
            'Response started',
            req.user.UserID,
            'Emergency SOS response started'
          );

      } else if (status === 'Resolved') {

        if (
          !['Responding', 'Running']
            .includes(incident.Status)
        ) {
          return res.status(400).json({
            error:
              'SOS must be responding before it can be resolved.'
          });
        }

        incident.Status =
          'Resolved';

        incident.Timeline =
          appendTimeline(
            incident,
            'Resolved',
            req.user.UserID,
            req.body.note ||
              'SOS emergency resolved'
          );

      } else {

        return res.status(400).json({
          error:
            'SOS status must be Responding or Resolved.'
        });
      }

    }

    // =================================================
    // NORMAL INCIDENT STATUS WORKFLOW
    // =================================================

    else {

      if (status === 'Responding') {

        if (
          !['Verified', 'Running']
            .includes(incident.Status)
        ) {
          return res.status(400).json({
            error:
              'Incident must be verified before response can start.'
          });
        }

        incident.Status =
          'Responding';

        incident.Timeline =
          appendTimeline(
            incident,
            'Response started',
            req.user.UserID,
            'Field response in progress'
          );

      } else if (status === 'Resolved') {

        if (
          !['Responding', 'Running']
            .includes(incident.Status)
        ) {
          return res.status(400).json({
            error:
              'Incident must be in responding status before it can be resolved.'
          });
        }

        incident.Status =
          'Resolved';

        incident.Timeline =
          appendTimeline(
            incident,
            'Resolved',
            req.user.UserID,
            req.body.note ||
              'Incident marked resolved'
          );

      } else {

        return res.status(400).json({
          error:
            'Status must be Responding or Resolved.'
        });
      }
    }

    incident.lastUpdated =
      new Date();

    await incident.save();

    res.json({
      incident
    });

  } catch (e) {

    res.status(500).json({
      error: e.message
    });
  }
};


// =====================================================
// ADD RESPONSE NOTE
// =====================================================

const addResponseNote = async (req, res) => {
  try {
    const IncidentID =
      Number(req.params.IncidentID);

    const text =
      String(
        req.body.text || ''
      ).trim();

    if (!text) {
      return res.status(400).json({
        error: 'Note text is required.'
      });
    }

    const incident =
      await Incident.findOne({
        IncidentID
      });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found.'
      });
    }

    if (
      !canRespondOnIncident(
        req.user,
        incident
      )
    ) {
      return res.status(403).json({
        error:
          'You are not assigned to this incident.'
      });
    }

    incident.ResponseNotes = [
      ...(incident.ResponseNotes || []),
      {
        text,
        by: req.user.UserID,
        at: new Date()
      }
    ];

    incident.lastUpdated =
      new Date();

    await incident.save();

    res.json({
      incident
    });

  } catch (e) {

    res.status(500).json({
      error: e.message
    });
  }
};


module.exports = {
  getAllIncidents,
  createIncident,
  createSOSIncident,
  updateIncident,
  verifyIncident,
  rejectIncident,
  assignIncidentTeam,
  advanceIncidentStatus,
  addResponseNote
};
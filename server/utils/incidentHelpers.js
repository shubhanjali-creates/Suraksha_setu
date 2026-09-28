const User = require('../models/User');
const Notification = require('../models/Notification');

const WORKFLOW_STEPS = ['Reported', 'Verified', 'Team assigned', 'Response started', 'Resolved'];

async function nextNotificationId() {
  const last = await Notification.findOne().sort({ NotificationID: -1 }).select('NotificationID').lean();
  return last ? last.NotificationID + 1 : 1;
}

function urgencyFromPriority(priority) {
  if (priority === 'Critical' || priority === 'High') return 'High';
  if (priority === 'Low') return 'Low';
  return 'Medium';
}

function initialTimeline(reportedBy) {
  return [{ event: 'Reported', at: new Date(), by: reportedBy || null, note: 'Incident submitted to operations centre' }];
}

function appendTimeline(incident, event, by, note) {
  const timeline = incident.Timeline || [];
  const duplicate = ['Verified', 'Team assigned', 'Response started', 'Resolved'].includes(event)
    && timeline.some(t => t.event === event);
  if (duplicate) return timeline;
  return [...timeline, { event, at: new Date(), by: by || null, note: note || '' }];
}

async function notifyUsers(userIds, title, message) {
  const unique = [...new Set(userIds.map(Number).filter(Number.isInteger))];
  if (!unique.length) return;
  let nid = await nextNotificationId();
  const docs = unique.map((UserID, i) => ({
    NotificationID: nid + i,
    UserID,
    Title: title,
    Message: message,
    Type: 'incident',
    Read: false,
    CreatedAt: new Date()
  }));
  await Notification.insertMany(docs);
}

async function enrichIncidents(incidents) {
  if (!incidents.length) return incidents;
  const idSet = new Set();
  incidents.forEach(i => {
    (i.Volunteers || []).forEach(id => idSet.add(id));
    (i.Responders || []).forEach(id => idSet.add(id));
  });
  const users = idSet.size
    ? await User.find({ UserID: { $in: [...idSet] } }).select('UserID Name Email UserType').lean()
    : [];
  const userMap = users.reduce((m, u) => { m[u.UserID] = u; return m; }, {});
  return incidents.map(i => ({
    ...i,
    AssignedVolunteers: (i.Volunteers || []).map(id => userMap[id] || { UserID: id, Name: `User #${id}` }),
    AssignedResponders: (i.Responders || []).map(id => userMap[id] || { UserID: id, Name: `User #${id}` })
  }));
}

module.exports = {
  WORKFLOW_STEPS,
  urgencyFromPriority,
  initialTimeline,
  appendTimeline,
  notifyUsers,
  enrichIncidents
};

import React, { useState } from 'react';

const STEPS = ['Reported', 'Verified', 'Team assigned', 'Response started', 'Resolved'];

function stepIndex(incident) {
  const timeline = incident.Timeline || [];
  const events = new Set(timeline.map(t => t.event));
  if (incident.Status === 'Rejected') return -1;
  if (incident.Status === 'Resolved' || events.has('Resolved')) return 4;
  if (incident.Status === 'Responding' || events.has('Response started')) return 3;
  if (events.has('Team assigned') || (incident.Volunteers?.length || incident.Responders?.length)) return 2;
  if (incident.Status === 'Verified' || events.has('Verified')) return 1;
  return 0;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function priorityClass(p) {
  return `priority-badge priority-${(p || 'medium').toLowerCase()}`;
}

export default function IncidentWorkflow({ incident, canManage, onAction, users = [] }) {
  const [assignVolunteers, setAssignVolunteers] = useState('');
  const [assignResponders, setAssignResponders] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [note, setNote] = useState('');
  const current = stepIndex(incident);
  const volunteers = users.filter(u => (u.UserType || []).includes('volunteer'));
  const responders = users.filter(u => (u.UserType || []).includes('responder') || (u.UserType || []).includes('admin'));

  const submitAssign = e => {
    e.preventDefault();
    const volunteerIds = assignVolunteers.split(',').map(s => Number(s.trim())).filter(Number.isInteger);
    const responderIds = assignResponders.split(',').map(s => Number(s.trim())).filter(Number.isInteger);
    onAction('assign', { volunteerIds, responderIds });
    setAssignVolunteers('');
    setAssignResponders('');
  };

  return (
    <div className="incident-workflow">
      <div className="workflow-header">
        <div>
          <strong>#{incident.IncidentID}</strong> {incident.IncidentType}
          <span className={priorityClass(incident.Priority || incident.Urgency)}>
            {incident.Priority || incident.Urgency}
          </span>
        </div>
        <div className="workflow-meta">
          <span>Status: <b>{incident.Status}</b></span>
          <span>Updated: {formatDate(incident.lastUpdated)}</span>
        </div>
      </div>

      {incident.Status === 'Rejected' ? (
        <p className="workflow-rejected">Rejected: {incident.RejectionReason || 'Not verified'}</p>
      ) : (
        <ol className="workflow-steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i <= current ? 'done' : i === current + 1 ? 'next' : ''}>
              <span className="dot" />
              {label}
            </li>
          ))}
        </ol>
      )}

      <div className="workflow-team">
        <div>
          <h4>Assigned responders</h4>
          {(incident.AssignedResponders?.length || incident.Responders?.length) ? (
            <ul>{(incident.AssignedResponders || incident.Responders.map(id => ({ UserID: id, Name: `#${id}` }))).map(r => (
              <li key={r.UserID}>{r.Name} (#{r.UserID})</li>
            ))}</ul>
          ) : <p className="muted">None</p>}
        </div>
        <div>
          <h4>Assigned volunteers</h4>
          {(incident.AssignedVolunteers?.length || incident.Volunteers?.length) ? (
            <ul>{(incident.AssignedVolunteers || incident.Volunteers.map(id => ({ UserID: id, Name: `#${id}` }))).map(v => (
              <li key={v.UserID}>{v.Name} (#{v.UserID})</li>
            ))}</ul>
          ) : <p className="muted">None</p>}
        </div>
      </div>

      <div className="workflow-timeline">
        <h4>Timeline</h4>
        <ul>
          {(incident.Timeline || []).length ? (incident.Timeline || []).map((t, i) => (
            <li key={i}>
              <b>{t.event}</b> — {formatDate(t.at)}
              {t.note ? <span className="timeline-note"> · {t.note}</span> : null}
            </li>
          )) : <li>Reported — {formatDate(incident.DateReported)}</li>}
        </ul>
      </div>

      {(incident.ResponseNotes || []).length > 0 && (
        <div className="workflow-notes-read">
          <h4>Response notes</h4>
          <ul>
            {incident.ResponseNotes.map((n, i) => (
              <li key={i}><b>User #{n.by}</b> · {formatDate(n.at)}<p>{n.text}</p></li>
            ))}
          </ul>
        </div>
      )}

      {canManage && (
        <div className="workflow-actions">
          {['Reported', 'Running'].includes(incident.Status) && (
            <>
              <button type="button" className="btn-verify" onClick={() => onAction('verify')}>Verify</button>
              <div className="reject-row">
                <input placeholder="Rejection reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button type="button" className="btn-reject" onClick={() => onAction('reject', { reason: rejectReason })}>Reject</button>
              </div>
            </>
          )}
          {incident.Status === 'Verified' && (
            <button type="button" onClick={() => onAction('status', { status: 'Responding' })}>Start response</button>
          )}
          {incident.Status === 'Responding' && (
            <button type="button" onClick={() => onAction('status', { status: 'Resolved' })}>Mark resolved</button>
          )}
          {!['Resolved', 'Rejected', 'Expired'].includes(incident.Status) && (
            <form className="assign-form" onSubmit={submitAssign}>
              <h4>Assign team</h4>
              <input placeholder="Volunteer user IDs (comma-separated)" value={assignVolunteers} onChange={e => setAssignVolunteers(e.target.value)} list={`vol-list-${incident.IncidentID}`} />
              <input placeholder="Responder user IDs (comma-separated)" value={assignResponders} onChange={e => setAssignResponders(e.target.value)} list={`resp-list-${incident.IncidentID}`} />
              <datalist id={`vol-list-${incident.IncidentID}`}>{volunteers.map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}</datalist>
              <datalist id={`resp-list-${incident.IncidentID}`}>{responders.map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}</datalist>
              <button type="submit">Assign & notify</button>
            </form>
          )}
        </div>
      )}

      <form className="note-form" onSubmit={e => { e.preventDefault(); if (!note.trim()) return; onAction('note', { text: note }); setNote(''); }}>
        <textarea placeholder="Add a field response note..." value={note} onChange={e => setNote(e.target.value)} rows={2} />
        <button type="submit">Add note</button>
      </form>
    </div>
  );
}

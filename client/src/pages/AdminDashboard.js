import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import '../assets/CSS/AdminDashboard.css';
import '../assets/CSS/OperationsDashboard.css';
import IncidentWorkflow from '../components/IncidentWorkflow';

const api = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const r = await fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed.');
  return d;
};

export default function AdminDashboard() {
  const isAdmin = useSelector(state => state.roleState.isAdmin);
  const loggedIn = useSelector(state => state.roleState.loggedIn);
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [active, setActive] = useState('overview');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState({ Content: '', Urgency: 'medium', CommunityID: '' });
  const [task, setTask] = useState({ Description: '', AssignedTo: '', IncidentID: '' });
  const [allocation, setAllocation] = useState({ ResourceID: '', IncidentID: '', Quantity: '' });
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const [s, d] = await Promise.all([api('/api/admin'), api('/api/dashboard')]);
      setSummary(s); setDashboard(d);
    } catch (e) { setError(e.message); }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  if (!loggedIn) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <div className="admin-page"><div className="admin-card"><h2>Admin access required</h2><p>Your account does not have administrator permissions.</p></div></div>;

  const incidentAction = async (incident, action, payload = {}) => {
    try {
      const id = incident.IncidentID;
      if (action === 'verify') await api(`/incident/${id}/verify`, { method: 'POST', body: JSON.stringify(payload) });
      else if (action === 'reject') await api(`/incident/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) });
      else if (action === 'assign') await api(`/incident/${id}/assign`, { method: 'POST', body: JSON.stringify(payload) });
      else if (action === 'status') await api(`/incident/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) });
      else if (action === 'note') await api(`/incident/${id}/notes`, { method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch (e) { setError(e.message); }
  };

  const publish = async e => {
    e.preventDefault();
    try { await api('/api/announcements', { method: 'POST', body: JSON.stringify(announcement) }); setAnnouncement({ Content: '', Urgency: 'medium', CommunityID: '' }); await load(); alert('Announcement published.'); }
    catch (e) { setError(e.message); }
  };

  const assignTask = async e => {
    e.preventDefault();
    try { await api('/api/tasks', { method: 'POST', body: JSON.stringify(task) }); setTask({ Description: '', AssignedTo: '', IncidentID: '' }); await load(); alert('Volunteer task assigned.'); }
    catch (e) { setError(e.message); }
  };

  const allocateResource = async e => {
    e.preventDefault();
    try { await api(`/api/resources/${allocation.ResourceID}/allocate`, { method: 'POST', body: JSON.stringify({ IncidentID: Number(allocation.IncidentID), Quantity: Number(allocation.Quantity) }) }); setAllocation({ ResourceID: '', IncidentID: '', Quantity: '' }); await load(); alert('Resource allocated.'); }
    catch (e) { setError(e.message); }
  };

  const stats = dashboard?.stats || {};
  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand"><strong>🛡 Suraksha Setu</strong><span>Admin Control Centre</span></div>
        {['overview','incidents','announcements','volunteers','resources','users','communities'].map(item => (
          <button key={item} className={active === item ? 'active' : ''} onClick={() => setActive(item)}>
            {({overview:'📊',incidents:'🚨',announcements:'📢',volunteers:'👥',resources:'📦',users:'👤',communities:'🏘️'})[item]} {item[0].toUpperCase()+item.slice(1)}
          </button>
        ))}
      </aside>

      <main className="admin-main">
        <div className="admin-top"><div><h1>Admin Dashboard</h1><p>Monitor incidents, people, resources and community response across India.</p></div><span className="admin-badge">ADMIN</span></div>
        {error && <div className="admin-error">{error}</div>}

        {(active === 'overview' || active === 'incidents') && <section>
          <div className="admin-stats">
            {[["Active Incidents",stats.activeIncidents||0],["People Affected",stats.peopleAffected||0],["Volunteers",stats.volunteers||0],["Communities",stats.communities||0],["Resource Units",stats.resourceUnits||0],["Help Centres",stats.centers||0]].map(([label,value])=><div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          <div className="admin-card"><h2>Incident Management</h2><p>Central workflow: Reported → Verified → Team assigned → Response started → Resolved</p><div className="incident-list">{(dashboard?.incidents||[]).map(i=><div className="incident-row" key={i.IncidentID}><button type="button" className="incident-summary" onClick={()=>setExpandedId(expandedId===i.IncidentID?null:i.IncidentID)}><span>#{i.IncidentID} · {i.IncidentType}</span><span className={`priority-badge priority-${(i.Priority||'medium').toLowerCase()}`}>{i.Priority||i.Urgency}</span><span>{i.Status}</span><span className="muted">{i.IncidentLocation || `Location ${i.LocationID}`}</span></button>{expandedId===i.IncidentID&&<IncidentWorkflow incident={i} canManage users={summary?.users||[]} onAction={(action,payload)=>incidentAction(i,action,payload)}/>}</div>)}</div></div>
        </section>}

        {active === 'announcements' && <section className="admin-card"><h2>Raise an Announcement</h2><form className="admin-form" onSubmit={publish}><label>Message<textarea value={announcement.Content} onChange={e=>setAnnouncement({...announcement,Content:e.target.value})} placeholder="Write an official disaster-response announcement..." required /></label><label>Priority<select value={announcement.Urgency} onChange={e=>setAnnouncement({...announcement,Urgency:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Community ID (optional)<input type="number" value={announcement.CommunityID} onChange={e=>setAnnouncement({...announcement,CommunityID:e.target.value})} placeholder="Leave empty for all communities" /></label><button>📢 Publish Announcement</button></form><h3>Recent announcements</h3>{(dashboard?.announcements||[]).map(a=><div className="admin-notice" key={a.AnnouncementID}><b>{a.Urgency.toUpperCase()}</b><p>{a.Content}</p></div>)}</section>}

        {active === 'volunteers' && <section className="admin-card"><h2>Volunteer Task Management</h2><form className="admin-form admin-inline" onSubmit={assignTask}><input value={task.Description} onChange={e=>setTask({...task,Description:e.target.value})} placeholder="Task description" required/><input type="number" value={task.AssignedTo} onChange={e=>setTask({...task,AssignedTo:e.target.value})} placeholder="Volunteer User ID" required/><input type="number" value={task.IncidentID} onChange={e=>setTask({...task,IncidentID:e.target.value})} placeholder="Incident ID" required/><button>Assign Task</button></form><div className="admin-table-wrap"><table><thead><tr><th>Task</th><th>Volunteer</th><th>Incident</th><th>Status</th></tr></thead><tbody>{(summary?.tasks||[]).map(t=><tr key={t.TaskID}><td>{t.Description}</td><td>{t.AssignedTo}</td><td>#{t.IncidentID}</td><td>{t.Status}</td></tr>)}</tbody></table></div></section>}

        {active === 'resources' && <section className="admin-card"><h2>Resource Inventory & Allocation</h2><div className="admin-table-wrap"><table><thead><tr><th>Resource</th><th>Quantity</th><th>Unit</th><th>Status</th></tr></thead><tbody>{(summary?.resources||[]).map(r=><tr key={r.ResourceID}><td>{r.Name}</td><td>{r.Quantity}</td><td>{r.QuantityType}</td><td>{r.Status}</td></tr>)}</tbody></table></div><form className="admin-form admin-inline" onSubmit={allocateResource}><select value={allocation.ResourceID} onChange={e=>setAllocation({...allocation,ResourceID:e.target.value})} required><option value="">Select resource</option>{(summary?.resources||[]).map(r=><option key={r.ResourceID} value={r.ResourceID}>{r.Name} ({r.Quantity} {r.QuantityType})</option>)}</select><input type="number" value={allocation.IncidentID} onChange={e=>setAllocation({...allocation,IncidentID:e.target.value})} placeholder="Incident ID" required/><input type="number" min="1" value={allocation.Quantity} onChange={e=>setAllocation({...allocation,Quantity:e.target.value})} placeholder="Quantity" required/><button>Allocate</button></form></section>}

        {active === 'users' && <section className="admin-card"><h2>User Management</h2><div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Available</th></tr></thead><tbody>{(summary?.users||[]).map(u=><tr key={u.UserID}><td>{u.UserID}</td><td>{u.Name}</td><td>{u.Email}</td><td>{(u.UserType||[]).join(', ')}</td><td>{u.Available?'Yes':'No'}</td></tr>)}</tbody></table></div></section>}

        {active === 'communities' && <section className="admin-card"><h2>Communities</h2><div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Members</th><th>Leader</th></tr></thead><tbody>{(dashboard?.communities||[]).map(c=><tr key={c.ComID}><td>{c.ComID}</td><td>{c.Name}</td><td>{c.Users?.length||0}</td><td>{c.Leader}</td></tr>)}</tbody></table></div></section>}
      </main>
    </div>
  );
}

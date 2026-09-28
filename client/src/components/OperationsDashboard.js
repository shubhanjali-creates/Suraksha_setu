import React,{useEffect,useMemo,useState} from 'react';
import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/CSS/OperationsDashboard.css';
import IncidentWorkflow from './IncidentWorkflow';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl; L.Icon.Default.mergeOptions({iconRetinaUrl,iconUrl,shadowUrl});

const center=[22.5937,78.9629]; const bounds=[[6,68],[37.5,97.5]];
const api=async(path,options={})=>{const token=localStorage.getItem('token'); const headers={'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}; const r=await fetch(path,{...options,headers:{...headers,...(options.headers||{})}}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.error||'Request failed'); return d;};

export default function OperationsDashboard({adminOnly=false}){
 const [data,setData]=useState(null),[locations,setLocations]=useState([]),[tasks,setTasks]=useState([]),[resources,setResources]=useState([]),[notifs,setNotifs]=useState([]),[teamUsers,setTeamUsers]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [expandedId,setExpandedId]=useState(null);
 const [incident,setIncident]=useState({IncidentType:'Flood',Description:'',Priority:'Medium',Latitude:'21.2514',Longitude:'81.6296',Address:'',ApproximateaffectedCount:0});
 const [announcement,setAnnouncement]=useState({Content:'',Urgency:'medium',CommunityID:''});
 const [task,setTask]=useState({Description:'',AssignedTo:'',IncidentID:''}); const [donation,setDonation]=useState({Amount:'',ResourceID:'1'});
 const [allocation,setAllocation]=useState({ResourceID:'',IncidentID:'',Quantity:''});
 const user=useMemo(()=>{try{return JSON.parse(localStorage.getItem('user')||'null')}catch{return null}},[]);
 const isAdmin=user?.UserType?.includes('admin');
 const isResponder=user?.UserType?.includes('responder');
 const canManage=isAdmin||isResponder;

 const load=async()=>{try{setError(''); const [d,l,r,t]=await Promise.all([api('/api/dashboard'),api('/api/locations'),api('/api/resources'),api('/api/tasks')]); setData(d);setLocations(l.locations||[]);setResources(r.resources||[]);setTasks(t.tasks||[]); if(user){const n=await api('/api/notifications');setNotifs(n.notifications||[]);} if(canManage){try{const tu=await api('/api/team-users');setTeamUsers(tu.users||[]);}catch{setTeamUsers([]);}} }catch(e){setError(e.message)}};
 useEffect(()=>{load()},[]);

 const submitIncident=async e=>{e.preventDefault(); if(!localStorage.getItem('token')) return setError('Please log in before reporting an incident.'); setBusy(true);try{const loc=await api('/api/locations',{method:'POST',body:JSON.stringify({Latitude:Number(incident.Latitude),Longitude:Number(incident.Longitude),Address:incident.Address||'Selected location in India'})}); await api('/incident/create',{method:'POST',body:JSON.stringify({LocationID:loc.location.LocationID,IncidentType:incident.IncidentType,Description:incident.Description,Priority:incident.Priority,ApproximateaffectedCount:Number(incident.ApproximateaffectedCount),Latitude:Number(incident.Latitude),Longitude:Number(incident.Longitude),IncidentLocation:incident.Address})}); setIncident({...incident,Description:'',Address:''}); await load(); alert('Incident reported successfully.');}catch(e){setError(e.message)}finally{setBusy(false)}};
 const sos=async()=>{if(!localStorage.getItem('token')) return setError('Login is required for SOS.'); if(!navigator.geolocation)return setError('Geolocation is not available in this browser.'); setBusy(true);navigator.geolocation.getCurrentPosition(async p=>{try{await api('/api/sos',{method:'POST',body:JSON.stringify({Latitude:p.coords.latitude,Longitude:p.coords.longitude,Address:'Current browser location',Description:'Immediate assistance requested through SOS.'})});await load();alert('SOS request created with Critical priority.');}catch(e){setError(e.message)}finally{setBusy(false)}},()=>{setError('Location permission was denied.');setBusy(false)},{enableHighAccuracy:true,timeout:10000});};
 const createTask=async e=>{e.preventDefault();try{await api('/api/tasks',{method:'POST',body:JSON.stringify(task)});setTask({Description:'',AssignedTo:'',IncidentID:''});await load();alert('Task assigned.')}catch(e){setError(e.message)}};
 const allocate=async e=>{e.preventDefault();try{await api(`/api/resources/${allocation.ResourceID}/allocate`,{method:'POST',body:JSON.stringify({IncidentID:Number(allocation.IncidentID),Quantity:Number(allocation.Quantity)})});setAllocation({ResourceID:'',IncidentID:'',Quantity:''});await load();alert('Resource allocated.')}catch(e){setError(e.message)}};
 const donate=async e=>{e.preventDefault();try{await api('/api/donate',{method:'POST',body:JSON.stringify({Amount:Number(donation.Amount),ResourceID:Number(donation.ResourceID)})});setDonation({Amount:'',ResourceID:'1'});await load();alert('Donation recorded. Thank you.')}catch(e){setError(e.message)}};
 const postAnnouncement=async e=>{e.preventDefault();try{await api('/api/announcements',{method:'POST',body:JSON.stringify(announcement)});setAnnouncement({Content:'',Urgency:'medium',CommunityID:''});await load();alert('Announcement published.')}catch(e){setError(e.message)}};
 const updateTask=async(t,status)=>{try{await api(`/api/tasks/${t.TaskID}`,{method:'PATCH',body:JSON.stringify({Status:status})});await load()}catch(e){setError(e.message)}};

 const incidentAction=async(i,action,payload={})=>{
  try{
   const id=i.IncidentID;
   if(action==='verify') await api(`/incident/${id}/verify`,{method:'POST',body:JSON.stringify(payload)});
   else if(action==='reject') await api(`/incident/${id}/reject`,{method:'POST',body:JSON.stringify(payload)});
   else if(action==='assign') await api(`/incident/${id}/assign`,{method:'POST',body:JSON.stringify(payload)});
   else if(action==='status') await api(`/incident/${id}/status`,{method:'PATCH',body:JSON.stringify(payload)});
   else if(action==='note') await api(`/incident/${id}/notes`,{method:'POST',body:JSON.stringify(payload)});
   await load();
  }catch(e){setError(e.message)}
 };

 const activeIncidents=(data?.incidents||[]).filter(i=>!['Resolved','Expired','Rejected'].includes(i.Status));

 if(adminOnly&&!isAdmin)return <div className="ops-shell"><div className="ops-card"><h2>Admin access required</h2></div></div>;
 return <div className="ops-shell">
  <div className="ops-title"><div><h1>Suraksha Setu Operations Centre</h1><p>Reported → Verified → Responding → Resolved — coordinated disaster response across India.</p></div><button className="sos-btn" onClick={sos} disabled={busy}>🚨 SOS</button></div>
  {error&&<div className="ops-error">{error}</div>}
  {data&&<div className="stat-grid">{[['Active Incidents',data.stats.activeIncidents],['People Affected',data.stats.peopleAffected],['Volunteers',data.stats.volunteers],['Communities',data.stats.communities],['Resource Units',data.stats.resourceUnits],['Help Centres',data.stats.centers]].map(x=><div className="stat-card" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div>}
  <div className="ops-grid">
   <section className="ops-card wide"><h2>India Incident & Relief Map</h2><div className="ops-map"><MapContainer center={center} zoom={5} minZoom={4} maxZoom={13} maxBounds={bounds} maxBoundsViscosity={1}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{locations.map((x,i)=><Marker key={i} position={x.position}><Popup>{x.popupText}</Popup></Marker>)}</MapContainer></div></section>
   <section className="ops-card"><h2>Report an Incident</h2><form className="ops-form" onSubmit={submitIncident}><select value={incident.IncidentType} onChange={e=>setIncident({...incident,IncidentType:e.target.value})}>{['Flood','Earthquake','Fire','Cyclone','Landslide','Drought','Heatwave','Accident','Medical Emergency','Others'].map(x=><option key={x}>{x}</option>)}</select><select value={incident.Priority} onChange={e=>setIncident({...incident,Priority:e.target.value})}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><input placeholder="Address / landmark" value={incident.Address} onChange={e=>setIncident({...incident,Address:e.target.value})} required/><textarea placeholder="Describe the incident" value={incident.Description} onChange={e=>setIncident({...incident,Description:e.target.value})} required/><div className="two"><input type="number" step="any" placeholder="Latitude" value={incident.Latitude} onChange={e=>setIncident({...incident,Latitude:e.target.value})} required/><input type="number" step="any" placeholder="Longitude" value={incident.Longitude} onChange={e=>setIncident({...incident,Longitude:e.target.value})} required/></div><input type="number" min="0" placeholder="Approx. people affected" value={incident.ApproximateaffectedCount} onChange={e=>setIncident({...incident,ApproximateaffectedCount:e.target.value})}/><button disabled={busy}>{busy?'Submitting...':'Report Incident'}</button></form></section>
  </div>
  <section className="ops-card"><h2>Active Incident Workflow</h2>
   {!canManage&&<p className="workflow-hint">Log in as an administrator or responder to verify incidents and assign teams.</p>}
   <div className="incident-list">{activeIncidents.length?activeIncidents.map(i=><div className="incident-row" key={i.IncidentID}>
    <button type="button" className="incident-summary" onClick={()=>setExpandedId(expandedId===i.IncidentID?null:i.IncidentID)}>
     <span>#{i.IncidentID} · {i.IncidentType}</span>
     <span className={`priority-badge priority-${(i.Priority||'medium').toLowerCase()}`}>{i.Priority||i.Urgency}</span>
     <span>{i.Status}</span>
     <span className="muted">{i.IncidentLocation||`Location ${i.LocationID}`}</span>
    </button>
    {expandedId===i.IncidentID&&<IncidentWorkflow incident={i} canManage={canManage} users={teamUsers} onAction={(action,payload)=>incidentAction(i,action,payload)}/>}
   </div>):<p>No active incidents in the workflow queue.</p>}</div>
  </section>
  <div className="ops-grid">
   <section className="ops-card"><h2>Volunteer Tasks</h2>{isAdmin&&<form className="ops-form compact" onSubmit={createTask}><input placeholder="Task description" value={task.Description} onChange={e=>setTask({...task,Description:e.target.value})} required/><input type="number" placeholder="Volunteer User ID" value={task.AssignedTo} onChange={e=>setTask({...task,AssignedTo:e.target.value})} required/><input type="number" placeholder="Incident ID" value={task.IncidentID} onChange={e=>setTask({...task,IncidentID:e.target.value})} required/><button>Assign Task</button></form>}<div className="task-list">{tasks.map(t=><div className="task" key={t.TaskID}><b>#{t.TaskID}</b> {t.Description}<span>Incident #{t.IncidentID} · {t.Status}</span>{t.AssignedTo===user?.UserID&&!['Completed'].includes(t.Status)&&<button onClick={()=>updateTask(t,t.Status==='Assigned'?'Running':'Completed')}>{t.Status==='Assigned'?'Start':'Complete'}</button>}</div>)}</div></section>
   <section className="ops-card"><h2>Resource Inventory</h2><div className="table-wrap"><table><thead><tr><th>Resource</th><th>Quantity</th><th>Status</th></tr></thead><tbody>{resources.map(r=><tr key={r.ResourceID}><td>{r.Name}</td><td>{r.Quantity} {r.QuantityType}</td><td>{r.Status}</td></tr>)}</tbody></table></div>{isAdmin&&<form className="ops-form compact" onSubmit={allocate}><h3>Allocate to incident</h3><select value={allocation.ResourceID} onChange={e=>setAllocation({...allocation,ResourceID:e.target.value})} required><option value="">Select resource</option>{resources.map(r=><option key={r.ResourceID} value={r.ResourceID}>{r.Name} ({r.Quantity} {r.QuantityType})</option>)}</select><input type="number" placeholder="Incident ID" value={allocation.IncidentID} onChange={e=>setAllocation({...allocation,IncidentID:e.target.value})} required/><input type="number" min="1" placeholder="Quantity" value={allocation.Quantity} onChange={e=>setAllocation({...allocation,Quantity:e.target.value})} required/><button>Allocate Resource</button></form>}</section>
  </div>
  <div className="ops-grid"><section className="ops-card"><h2>Announcements</h2>{isAdmin&&<form className="ops-form compact" onSubmit={postAnnouncement}><textarea placeholder="Publish an official response update..." value={announcement.Content} onChange={e=>setAnnouncement({...announcement,Content:e.target.value})} required/><select value={announcement.Urgency} onChange={e=>setAnnouncement({...announcement,Urgency:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><input type="number" placeholder="Community ID (optional)" value={announcement.CommunityID} onChange={e=>setAnnouncement({...announcement,CommunityID:e.target.value})}/><button>Publish Announcement</button></form>}{(data?.announcements||[]).map(a=><div className="notice" key={a.AnnouncementID}><b>{a.Urgency.toUpperCase()}</b><p>{a.Content}</p></div>)}</section><section className="ops-card"><h2>Donations</h2><form className="ops-form compact" onSubmit={donate}><input type="number" min="1" placeholder="Amount in INR" value={donation.Amount} onChange={e=>setDonation({...donation,Amount:e.target.value})} required/><select value={donation.ResourceID} onChange={e=>setDonation({...donation,ResourceID:e.target.value})}>{resources.map(r=><option key={r.ResourceID} value={r.ResourceID}>{r.Name}</option>)}</select><button>Record Donation</button></form><p>Total donations shown on dashboard are calculated from MongoDB.</p></section><section className="ops-card"><h2>My Notifications</h2>{notifs.length?<ul>{notifs.map(n=><li key={n.NotificationID}><b>{n.Title}</b> — {n.Message}</li>)}</ul>:<p>No new notifications.</p>}</section></div>
 </div>
}

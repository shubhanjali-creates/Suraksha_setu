import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/CSS/Home.css';
import { ImgSlider, Map, Statistics } from '../components';
import Arrow from '../assets/images/arrows.png';

const Home = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState(null);
  const [locations, setLocations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [incidentTable, setIncidentTable] = useState(false);
  const [contactTable, setContactTable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/home')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setIncidents(data);
        setLocations(data.MapLocation || []);
        setContacts(data.contacts || []);
      })
      .catch(() => {
        if (!cancelled) {
          setIncidents({ incidentList: [] });
          setLocations([]);
          setContacts([]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const incidentList = incidents?.incidentList || [];
  const criticalCount = incidentList.filter(i => String(i.Priority || i.Urgency || '').toLowerCase() === 'critical').length;

  return (
    <main className="home-page">
      <section className="home-hero">
        <ImgSlider />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-kicker">🇮🇳 INDIA DISASTER RESPONSE PLATFORM</span>
          <h1>Stay informed. Stay connected. Get help when it matters.</h1>
          <p>Suraksha Setu connects citizens, communities, volunteers and response teams during emergencies.</p>
          <div className="hero-actions">
            <button className="hero-primary" onClick={() => navigate('/incidents')}>🚨 Emergency SOS</button>
            <button className="hero-secondary" onClick={() => navigate('/map')}>🗺 Explore live map</button>
          </div>
          <div className="hero-trust"><span>● Live response data</span><span>● India-focused locations</span><span>● Community coordination</span></div>
        </div>
      </section>

      <section className="quick-actions section-shell">
        <div className="section-intro"><span>QUICK ACCESS</span><h2>What do you need right now?</h2></div>
        <div className="quick-grid">
          <button onClick={() => navigate('/incidents')}><span>🚨</span><strong>Report / SOS</strong><small>Report an emergency or request immediate help.</small></button>
          <button onClick={() => navigate('/map')}><span>🗺️</span><strong>Nearby help</strong><small>Find incidents, hospitals, shelters and relief centres.</small></button>
          <button onClick={() => navigate('/communities')}><span>👥</span><strong>Communities</strong><small>Connect with local communities and volunteers.</small></button>
          <button onClick={() => navigate('/medicals')}><span>🏥</span><strong>Emergency services</strong><small>Browse medical and emergency support services.</small></button>
        </div>
      </section>

      <section className="live-status section-shell">
        <div className="section-intro"><span>LIVE SITUATION</span><h2>Response at a glance</h2></div>
        <div className="status-grid">
          <div className="status-card"><span>🔴</span><div><strong>{incidentList.length}</strong><small>Reported incidents</small></div></div>
          <div className="status-card warning"><span>⚠️</span><div><strong>{criticalCount}</strong><small>Critical / high priority</small></div></div>
          <div className="status-card safe"><span>🏠</span><div><strong>{locations.filter(l => l.type === 'shelter').length}</strong><small>Shelters on map</small></div></div>
          <div className="status-card info"><span>📍</span><div><strong>{locations.length}</strong><small>Mapped response locations</small></div></div>
        </div>
      </section>

      <section className="section-shell map-section">
        <div className="section-heading-row"><div className="section-intro"><span>LIVE MAP</span><h2>See what is happening across India</h2><p>Filter incidents and support locations directly on the map.</p></div><button className="outline-button" onClick={() => navigate('/map')}>Open full map →</button></div>
        <div className="home-map-card"><Map locations={locations} longitude={78.9629} latitude={22.5937} defaultZoom={5} /></div>
      </section>

      <section className="section-shell home-table-section">
        <button className="collapsible-heading" onClick={() => setIncidentTable(v => !v)}><span><span>RECENT ACTIVITY</span><strong>Recent incidents</strong></span><img src={Arrow} alt="" className={incidentTable ? 'rotated' : ''} /></button>
        {incidentTable && (
          <div className="table-card responsive-table">
            {incidentList.length ? <table><thead><tr><th>ID</th><th>Type</th><th>Location</th><th>Status</th><th>Priority</th></tr></thead><tbody>{incidentList.map(incident => <tr key={incident.IncidentID}><td>#{incident.IncidentID}</td><td>{incident.IncidentType}</td><td>{incident.Location}</td><td><span className="table-status">{incident.Status}</span></td><td>{incident.Priority || incident.Urgency || '—'}</td></tr>)}</tbody></table> : <div className="empty-state">🛡️<strong>No recent incidents</strong><p>There are currently no incidents available.</p></div>}
          </div>
        )}
      </section>

      <section className="section-shell home-table-section">
        <button className="collapsible-heading" onClick={() => setContactTable(v => !v)}><span><span>EMERGENCY SUPPORT</span><strong>Emergency contacts</strong></span><img src={Arrow} alt="" className={contactTable ? 'rotated' : ''} /></button>
        {contactTable && <div className="table-card responsive-table">{contacts.length ? <table><thead><tr><th>Name</th><th>Designation</th><th>Phone</th><th>Email</th></tr></thead><tbody>{contacts.map(contact => <tr key={contact.contactID}><td>{contact.name}</td><td>{contact.designation}</td><td><a href={`tel:${contact.phone}`}>{contact.phone}</a></td><td>{contact.email}</td></tr>)}</tbody></table> : <div className="empty-state">📞<strong>Emergency contacts unavailable</strong><p>Please try again shortly.</p></div>}</div>}
      </section>

      <section className="preparedness-banner section-shell">
        <div><span>PREPARE BEFORE AN EMERGENCY</span><h2>Know what to do before, during and after a disaster.</h2><p>Keep essential contacts, evacuation information and local support locations accessible.</p></div>
        <button onClick={() => navigate('/incidents')}>Explore disaster support →</button>
      </section>

      <section className="section-shell stats-section"><div className="section-intro"><span>COMMUNITY IMPACT</span><h2>Suraksha Setu at a glance</h2></div><Statistics /></section>
    </main>
  );
};

export default Home;

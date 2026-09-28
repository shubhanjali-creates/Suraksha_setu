import React, { useEffect, useState } from 'react';
import '../assets/CSS/Header.css';
import Logo from '../assets/images/dms-logo-transparent.png';
import notification_icon_on from '../assets/images/notification_on.png';
import notification_icon from '../assets/images/notification.png';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { remove } from '../store/roleSlice';

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.roleState.loggedIn);
  const isAdmin = useSelector(state => state.roleState.isAdmin);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notIcon, setNotIcon] = useState(notification_icon_on);

  useEffect(() => {
    setMobileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const logout = () => {
    dispatch(remove());
    navigate('/auth');
  };

  const active = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="main-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Suraksha Setu home">
          <img src={Logo} className="header-logo" alt="Suraksha Setu" />
          <span className="brand-copy">
            <strong>Suraksha Setu</strong>
            <small>India Disaster Response</small>
          </span>
        </Link>

        <button className="mobile-menu-button" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle navigation">
          ☰
        </button>

        <nav className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          <Link className={active('/incidents') ? 'nav-item active' : 'nav-item'} to="/incidents">Incidents</Link>
          <Link className={active('/communities') ? 'nav-item active' : 'nav-item'} to="/communities">Communities</Link>
          <Link className={active('/medicals') ? 'nav-item active' : 'nav-item'} to="/medicals">Services</Link>
          <Link className={active('/guidelines') ? 'nav-item active' : 'nav-item'} to="/guidelines">Guidelines</Link>
          {loggedIn && <Link className={active('/operations') ? 'nav-item active' : 'nav-item'} to="/operations">Operations</Link>}
          {isAdmin && loggedIn && <Link className={active('/admin') ? 'nav-item admin-link active' : 'nav-item admin-link'} to="/admin">Admin</Link>}
          {loggedIn ? (
            <button className="nav-item nav-button" onClick={logout}>Log out</button>
          ) : (
            <button className="nav-login" onClick={() => navigate('/auth')}>Login / Register</button>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="notification-box"
            onClick={() => {
              setNotIcon(notification_icon);
              setNotificationsOpen(v => !v);
            }}
            aria-label="Notifications"
          >
            <img src={notIcon} className="notification" alt="" />
            <span className="notification-dot" />
          </button>
          <button className="header-sos" onClick={() => navigate('/incidents')}>🚨 SOS</button>
        </div>
      </div>

      {notificationsOpen && (
        <div className="notification-modal">
          <div className="notification-modal-content">
            <div className="notification-heading">
              <div><strong>Notifications</strong><span>Stay updated on response activity</span></div>
              <button onClick={() => setNotificationsOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="notification-list">
              <div className="notification-item"><span className="notification-icon">🚨</span><div><strong>Emergency alerts</strong><p>Critical incident notifications will appear here.</p></div></div>
              <div className="notification-item"><span className="notification-icon">📢</span><div><strong>Announcements</strong><p>Community and response updates are shown here.</p></div></div>
              <div className="notification-item"><span className="notification-icon">👥</span><div><strong>Volunteer updates</strong><p>Task assignments and response updates.</p></div></div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

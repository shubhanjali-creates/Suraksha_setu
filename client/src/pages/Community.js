import React, { useEffect, useState } from 'react';
import '../assets/CSS/Community.css';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';

const Community = () => {
  const { id } = useParams();
  const location = useLocation();
  const [num, setNum] = useState('98xxxxxxxx (click to reveal)');
  const leaderNum = '9876543210';

  useEffect(() => {
    const path = location.pathname.split('/')[3];
    const command = path ? `.community-${path}` : '.community-home';
    const navBars = ['.community-home', '.community-volunteers', '.community-announcement'];
    navBars.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.classList.toggle('com-nav-active', selector === command);
    });
  }, [location.pathname]);

  return (
    <div className="community-page">
      <header className="com-header">
        <h1 className="text-4xl font-medium pl-3">Community Response Centre</h1>
        <nav className="community-nav">
          <ul>
            <li className="community-home"><Link to={`/community/${id}`}>Community</Link></li>
            <li className="community-volunteers"><Link to={`/community/${id}/volunteers`}>Volunteers</Link></li>
            <li className="community-announcement"><Link to={`/community/${id}/announcement`}>Announcements</Link></li>
          </ul>
        </nav>
      </header>
      <Outlet />
      <section id="contact">
        <h2 className="text-4xl font-semibold mt-2 mb-2">Contact and Support</h2>
        <ul>
          <li><span>Community Leader:</span> Ananya Sharma</li>
          <li><span>Phone:</span><span onClick={() => setNum(leaderNum)}> {num}</span></li>
          <li><span>Email:</span> <a href="mailto:ananya.sharma@example.in">Mail Leader</a></li>
        </ul>
      </section>
    </div>
  );
};

export default Community;

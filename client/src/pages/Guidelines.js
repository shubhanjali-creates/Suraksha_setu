import React from 'react';
import '../assets/CSS/InfoPages.css';

export default function Guidelines(){
 const sections=[
  ['🚨 Emergency & SOS','Use SOS only for genuine emergencies. Share your location when prompted and keep your phone available for response updates. If there is immediate danger, also contact the appropriate local emergency service.'],
  ['📍 Reporting an incident','Choose the disaster type, select the most accurate location or landmark, describe what is happening, and estimate the number of people affected. Avoid entering sensitive personal information.'],
  ['📢 Official updates','Announcements marked high priority should be read carefully and acted on according to the instructions provided. Do not spread unverified information through community channels.'],
  ['🤝 Community participation','Use communities to coordinate help, share verified local information, and support volunteers. Keep conversations respectful and focused on response activities.'],
  ['🏥 Finding help','Use the map and Services section to find nearby hospitals, shelters and relief centres. Check the latest availability shown before travelling when possible.'],
  ['🔐 Account safety','Never share your password or verification details. Report suspicious activity to the platform administrator and use a strong, unique password.']
 ];
 return <main className="info-page"><div className="info-hero"><span className="eyebrow">SURAKSHA SETU</span><h1>Safety & Response Guidelines</h1><p>Simple guidance for using the platform responsibly before, during and after an emergency.</p></div><div className="info-grid">{sections.map(([title,text])=><article className="info-card" key={title}><h2>{title}</h2><p>{text}</p></article>)}</div><div className="info-callout"><strong>Remember:</strong> Suraksha Setu helps coordinate information and response. Always follow instructions from authorized emergency authorities at the scene.</div></main>;
}

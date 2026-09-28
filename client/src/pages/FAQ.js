import React,{useState} from 'react';
import '../assets/CSS/InfoPages.css';

const faqs=[
 ['What is Suraksha Setu?','Suraksha Setu is a disaster-response platform for reporting incidents, finding nearby help, receiving announcements, coordinating communities and supporting response teams.'],
 ['How do I report an incident?','Open Operations or the incident reporting action, select the disaster type, add the location and describe what is happening. Submit only information you can reasonably verify.'],
 ['When should I use SOS?','Use SOS when you need urgent assistance. The platform can use your browser location to create an emergency request and identify nearby help.'],
 ['Can I join a community?','Yes. Open Communities, choose a relevant local community and use the available join option. Community features can include announcements, chat and volunteer coordination.'],
 ['Who can manage incidents?','Incident verification, assignment and response actions are restricted to authorized responders and administrators. Regular users can report incidents and view appropriate public information.'],
 ['How do announcements work?','Authorized administrators can publish official announcements for all communities or a specific community. Important announcements are highlighted according to their urgency.'],
 ['Why does the map need my location?','Location helps identify nearby incidents, hospitals, shelters and response centres. You can still browse the India map without sharing your precise location.'],
 ['What should I do if information looks incorrect?','Do not spread it as fact. Report the issue to the response team or administrator and rely on verified announcements and official emergency instructions.']
];
export default function FAQ(){const [open,setOpen]=useState(null);return <main className="info-page"><div className="info-hero"><span className="eyebrow">HELP CENTRE</span><h1>Frequently Asked Questions</h1><p>Quick answers to common questions about reporting, safety, communities and response coordination.</p></div><div className="faq-list">{faqs.map(([q,a],i)=><article className={`faq-item ${open===i?'open':''}`} key={q}><button onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i}><span>{q}</span><b>{open===i?'−':'+'}</b></button>{open===i&&<p>{a}</p>}</article>)}</div></main>}

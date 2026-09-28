import React,{useEffect,useRef,useState} from 'react';
import {useParams} from 'react-router-dom';
import {io} from 'socket.io-client';
import '../../assets/CSS/CommunityChat.css';

export const CommunityChat=()=>{
 const {id}=useParams(); const communityId=Number(id)||1; const [messages,setMessages]=useState([]); const [text,setText]=useState(''); const [error,setError]=useState(''); const ref=useRef();
 const load=async(signal)=>{try{const r=await fetch(`/community/${communityId}/chat`,{signal}); const d=await r.json(); if(!r.ok)throw new Error(d.error||'Unable to load chat.'); setMessages(d.messages||[]); setError('');}catch(e){if(e.name!=='AbortError')setError(e.message);}};
 useEffect(()=>{const controller=new AbortController(); let socket; load(controller.signal); socket=io(window.location.origin,{transports:['websocket','polling']}); socket.emit('join-community',communityId); socket.on('community-message',m=>setMessages(prev=>prev.some(x=>x.MessageID===m.MessageID)?prev:[...prev,m])); return()=>{controller.abort(); if(socket){socket.off('community-message');socket.disconnect();}};},[communityId]);
 const send=async e=>{e.preventDefault(); const content=text.trim(); if(!content)return; try{const r=await fetch(`/community/${communityId}/messages`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${localStorage.getItem('token')}`},body:JSON.stringify({Content:content})}); const d=await r.json(); if(!r.ok)throw new Error(d.error||'Unable to send'); setText(''); ref.current?.focus();}catch(e){setError(e.message);}};
 return <div><h1>Community Chat</h1>{error&&<div className="chat-error">{error}</div>}<div className="chatbox-container"><h2 className="chat-header">Live community coordination</h2><div className="chatbox">{messages.map(m=><div key={m.MessageID} className="message-container"><div className="message mine"><b>{m.SenderName||'Community member'}</b><div>{m.Content}</div><span className="time">{new Date(m.CreationTime).toLocaleString('en-IN')}</span></div></div>)}{!messages.length&&<p className="chat-empty">No messages yet. Start the response conversation.</p>}<form className="input-area" onSubmit={send}><input ref={ref} className="input-text" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a verified community update..."/><button className="sendMessage">Send</button></form></div></div></div>
};

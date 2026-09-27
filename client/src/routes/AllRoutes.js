
import { Routes, Route, Navigate } from 'react-router-dom';

import { Home, Community,MedicalHome } from '../pages';
import { Header,Map,Footer,CommunityHome,
  CommunityForum,CommunityVolunteers,
  CommunityChat, Communities, Medicals ,Incidents
} from '../components';
import {Auth} from '../pages/Auth';
import { useEffect } from 'react';
import OperationsDashboard from '../components/OperationsDashboard';
import AdminDashboard from '../pages/AdminDashboard';

import { useDispatch, useSelector } from 'react-redux';


export const AllRoutes = () => {
    const dispatch = useDispatch();
    const isAdmin = useSelector(state => state.roleState.isAdmin);
    const loggedIn = useSelector(state => state.roleState.loggedIn);

    
 
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/auth/me',{headers:{Authorization:`Bearer ${token}`}})
        .then(r => { if(!r.ok) throw new Error('expired'); return r.json(); })
        .then(data => { const types=Array.isArray(data.user.UserType)?data.user.UserType:[]; localStorage.setItem('user',JSON.stringify(data.user)); dispatch({type:'role/changeRole',payload:{role:types,loggedIn:true,isAdmin:types.includes('admin')}}); })
        .catch(()=>{localStorage.removeItem('token');localStorage.removeItem('user');dispatch({type:'role/changeRole',payload:{role:[],loggedIn:false,isAdmin:false}});});
    }, [dispatch]);

    const locations = [
      { position: [21.2514, 81.6296], popupText: 'Raipur Relief Centre' },
      { position: [20.2961, 85.8245], popupText: 'Bhubaneswar Emergency Centre' },
      { position: [13.0827, 80.2707], popupText: 'Chennai Relief Centre' }
    ];
  return (
    <>
    <Header />
    <Routes>

        <Route path="/" element={  <Home />  } />
        <Route path="/map" element={<Map locations={locations} defaultZoom={5} />} />
        <Route path="/operations" element={loggedIn ? <OperationsDashboard/> : <Navigate to="/auth"/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/volunteers" element={loggedIn ? <OperationsDashboard/> : <Navigate to="/auth"/>} />
        <Route path="/resources" element={<OperationsDashboard/>} />
        <Route path="/announcements" element={<OperationsDashboard/>} />
        <Route path="/donate" element={<OperationsDashboard/>} />
        <Route path="/auth" element={<Auth/>} >
            <Route path='login' element={<h1>login</h1>} />
            <Route path='register' element={<h1>Register</h1>} />
            <Route path='*' element={<Navigate to='/' />} />
        </Route>
        <Route path='/community/:id' element={ loggedIn ? <Community /> : <Navigate to="/auth/login"/>} >
            <Route path='' element={< CommunityHome/>} />
            <Route path='chat' element={<CommunityChat/>} />
            <Route path='announcement' element={ < CommunityForum />} />
            <Route path='volunteers' element={ < CommunityVolunteers />} />
            <Route path='*' element={<h1>Access Denied !</h1>} />
        </Route>
        <Route path='/communities' element={<Communities/>} />
        <Route path='/incidents' element={<Incidents/>} />
        <Route path='/medicals' element={ <Medicals/>} />
        <Route path='/medical/:id' element={ <MedicalHome/>} />
        <Route path='*' element={<h1>404 ! Page Not Found</h1>} />
    </Routes>
    <Footer />
      </>
  )
}
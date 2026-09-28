const Incident = require('../models/Incident');
const Location = require('../models/Location');
const Resource = require('../models/Resource');
const ResourceAllocation = require('../models/ResourceAllocation');
const VolunteerTask = require('../models/VolunteerTask');
const User = require('../models/User');
const Community = require('../models/Community');
const HelpCenter = require('../models/HelpCenter');
const Announcement = require('../models/Announcement');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Donation = require('../models/Donation');
const { enrichIncidents, initialTimeline, urgencyFromPriority } = require('../utils/incidentHelpers');

async function nextId(Model, field) {
  const last = await Model.findOne().sort({ [field]: -1 }).select(field).lean();
  return last ? Number(last[field]) + 1 : 1;
}

exports.dashboard = async (req,res) => {
  try {
    const [incidentsRaw, volunteers, communities, resources, centers, announcements] = await Promise.all([
      Incident.find().sort({DateReported:-1}).limit(100).lean(),
      User.countDocuments({ UserType: { $in: ['volunteer'] } }), Community.countDocuments(), Resource.find().lean(), HelpCenter.find().lean(), Announcement.find().sort({CreationDate:-1}).limit(10).lean()
    ]);
    const incidents = await enrichIncidents(incidentsRaw);
    const active = incidents.filter(i => !['Resolved','Expired','Rejected'].includes(i.Status)).length;
    const affected = incidents.reduce((n,i)=>n+(i.ApproximateaffectedCount||0),0);
    const available = resources.reduce((n,r)=>n+(r.Quantity||0),0);
    const communityRows = await Community.find().sort({Name:1}).lean();
    res.json({stats:{activeIncidents:active, totalIncidents:incidents.length, volunteers, communities, peopleAffected:affected, resourceUnits:available, centers:centers.length}, incidents, resources, centers, announcements, communities: communityRows});
  } catch(e){res.status(500).json({error:e.message});}
};

exports.locations = async (req,res) => {
  try {
    const [locations, centers, incidents] = await Promise.all([Location.find().lean(), HelpCenter.find().lean(), Incident.find().lean()]);
    const incidentMap = incidents.map(i => { const l=locations.find(x=>x.LocationID===i.LocationID); return l ? {position:[l.Latitude,l.Longitude],popupText:`${i.IncidentType} — ${i.Status}`,type:'incident',incidentId:i.IncidentID}:null; }).filter(Boolean);
    const centerMap = centers.map(c => { const l=locations.find(x=>x.LocationID===c.LocationID); return l ? {position:[l.Latitude,l.Longitude],popupText:`${c.Name} (${c.Role})`,type:c.Role.toLowerCase(),centerId:c.CenterID}:null; }).filter(Boolean);
    res.json({locations:[...incidentMap,...centerMap]});
  } catch(e){res.status(500).json({error:e.message});}
};

exports.createLocation = async (req,res) => {
  try {
    const {Latitude,Longitude,Address} = req.body;
    if(!Number.isFinite(Number(Latitude))||!Number.isFinite(Number(Longitude))||!Address) return res.status(400).json({error:'Valid latitude, longitude and address are required.'});
    const LocationID=await nextId(Location,'LocationID');
    const location=await Location.create({LocationID,IncidentID:[],Latitude:Number(Latitude),Longitude:Number(Longitude),Address});
    res.status(201).json({location});
  }catch(e){res.status(500).json({error:e.message});}
};

exports.listResources = async(req,res)=>{try{res.json({resources:await Resource.find().sort({Name:1}).lean()});}catch(e){res.status(500).json({error:e.message});}};
exports.updateResource = async(req,res)=>{try{const id=Number(req.params.id); const qty=Number(req.body.Quantity); if(!Number.isFinite(qty)||qty<0)return res.status(400).json({error:'Quantity must be a non-negative number.'}); const r=await Resource.findOneAndUpdate({ResourceID:id},{Quantity:qty,Status:qty>0?'available':'unavailable',UpdatedAt:new Date()},{new:true,runValidators:true}); if(!r)return res.status(404).json({error:'Resource not found.'}); res.json({resource:r});}catch(e){res.status(500).json({error:e.message});}};
exports.allocateResource = async(req,res)=>{try{const resourceId=Number(req.params.id), incidentId=Number(req.body.IncidentID), quantity=Number(req.body.Quantity); if(!incidentId||!Number.isInteger(quantity)||quantity<1)return res.status(400).json({error:'IncidentID and a positive quantity are required.'}); const r=await Resource.findOne({ResourceID:resourceId}); if(!r)return res.status(404).json({error:'Resource not found.'}); if(r.Quantity<quantity)return res.status(400).json({error:`Only ${r.Quantity} ${r.QuantityType} available.`}); const allocationId=await nextId(ResourceAllocation,'AllocationID'); const allocation=await ResourceAllocation.create({AllocationID:allocationId,ResourceID:resourceId,IncidentID:incidentId,Quantity:quantity,AllocatedBy:req.user.UserID}); r.Quantity-=quantity; r.Status=r.Quantity>0?'available':'unavailable'; r.UpdatedAt=new Date(); await r.save(); res.status(201).json({allocation,resource:r});}catch(e){res.status(500).json({error:e.message});}};

exports.tasks = async(req,res)=>{try{const filter=req.user.UserType.includes('admin')||req.user.UserType.includes('volunteer')?{}:{AssignedTo:req.user.UserID}; if(req.query.mine==='true')filter.AssignedTo=req.user.UserID; const tasks=await VolunteerTask.find(filter).sort({AssignedDate:-1}).lean(); res.json({tasks});}catch(e){res.status(500).json({error:e.message});}};
exports.createTask = async(req,res)=>{try{const {Description,AssignedTo,IncidentID}=req.body; if(!Description||!AssignedTo||!IncidentID)return res.status(400).json({error:'Description, AssignedTo and IncidentID are required.'}); const task=await VolunteerTask.create({TaskID:await nextId(VolunteerTask,'TaskID'),Description,AssignedTo:Number(AssignedTo),IncidentID:Number(IncidentID),Status:'Assigned'}); const nid=await nextId(Notification,'NotificationID'); await Notification.create({NotificationID:nid,UserID:Number(AssignedTo),Title:'New volunteer task',Message:Description,Type:'task'}); res.status(201).json({task});}catch(e){res.status(500).json({error:e.message});}};
exports.updateTask = async(req,res)=>{try{const task=await VolunteerTask.findOne({TaskID:Number(req.params.id)}); if(!task)return res.status(404).json({error:'Task not found.'}); if(task.AssignedTo!==req.user.UserID&&!req.user.UserType.includes('admin'))return res.status(403).json({error:'You cannot update this task.'}); const status=req.body.Status; if(!['Assigned','Running','Completed'].includes(status))return res.status(400).json({error:'Invalid task status.'}); task.Status=status; task.DateCompleted=status==='Completed'?new Date():undefined; await task.save(); res.json({task});}catch(e){res.status(500).json({error:e.message});}};

exports.communities = async(req,res)=>{try{const communities=await Community.find().sort({Name:1}).lean();res.json({communities});}catch(e){res.status(500).json({error:e.message});}};

exports.joinCommunity = async(req,res)=>{try{const id=Number(req.params.id), user=req.user.UserID; const c=await Community.findOne({ComID:id}); if(!c)return res.status(404).json({error:'Community not found.'}); if(!c.Users.includes(user)){c.Users.push(user); await c.save(); await User.updateOne({UserID:user},{$addToSet:{Community:id}});} res.json({community:c});}catch(e){res.status(500).json({error:e.message});}};
exports.leaveCommunity = async(req,res)=>{try{const id=Number(req.params.id), user=req.user.UserID; const c=await Community.findOne({ComID:id}); if(!c)return res.status(404).json({error:'Community not found.'}); c.Users=c.Users.filter(x=>x!==user); await c.save(); await User.updateOne({UserID:user},{$pull:{Community:id}}); res.json({community:c});}catch(e){res.status(500).json({error:e.message});}};
exports.postMessage = async(req,res)=>{try{const id=Number(req.params.id), content=String(req.body.Content||'').trim(); if(!content)return res.status(400).json({error:'Message cannot be empty.'}); const c=await Community.findOne({ComID:id}); if(!c||!c.Users.includes(req.user.UserID))return res.status(403).json({error:'Join the community before sending messages.'}); const message=await Message.create({MessageID:await nextId(Message,'MessageID'),Sender:req.user.UserID,CommunityID:id,Content:content}); res.status(201).json({message});}catch(e){res.status(500).json({error:e.message});}};
exports.postAnnouncement = async(req,res)=>{try{const {Content,Urgency='medium'}=req.body; if(!Content)return res.status(400).json({error:'Content is required.'}); const a=await Announcement.create({AnnouncementID:await nextId(Announcement,'AnnouncementID'),Content,CreatedBy:req.user.UserID,CommunityID:req.body.CommunityID?Number(req.body.CommunityID):undefined,Urgency}); res.status(201).json({announcement:a});}catch(e){res.status(500).json({error:e.message});}};

exports.notifications = async(req,res)=>{try{const list=await Notification.find({UserID:req.user.UserID}).sort({CreatedAt:-1}).limit(30).lean(); res.json({notifications:list});}catch(e){res.status(500).json({error:e.message});}};
exports.readNotification = async(req,res)=>{try{const n=await Notification.findOneAndUpdate({NotificationID:Number(req.params.id),UserID:req.user.UserID},{Read:true},{new:true}); if(!n)return res.status(404).json({error:'Notification not found.'}); res.json({notification:n});}catch(e){res.status(500).json({error:e.message});}};

exports.sos = async(req,res)=>{try{const {Latitude,Longitude,Address,Description='Immediate assistance requested'}=req.body; if(!Number.isFinite(Number(Latitude))||!Number.isFinite(Number(Longitude)))return res.status(400).json({error:'Location is required for SOS.'}); const LocationID=await nextId(Location,'LocationID'); const IncidentID=await nextId(Incident,'IncidentID'); await Location.create({LocationID,IncidentID:[IncidentID],Latitude:Number(Latitude),Longitude:Number(Longitude),Address:Address||'Emergency location'}); const now=new Date(); const incident=await Incident.create({IncidentID,LocationID,IncidentType:'Medical Emergency',Description,ReportedBy:req.user.UserID,DateReported:now,Priority:'Critical',Urgency:'High',Status:'Reported',Latitude:Number(Latitude),Longitude:Number(Longitude),IncidentLocation:Address,Timeline:initialTimeline(req.user.UserID),lastUpdated:now}); res.status(201).json({incident});}catch(e){res.status(500).json({error:e.message});}};


exports.donate = async(req,res)=>{try{const amount=Number(req.body.Amount),resourceId=Number(req.body.ResourceID);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({error:'Donation amount must be positive.'});const donation=await Donation.create({DonationID:await nextId(Donation,'DonationID'),Amount:amount,DonatedBy:req.user.UserID,ResourceID:resourceId||1});res.status(201).json({donation});}catch(e){res.status(500).json({error:e.message});}};
exports.donations = async(req,res)=>{try{const rows=await Donation.find().sort({DateDonated:-1}).limit(100).lean();const total=rows.reduce((n,x)=>n+x.Amount,0);res.json({donations:rows,total});}catch(e){res.status(500).json({error:e.message});}};

exports.adminSummary = async(req,res)=>{try{const [users,incidents,resources,tasks]=await Promise.all([User.find().select('-Password').lean(),Incident.find().lean(),Resource.find().lean(),VolunteerTask.find().lean()]); res.json({users,incidents,resources,tasks});}catch(e){res.status(500).json({error:e.message});}};
exports.teamUsers = async(req,res)=>{try{const users=await User.find({UserType:{$in:['volunteer','responder','admin']}}).select('UserID Name Email UserType Available').sort({Name:1}).lean(); res.json({users});}catch(e){res.status(500).json({error:e.message});}};

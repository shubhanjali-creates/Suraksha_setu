const Message=require('../../models/Message');
const User=require('../../models/User');
const getChats=async(req,res)=>{try{const messages=await Message.find({CommunityID:Number(req.params.id)}).sort({CreationTime:1}).limit(200).lean(); const ids=[...new Set(messages.map(m=>m.Sender))]; const users=await User.find({UserID:{$in:ids}}).select('UserID Name').lean(); const names=Object.fromEntries(users.map(u=>[u.UserID,u.Name])); res.json({messages:messages.map(m=>({...m,SenderName:names[m.Sender]||'Community member'}))});}catch(e){res.status(500).json({error:e.message});}};
module.exports={getChats};

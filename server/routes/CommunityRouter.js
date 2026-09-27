const express=require('express'); const router=express.Router();
const auth=require('../middleware/auth'); const op=require('../controllers/Operations');
const {getAnnouncements,getCommunity}=require('../controllers/Community/Announcements'); const {getChats}=require('../controllers/Community/Chat');
router.get('/:id',getCommunity); router.get('/:id/chat',getChats); router.get('/:id/announcements',getAnnouncements);
router.post('/:id/join',auth,op.joinCommunity); router.post('/:id/leave',auth,op.leaveCommunity); router.post('/:id/messages',auth,op.postMessage);
module.exports=router;

const router = require('express').Router();
const { getOrCreateInbox, getMyChats, createGroup,exitGroup , removeMember,makeAdmin , addMember } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');


router.post('/createOrLoad',protect,getOrCreateInbox);
router.get('/getMyChats',protect,getMyChats);
router.post('/createGroup',protect,createGroup);
router.post('/exit', protect, exitGroup);
router.post('/remove', protect, removeMember);
router.post('/make-admin', protect, makeAdmin);
router.post('/addMember',protect,addMember);
module.exports = router;

//6a2e3d1a1d46fdd928a8ae35

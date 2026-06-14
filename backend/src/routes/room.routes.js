const router = require('express').Router();
const {getOrCreateInbox} = require('../controllers/room.controller');
const {getMyChats} = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');


router.post('/createOrLoad',protect,getOrCreateInbox);
router.get('/getMyChats',protect,getMyChats);
module.exports = router;

//6a2e3d1a1d46fdd928a8ae35

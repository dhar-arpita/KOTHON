const router = require('express').Router();
const {searchUsers} = require('../controllers/user.controller');
const {protect} = require('../middleware/auth.middleware');



router.get('/search',protect,searchUsers);

module.exports = router;



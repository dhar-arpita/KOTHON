const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// ─── Validation rules ──────────────────────────────────
const registerRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username min 3 chars'),
  body('mobileNo').notEmpty().withMessage('Mobile number required'),
];

const loginRules = [
  body('loginInput').notEmpty().withMessage('Email or mobile required'),
  body('password').notEmpty().withMessage('Password required'),
];

  
// ─── Routes ────────────────────────────────────────────
router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect,                 getMe);

module.exports = router;

const bcrypt  = require('bcryptjs');
const { signToken, createUserObject } = require('../utils/auth.utils');


const User = require('../models/User.model');



exports.register = async (req, res, next) => {
  try {
    const { username, email, mobileNo, password } = req.body;



    const existmobile = await User.findOne({ mobileNo });
    if (existmobile) {
      return res.status(409).json({ message: 'Mobile number already in use' });
    }

    const existemail = await User.findOne({ email });
    if (existemail) {
      return res.status(409).json({ message: 'Email already in use' });
    }

   

    const user = await User.create({ username, email, password,mobileNo });


   

    const token = signToken(user.id);
    res.status(201).json({ token, user: createUserObject(user) });

  } catch (err) {
    next(err);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { loginInput, password } = req.body;

   

    const user = await User.findOne({$or: [{ email:loginInput }, { mobileNo:loginInput }] }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    res.json({ token, user: createUserObject(user) });

  } catch (err) {
    next(err);
  }
};


exports.getMe = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: createUserObject(user) });
  } catch (err) {
    next(err);
  }
};

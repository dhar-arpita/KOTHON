const jwt = require('jsonwebtoken');

// JWT token বানাও
exports.signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Response-এ password বাদ দিয়ে user object পাঠাও
exports.createUserObject = (user) => ({
  id:       user.id || user._id,
  username: user.username,
  email:    user.email,
  avatar:   user.avatar || null,
});

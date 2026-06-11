const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  // Token আসে Authorization: Bearer <token> header-এ
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // পরের middleware/controller-এ available
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

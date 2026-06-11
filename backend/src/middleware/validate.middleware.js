const { validationResult } = require('express-validator');

// Route-এ validation rules run করার পর এই middleware call হয়।
// Error থাকলে 422 return করে, না থাকলে next() চালায়।
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

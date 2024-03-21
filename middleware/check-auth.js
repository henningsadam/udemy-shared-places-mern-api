const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Auth failed.');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.log(error);
    const err = new HttpError('Authentication failed', 403);
    return next(err);
  }
};

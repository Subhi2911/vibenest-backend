const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuserOptional = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    // no token provided, continue without user info
    return next();
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
  } catch (error) {
    // invalid token, ignore user info but continue
  }
  next();
};

module.exports = fetchuserOptional;

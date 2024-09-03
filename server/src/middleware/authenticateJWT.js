const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token is not valid' });
      }

      req.user = user;
      next(); // Proceed to the next middleware/route handler
    });
  } else {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
};

module.exports = authenticateJWT;

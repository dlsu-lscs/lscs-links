const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token not found, authentication failed' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ status: 'error', message: 'Invalid token, access denied' });

    req.user = user; // Save the user info for the next middleware
    next();
  });
}

module.exports = auth

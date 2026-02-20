const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
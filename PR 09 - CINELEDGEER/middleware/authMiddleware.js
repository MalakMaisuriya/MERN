const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../utils/helpers');

const createToken = user => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    if (req.path.startsWith('/api')) return res.status(401).json({ message: 'Authentication required' });
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('store');
    if (!user || !user.active) throw new Error('Invalid user');
    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.path.startsWith('/api')) return res.status(401).json({ message: 'Invalid or expired token' });
    return res.redirect('/login');
  }
});

module.exports = { protect, createToken };

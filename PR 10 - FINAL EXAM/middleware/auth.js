const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    req.user = null;
    res.locals.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login?error=Please log in first');
  }
  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to view this page.'
      });
    }
    next();
  };
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAuth,
  authorizeRoles
};

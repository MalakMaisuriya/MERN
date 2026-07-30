const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    if (req.path.startsWith('/api')) return res.status(403).json({ message: 'Forbidden' });
    req.flash = { type: 'danger', message: 'You do not have permission to access that page.' };
    return res.status(403).render('errors/403', { title: 'Forbidden' });
  }
  next();
};

module.exports = authorize;

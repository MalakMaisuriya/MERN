const requireAuth = (req, res, next) => {
  if (!req.session.accountId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/sign-in');
  }
  return next();
};

const requireGuest = (req, res, next) => {
  if (req.session.accountId) {
    return res.redirect('/console');
  }
  return next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
      return res.redirect('/auth/sign-in');
    }

    if (!roles.includes(user.role)) {
      return res.status(403).render('errors/forbidden', {
        pageTitle: 'Access Denied',
        layout: 'layouts/auth'
      });
    }

    return next();
  };
};

module.exports = {
  requireAuth,
  requireGuest,
  requireRole
};

const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();

  req.flash('error', 'Please login to continue.');
  return res.redirect('/auth/login');
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) return res.redirect('/dashboard');
  return next();
};

module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated
};

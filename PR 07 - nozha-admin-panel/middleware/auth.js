// Blocks access if the user is not logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.session.errorMessage = "Please login first.";
  res.redirect("/login");
}

// Blocks access to login/register if already logged in
function forwardAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

module.exports = { ensureAuthenticated, forwardAuthenticated };

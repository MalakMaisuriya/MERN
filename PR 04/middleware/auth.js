function requireGuest(req, res, next) {
  if (req.session.user) return res.redirect("/dashboard");
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Please sign in to continue.");
    return res.redirect("/login");
  }

  next();
}

module.exports = {
  requireAuth,
  requireGuest,
};

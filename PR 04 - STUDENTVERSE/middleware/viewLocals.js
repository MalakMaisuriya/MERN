function exposeLocals(req, res, next) {
  res.locals.appName = process.env.APP_NAME || "PR 04 - STUDENTVERSE";
  res.locals.currentUser = req.session.user || null;
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  res.locals.infoMessages = req.flash("info");
  res.locals.currentPath = req.path;
  next();
}

module.exports = { exposeLocals };

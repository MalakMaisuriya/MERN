const notFoundHandler = (req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('errors/not-found', {
      pageTitle: 'Page Not Found',
      layout: req.session.accountId ? 'layouts/console' : 'layouts/public'
    });
  }

  return res.status(404).json({ message: 'Resource not found' });
};

const errorHandler = (err, req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong on our end'
    : err.message;

  if (req.accepts('html')) {
    return res.status(statusCode).render('errors/server-error', {
      pageTitle: 'Server Error',
      layout: req.session.accountId ? 'layouts/console' : 'layouts/public',
      message
    });
  }

  return res.status(statusCode).json({ message });
};

module.exports = {
  notFoundHandler,
  errorHandler
};

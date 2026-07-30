const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (err.name === 'CastError' ? 400 : 500);
  const message = err.code === 11000
    ? 'A duplicate record already exists.'
    : err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => e.message).join(', ')
      : err.message || 'Server error';

  if (req.path.startsWith('/api')) {
    return res.status(status).json({ message });
  }

  res.status(status).render('errors/error', {
    title: status === 404 ? 'Page Not Found' : 'Application Error',
    status,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Something went wrong.' : message
  });
};

module.exports = { notFound, errorHandler };

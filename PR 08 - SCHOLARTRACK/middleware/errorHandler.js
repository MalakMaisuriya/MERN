const mongoose = require('mongoose');

const notFound = (req, res, next) => {
  const error = new Error(`Page not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err instanceof mongoose.Error.CastError ? 404 : 500);

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).render(`errors/${statusCode === 404 ? '404' : '500'}`, {
    title: statusCode === 404 ? 'Page Not Found' : 'Server Error',
    message: statusCode === 404 ? 'The page or record you requested could not be found.' : 'Something went wrong while processing your request.'
  });
};

module.exports = { notFound, errorHandler };

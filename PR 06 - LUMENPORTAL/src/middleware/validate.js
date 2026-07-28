const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().reduce((accumulator, error) => {
    if (!accumulator[error.path]) {
      accumulator[error.path] = error.msg;
    }
    return accumulator;
  }, {});

  req.validationErrors = formattedErrors;
  return next();
};

module.exports = handleValidation;

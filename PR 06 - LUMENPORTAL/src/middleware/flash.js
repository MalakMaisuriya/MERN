const setFlashMessages = (req, res, next) => {
  res.locals.flash = {
    success: req.session.flashSuccess || null,
    error: req.session.flashError || null,
    info: req.session.flashInfo || null
  };

  delete req.session.flashSuccess;
  delete req.session.flashError;
  delete req.session.flashInfo;

  next();
};

const flashSuccess = (req, message) => {
  req.session.flashSuccess = message;
};

const flashError = (req, message) => {
  req.session.flashError = message;
};

const flashInfo = (req, message) => {
  req.session.flashInfo = message;
};

module.exports = {
  setFlashMessages,
  flashSuccess,
  flashError,
  flashInfo
};

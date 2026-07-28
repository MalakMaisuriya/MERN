const upload = require('../../config/multer');

const handleUploadError = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    req.uploadError = 'Image exceeds the maximum allowed file size';
    return next();
  }

  req.uploadError = err.message || 'Unable to process uploaded file';
  return next();
};

const singleImageUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        req.uploadError = err.message;
      }
      next();
    });
  };
};

module.exports = {
  handleUploadError,
  singleImageUpload
};

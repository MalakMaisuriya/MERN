const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadRoot);
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `asset-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new Error('Only JPEG, PNG, WebP, and GIF images are permitted'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
});

module.exports = upload;

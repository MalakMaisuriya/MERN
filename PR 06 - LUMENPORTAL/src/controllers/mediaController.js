const fs = require('fs');
const path = require('path');
const MediaAsset = require('../models/MediaAsset');
const { buildPagination } = require('../utils/helpers');
const { flashSuccess, flashError } = require('../middleware/flash');

const removeStoredFile = (storedName) => {
  const absolutePath = path.join(__dirname, '../../public/uploads', storedName);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

const listMedia = async (req, res) => {
  const { q = '', page = 1 } = req.query;
  const filter = {};

  if (q.trim()) {
    filter.originalName = { $regex: q.trim(), $options: 'i' };
  }

  const totalCount = await MediaAsset.countDocuments(filter);
  const pagination = buildPagination({ page, limit: 12, totalCount });

  const assets = await MediaAsset.find(filter)
    .populate('uploadedBy', 'fullName')
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.perPage)
    .lean();

  res.render('media/index', {
    pageTitle: 'Media Vault',
    activeNav: 'media',
    assets,
    pagination,
    filters: { q }
  });
};

const uploadMedia = async (req, res) => {
  if (req.uploadError) {
    flashError(req, req.uploadError);
    return res.redirect('/console/media');
  }

  if (!req.file) {
    flashError(req, 'Select an image to upload');
    return res.redirect('/console/media');
  }

  await MediaAsset.create({
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    uploadedBy: res.locals.currentUser._id,
    altText: req.body.altText || req.file.originalname
  });

  flashSuccess(req, 'Media uploaded successfully');
  return res.redirect('/console/media');
};

const deleteMedia = async (req, res) => {
  const asset = await MediaAsset.findByIdAndDelete(req.params.id);

  if (!asset) {
    flashError(req, 'Media asset not found');
  } else {
    removeStoredFile(asset.storedName);
    flashSuccess(req, 'Media asset deleted');
  }

  return res.redirect('/console/media');
};

module.exports = {
  listMedia,
  uploadMedia,
  deleteMedia
};

const fs = require('fs');
const path = require('path');
const Publication = require('../models/Publication');
const Topic = require('../models/Topic');
const { buildPagination, parseSort } = require('../utils/helpers');
const { flashSuccess, flashError } = require('../middleware/flash');

const SORTABLE_FIELDS = ['headline', 'status', 'createdAt', 'updatedAt', 'viewCount'];

const removeStoredImage = (storedPath) => {
  if (!storedPath) {
    return;
  }
  const absolutePath = path.join(__dirname, '../../public', storedPath.replace(/^\//, ''));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

const buildPublicationFilter = (query) => {
  const filter = {};
  const { q, status, topic } = query;

  if (q?.trim()) {
    filter.$text = { $search: q.trim() };
  }

  if (status) {
    filter.status = status;
  }

  if (topic) {
    filter.topic = topic;
  }

  return filter;
};

const listPublications = async (req, res) => {
  const { sort = '-updatedAt', page = 1, q, status, topic } = req.query;
  const filter = buildPublicationFilter(req.query);
  const sortCriteria = parseSort(sort, SORTABLE_FIELDS);
  const totalCount = await Publication.countDocuments(filter);
  const pagination = buildPagination({ page, limit: 10, totalCount });

  const [publications, topics] = await Promise.all([
    Publication.find(filter)
      .populate('topic', 'title accentColor')
      .populate('author', 'fullName')
      .sort(sortCriteria)
      .skip(pagination.skip)
      .limit(pagination.perPage)
      .lean(),
    Topic.find().sort({ title: 1 }).select('title').lean()
  ]);

  res.render('publications/index', {
    pageTitle: 'Publications',
    activeNav: 'publications',
    publications,
    topics,
    pagination,
    filters: { q, status, topic, sort }
  });
};

const showCreateForm = async (_req, res) => {
  const topics = await Topic.find().sort({ title: 1 }).lean();

  res.render('publications/form', {
    pageTitle: 'New Publication',
    activeNav: 'publications',
    formAction: '/console/publications',
    formMethod: 'POST',
    publication: { status: 'draft', readingMinutes: 3 },
    topics,
    fieldErrors: {}
  });
};

const createPublication = async (req, res) => {
  const topics = await Topic.find().sort({ title: 1 }).lean();

  if (req.validationErrors || req.uploadError) {
    return res.status(422).render('publications/form', {
      pageTitle: 'New Publication',
      activeNav: 'publications',
      formAction: '/console/publications',
      formMethod: 'POST',
      publication: req.body,
      topics,
      fieldErrors: {
        ...req.validationErrors,
        ...(req.uploadError ? { coverImage: req.uploadError } : {})
      }
    });
  }

  const coverImage = req.file ? `/uploads/${req.file.filename}` : '';

  await Publication.create({
    headline: req.body.headline,
    summary: req.body.summary,
    body: req.body.body,
    status: req.body.status,
    topic: req.body.topic,
    readingMinutes: req.body.readingMinutes || 3,
    coverImage,
    author: res.locals.currentUser._id
  });

  flashSuccess(req, 'Publication created successfully');
  return res.redirect('/console/publications');
};

const showEditForm = async (req, res) => {
  const [publication, topics] = await Promise.all([
    Publication.findById(req.params.id).lean(),
    Topic.find().sort({ title: 1 }).lean()
  ]);

  if (!publication) {
    flashError(req, 'Publication not found');
    return res.redirect('/console/publications');
  }

  res.render('publications/form', {
    pageTitle: 'Edit Publication',
    activeNav: 'publications',
    formAction: `/console/publications/${publication._id}?_method=PUT`,
    formMethod: 'POST',
    publication,
    topics,
    fieldErrors: {}
  });
};

const updatePublication = async (req, res) => {
  const publication = await Publication.findById(req.params.id);
  const topics = await Topic.find().sort({ title: 1 }).lean();

  if (!publication) {
    flashError(req, 'Publication not found');
    return res.redirect('/console/publications');
  }

  if (req.validationErrors || req.uploadError) {
    return res.status(422).render('publications/form', {
      pageTitle: 'Edit Publication',
      activeNav: 'publications',
      formAction: `/console/publications/${publication._id}?_method=PUT`,
      formMethod: 'POST',
      publication: { ...publication.toObject(), ...req.body },
      topics,
      fieldErrors: {
        ...req.validationErrors,
        ...(req.uploadError ? { coverImage: req.uploadError } : {})
      }
    });
  }

  if (req.file) {
    removeStoredImage(publication.coverImage);
    publication.coverImage = `/uploads/${req.file.filename}`;
  }

  publication.headline = req.body.headline;
  publication.summary = req.body.summary;
  publication.body = req.body.body;
  publication.status = req.body.status;
  publication.topic = req.body.topic;
  publication.readingMinutes = req.body.readingMinutes || publication.readingMinutes;

  await publication.save();
  flashSuccess(req, 'Publication updated successfully');
  return res.redirect('/console/publications');
};

const deletePublication = async (req, res) => {
  const publication = await Publication.findByIdAndDelete(req.params.id);

  if (!publication) {
    flashError(req, 'Publication not found');
  } else {
    removeStoredImage(publication.coverImage);
    flashSuccess(req, 'Publication deleted successfully');
  }

  return res.redirect('/console/publications');
};

module.exports = {
  listPublications,
  showCreateForm,
  createPublication,
  showEditForm,
  updatePublication,
  deletePublication
};

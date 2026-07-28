const Publication = require('../models/Publication');
const Topic = require('../models/Topic');
const { buildPagination } = require('../utils/helpers');

const showHome = async (req, res) => {
  const featured = await Publication.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate('topic', 'title accentColor slug')
    .populate('author', 'fullName')
    .lean();

  const topics = await Topic.find()
    .sort({ title: 1 })
    .limit(8)
    .lean();

  res.render('public/home', {
    pageTitle: 'Campus Publications',
    layout: 'layouts/public',
    featured,
    topics,
    metaDescription: 'Discover curated campus publications, research highlights, and student stories on LumenPortal.'
  });
};

const listPublished = async (req, res) => {
  const { q = '', topic, page = 1 } = req.query;
  const filter = { status: 'published' };

  if (q.trim()) {
    filter.$text = { $search: q.trim() };
  }

  if (topic) {
    filter.topic = topic;
  }

  const totalCount = await Publication.countDocuments(filter);
  const pagination = buildPagination({ page, limit: 9, totalCount });

  const [publications, topics] = await Promise.all([
    Publication.find(filter)
      .populate('topic', 'title accentColor slug')
      .populate('author', 'fullName')
      .sort({ publishedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.perPage)
      .lean(),
    Topic.find().sort({ title: 1 }).lean()
  ]);

  res.render('public/catalog', {
    pageTitle: 'Browse Publications',
    layout: 'layouts/public',
    publications,
    topics,
    pagination,
    filters: { q, topic },
    metaDescription: 'Browse published campus articles filtered by topic and keyword search.'
  });
};

const showPublication = async (req, res) => {
  const publication = await Publication.findOne({
    slug: req.params.slug,
    status: 'published'
  })
    .populate('topic', 'title accentColor slug')
    .populate('author', 'fullName avatarUrl')
    .lean();

  if (!publication) {
    return res.status(404).render('errors/not-found', {
      pageTitle: 'Publication Not Found',
      layout: 'layouts/public'
    });
  }

  await Publication.updateOne({ _id: publication._id }, { $inc: { viewCount: 1 } });

  const related = await Publication.find({
    _id: { $ne: publication._id },
    status: 'published',
    topic: publication.topic._id
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate('topic', 'title accentColor')
    .select('headline slug summary coverImage readingMinutes publishedAt')
    .lean();

  res.render('public/detail', {
    pageTitle: publication.headline,
    layout: 'layouts/public',
    publication,
    related,
    metaDescription: publication.summary
  });
};

module.exports = {
  showHome,
  listPublished,
  showPublication
};

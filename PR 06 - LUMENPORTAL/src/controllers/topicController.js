const Topic = require('../models/Topic');
const { buildPagination, parseSort } = require('../utils/helpers');
const { flashSuccess, flashError } = require('../middleware/flash');

const SORTABLE_FIELDS = ['title', 'createdAt', 'updatedAt'];

const listTopics = async (req, res) => {
  const { q = '', status, sort = '-createdAt', page = 1 } = req.query;
  const filter = {};

  if (q.trim()) {
    filter.title = { $regex: q.trim(), $options: 'i' };
  }

  const sortCriteria = parseSort(sort, SORTABLE_FIELDS);
  const totalCount = await Topic.countDocuments(filter);
  const pagination = buildPagination({ page, limit: 10, totalCount });

  const topics = await Topic.find(filter)
    .populate('createdBy', 'fullName')
    .sort(sortCriteria)
    .skip(pagination.skip)
    .limit(pagination.perPage)
    .lean();

  res.render('topics/index', {
    pageTitle: 'Topics',
    activeNav: 'topics',
    topics,
    pagination,
    filters: { q, sort }
  });
};

const showCreateForm = (_req, res) => {
  res.render('topics/form', {
    pageTitle: 'New Topic',
    activeNav: 'topics',
    formAction: '/console/topics',
    formMethod: 'POST',
    topic: {},
    fieldErrors: {}
  });
};

const createTopic = async (req, res) => {
  if (req.validationErrors) {
    return res.status(422).render('topics/form', {
      pageTitle: 'New Topic',
      activeNav: 'topics',
      formAction: '/console/topics',
      formMethod: 'POST',
      topic: req.body,
      fieldErrors: req.validationErrors
    });
  }

  try {
    await Topic.create({
      title: req.body.title,
      description: req.body.description,
      accentColor: req.body.accentColor || '#6366f1',
      createdBy: res.locals.currentUser._id
    });
    flashSuccess(req, 'Topic created successfully');
    return res.redirect('/console/topics');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render('topics/form', {
        pageTitle: 'New Topic',
        activeNav: 'topics',
        formAction: '/console/topics',
        formMethod: 'POST',
        topic: req.body,
        fieldErrors: { title: 'A topic with a similar title already exists' }
      });
    }
    throw error;
  }
};

const showEditForm = async (req, res) => {
  const topic = await Topic.findById(req.params.id).lean();

  if (!topic) {
    flashError(req, 'Topic not found');
    return res.redirect('/console/topics');
  }

  res.render('topics/form', {
    pageTitle: 'Edit Topic',
    activeNav: 'topics',
    formAction: `/console/topics/${topic._id}?_method=PUT`,
    formMethod: 'POST',
    topic,
    fieldErrors: {}
  });
};

const updateTopic = async (req, res) => {
  const topic = await Topic.findById(req.params.id);

  if (!topic) {
    flashError(req, 'Topic not found');
    return res.redirect('/console/topics');
  }

  if (req.validationErrors) {
    return res.status(422).render('topics/form', {
      pageTitle: 'Edit Topic',
      activeNav: 'topics',
      formAction: `/console/topics/${topic._id}?_method=PUT`,
      formMethod: 'POST',
      topic: { ...topic.toObject(), ...req.body },
      fieldErrors: req.validationErrors
    });
  }

  topic.title = req.body.title;
  topic.description = req.body.description;
  topic.accentColor = req.body.accentColor || topic.accentColor;

  try {
    await topic.save();
    flashSuccess(req, 'Topic updated successfully');
    return res.redirect('/console/topics');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render('topics/form', {
        pageTitle: 'Edit Topic',
        activeNav: 'topics',
        formAction: `/console/topics/${topic._id}?_method=PUT`,
        formMethod: 'POST',
        topic: { ...topic.toObject(), ...req.body },
        fieldErrors: { title: 'A topic with a similar title already exists' }
      });
    }
    throw error;
  }
};

const deleteTopic = async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);

  if (!topic) {
    flashError(req, 'Topic not found');
  } else {
    flashSuccess(req, 'Topic removed successfully');
  }

  return res.redirect('/console/topics');
};

module.exports = {
  listTopics,
  showCreateForm,
  createTopic,
  showEditForm,
  updateTopic,
  deleteTopic
};

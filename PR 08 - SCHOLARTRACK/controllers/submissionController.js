const mongoose = require('mongoose');
const Submission = require('../models/Submission');

const TYPES = ['Assignment', 'Practical', 'Presentation', 'Mini Project', 'Report'];
const STATUSES = ['Planned', 'In Progress', 'Submitted', 'Reviewed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const getFormOptions = () => ({
  types: TYPES,
  statuses: STATUSES,
  priorities: PRIORITIES
});

const buildQuery = (req) => {
  const query = { owner: req.session.user.id };
  const { search, status, type, priority } = req.query;

  if (search && search.trim()) {
    const pattern = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ title: pattern }, { subject: pattern }, { notes: pattern }];
  }

  if (STATUSES.includes(status)) query.status = status;
  if (TYPES.includes(type)) query.type = type;
  if (PRIORITIES.includes(priority)) query.priority = priority;

  return query;
};

const listSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 8;
    const sortMap = {
      newest: { createdAt: -1 },
      dueSoon: { dueDate: 1 },
      title: { title: 1 },
      priority: { priority: -1 }
    };
    const sort = sortMap[req.query.sort] || sortMap.newest;
    const query = buildQuery(req);

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Submission.countDocuments(query)
    ]);

    res.render('submissions/index', {
      title: 'Submissions',
      submissions,
      filters: req.query,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
      ...getFormOptions()
    });
  } catch (error) {
    next(error);
  }
};

const showNewForm = (req, res) => {
  res.render('submissions/new', {
    title: 'New Submission',
    formData: {},
    ...getFormOptions()
  });
};

const createSubmission = async (req, res, next) => {
  try {
    await Submission.create({
      ...req.body,
      marks: req.body.marks || null,
      owner: req.session.user.id
    });

    req.flash('success', 'Submission created successfully.');
    res.redirect('/submissions');
  } catch (error) {
    next(error);
  }
};

const getOwnedSubmission = async (id, owner) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Submission.findOne({ _id: id, owner });
};

const showSubmission = async (req, res, next) => {
  try {
    const submission = await getOwnedSubmission(req.params.id, req.session.user.id);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    res.render('submissions/show', {
      title: submission.title,
      submission
    });
  } catch (error) {
    next(error);
  }
};

const showEditForm = async (req, res, next) => {
  try {
    const submission = await getOwnedSubmission(req.params.id, req.session.user.id);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    res.render('submissions/edit', {
      title: 'Edit Submission',
      formData: submission,
      submission,
      ...getFormOptions()
    });
  } catch (error) {
    next(error);
  }
};

const updateSubmission = async (req, res, next) => {
  try {
    const submission = await getOwnedSubmission(req.params.id, req.session.user.id);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(submission, {
      ...req.body,
      marks: req.body.marks || null
    });
    await submission.save();

    req.flash('success', 'Submission updated successfully.');
    res.redirect(`/submissions/${submission._id}`);
  } catch (error) {
    next(error);
  }
};

const deleteSubmission = async (req, res, next) => {
  try {
    const submission = await getOwnedSubmission(req.params.id, req.session.user.id);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    await submission.deleteOne();
    req.flash('success', 'Submission deleted successfully.');
    res.redirect('/submissions');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  TYPES,
  STATUSES,
  PRIORITIES,
  getFormOptions,
  listSubmissions,
  showNewForm,
  createSubmission,
  showSubmission,
  showEditForm,
  updateSubmission,
  deleteSubmission
};

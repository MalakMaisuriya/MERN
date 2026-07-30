const mongoose = require('mongoose');
const Submission = require('../models/Submission');

const dashboard = async (req, res, next) => {
  try {
    const owner = req.session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ownerId = new mongoose.Types.ObjectId(owner);

    const [total, active, overdue, reviewed, recent, statusBreakdown, priorityBreakdown] = await Promise.all([
      Submission.countDocuments({ owner }),
      Submission.countDocuments({ owner, status: { $in: ['Planned', 'In Progress'] } }),
      Submission.countDocuments({ owner, dueDate: { $lt: today }, status: { $nin: ['Submitted', 'Reviewed'] } }),
      Submission.countDocuments({ owner, status: 'Reviewed' }),
      Submission.find({ owner }).sort({ createdAt: -1 }).limit(5).lean(),
      Submission.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Submission.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.render('dashboard/index', {
      title: 'Dashboard',
      stats: { total, active, overdue, reviewed },
      recent,
      statusBreakdown,
      priorityBreakdown
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { dashboard };

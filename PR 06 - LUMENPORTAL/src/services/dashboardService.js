const Publication = require('../models/Publication');
const Topic = require('../models/Topic');
const MediaAsset = require('../models/MediaAsset');
const Account = require('../models/Account');

const getDashboardMetrics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    publicationCounts,
    topicCount,
    mediaCount,
    accountCount,
    recentPublications,
    monthlyTrend,
    statusDistribution,
    topTopics
  ] = await Promise.all([
    Publication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Topic.countDocuments(),
    MediaAsset.countDocuments(),
    Account.countDocuments({ isActive: true }),
    Publication.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('topic', 'title accentColor')
      .populate('author', 'fullName')
      .lean(),
    Publication.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Publication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Publication.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topic'
        }
      },
      { $unwind: '$topic' },
      {
        $project: {
          title: '$topic.title',
          accentColor: '$topic.accentColor',
          count: 1
        }
      }
    ])
  ]);

  const statusMap = publicationCounts.reduce((map, item) => {
    map[item._id] = item.count;
    return map;
  }, {});

  return {
    totals: {
      publications: Object.values(statusMap).reduce((sum, value) => sum + value, 0),
      published: statusMap.published || 0,
      drafts: statusMap.draft || 0,
      archived: statusMap.archived || 0,
      topics: topicCount,
      media: mediaCount,
      accounts: accountCount
    },
    recentPublications,
    monthlyTrend,
    statusDistribution,
    topTopics
  };
};

module.exports = {
  getDashboardMetrics
};

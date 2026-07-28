const { getDashboardMetrics } = require('../services/dashboardService');

const showDashboard = async (_req, res) => {
  const metrics = await getDashboardMetrics();

  res.render('dashboard/index', {
    pageTitle: 'Overview',
    activeNav: 'overview',
    metrics,
    chartData: {
      trendLabels: metrics.monthlyTrend.map((item) => item._id),
      trendValues: metrics.monthlyTrend.map((item) => item.total),
      statusLabels: metrics.statusDistribution.map((item) => item._id),
      statusValues: metrics.statusDistribution.map((item) => item.count),
      topicLabels: metrics.topTopics.map((item) => item.title),
      topicValues: metrics.topTopics.map((item) => item.count),
      topicColors: metrics.topTopics.map((item) => item.accentColor)
    }
  });
};

module.exports = {
  showDashboard
};

const Movie = require('../models/Movie');
const Customer = require('../models/Customer');
const Actor = require('../models/Actor');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const [
    totalMovies, totalCustomers, totalActors, totalCategories,
    availableInventory, activeRentals, returnedRentals, revenueAgg,
    recentRentals, recentPayments, popularMovies, activeCustomers, monthlyRevenue
  ] = await Promise.all([
    Movie.countDocuments({ active: true }),
    Customer.countDocuments({ active: true }),
    Actor.countDocuments(),
    Category.countDocuments(),
    Inventory.countDocuments({ available: true }),
    Rental.countDocuments({ status: 'Active' }),
    Rental.countDocuments({ status: 'Returned' }),
    Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Rental.find().sort({ createdAt: -1 }).limit(6).populate('customer inventory staff').populate({ path: 'inventory', populate: 'movie store' }),
    Payment.find().sort({ paymentDate: -1 }).limit(6).populate('customer rental staff'),
    Rental.aggregate([{ $group: { _id: '$inventory', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Rental.aggregate([{ $group: { _id: '$customer', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ])
  ]);

  const populatedPopular = await Inventory.populate(popularMovies, { path: '_id', populate: { path: 'movie' } });
  const populatedCustomers = await Customer.populate(activeCustomers, { path: '_id' });

  res.render('dashboard/index', {
    title: 'Dashboard',
    stats: { totalMovies, totalCustomers, totalActors, totalCategories, availableInventory, activeRentals, returnedRentals, totalRevenue: revenueAgg[0]?.total || 0 },
    recentRentals,
    recentPayments,
    popularMovies: populatedPopular,
    activeCustomers: populatedCustomers,
    monthlyRevenue
  });
});

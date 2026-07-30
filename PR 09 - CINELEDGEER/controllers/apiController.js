const Movie = require('../models/Movie');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Inventory = require('../models/Inventory');
const { asyncHandler } = require('../utils/helpers');

// Movies
exports.getMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ active: true }).populate('language actors categories');
  res.json({ success: true, count: movies.length, data: movies });
});

exports.getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate('language actors categories');
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  res.json({ success: true, data: movie });
});

exports.createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({ success: true, data: movie });
});

exports.updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
  res.json({ success: true, data: movie });
});

exports.deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  res.json({ success: true, data: movie });
});

// Customers
exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().populate('store address');
  res.json({ success: true, count: customers.length, data: customers });
});

exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('store address');
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, data: customer });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: customer });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  res.json({ success: true, data: customer });
});

// Rentals
exports.getRentals = asyncHandler(async (req, res) => {
  const rentals = await Rental.find().populate('customer staff').populate({ path: 'inventory', populate: 'movie store' });
  res.json({ success: true, count: rentals.length, data: rentals });
});

exports.createRental = asyncHandler(async (req, res) => {
  const { customer, inventory, paymentMethod } = req.body;
  const item = await Inventory.findOne({ _id: inventory, available: true, status: 'Available' }).populate('movie');
  if (!item) return res.status(400).json({ success: false, message: 'Selected inventory copy is not available' });

  const rental = await Rental.create({
    customer,
    inventory: item._id,
    staff: req.user._id,
    rentalAmount: item.movie.rentalRate
  });

  item.status = 'Rented';
  item.available = false;
  await item.save();

  const payment = await Payment.create({
    customer,
    rental: rental._id,
    staff: req.user._id,
    amount: rental.rentalAmount,
    paymentMethod: paymentMethod || 'Cash',
    status: 'Paid'
  });

  res.status(201).json({ success: true, data: { rental, payment } });
});

exports.returnRental = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental || rental.status !== 'Active') return res.status(404).json({ success: false, message: 'Active rental not found' });

  rental.status = 'Returned';
  rental.returnDate = new Date();
  await rental.save();

  await Inventory.findByIdAndUpdate(rental.inventory, { status: 'Available', available: true });

  res.json({ success: true, data: rental });
});

// Payments
exports.getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('customer rental staff');
  res.json({ success: true, count: payments.length, data: payments });
});

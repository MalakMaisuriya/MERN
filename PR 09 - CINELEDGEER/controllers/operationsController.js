const { validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');
const Inventory = require('../models/Inventory');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const Customer = require('../models/Customer');
const Address = require('../models/Address');
const City = require('../models/City');
const Country = require('../models/Country');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

exports.storesIndex = asyncHandler(async (req, res) => {
  const query = req.query.search ? { name: buildRegex(req.query.search) } : {};
  const data = await paginate(Store, query, { page: req.query.page, populate: ['manager', { path: 'address', populate: { path: 'city', populate: 'country' } }] });
  res.render('stores/index', { title: 'Stores', ...data, filters: req.query });
});
exports.storeForm = asyncHandler(async (req, res) => {
  const store = req.params.id ? await Store.findById(req.params.id) : {};
  res.render('stores/form', { title: req.params.id ? 'Edit Store' : 'Add Store', store, errors: [], managers: await User.find({ role: { $in: ['Admin', 'Staff'] } }), addresses: await Address.find().populate('city') });
});
exports.storeSave = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  const data = { managers: await User.find(), addresses: await Address.find().populate('city') };
  if (!errors.isEmpty()) return res.status(422).render('stores/form', { title: req.params.id ? 'Edit Store' : 'Add Store', store: { _id: req.params.id, ...req.body }, errors: errors.array(), ...data });
  if (req.params.id) await Store.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  else await Store.create(req.body);
  res.redirect('/stores');
});
exports.storeDelete = asyncHandler(async (req, res) => { await Store.findByIdAndUpdate(req.params.id, { active: false }); res.redirect('/stores'); });
exports.storeShow = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('manager').populate({ path: 'address', populate: { path: 'city', populate: 'country' } });
  const [inventory, rentals] = await Promise.all([
    Inventory.find({ store: store._id }).populate('movie'),
    Rental.find().populate('customer').populate({ path: 'inventory', match: { store: store._id }, populate: 'movie' })
  ]);
  res.render('stores/show', { title: store.name, store, inventory, rentals: rentals.filter(r => r.inventory) });
});

exports.inventoryIndex = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.store) query.store = req.query.store;
  if (req.query.movie) query.movie = req.query.movie;
  if (req.query.status) query.status = req.query.status;
  const data = await paginate(Inventory, query, { page: req.query.page, populate: ['movie', 'store'] });
  res.render('inventory/index', { title: 'Inventory', ...data, filters: req.query, stores: await Store.find({ active: true }), movies: await Movie.find({ active: true }) });
});
exports.inventoryForm = asyncHandler(async (req, res) => {
  const item = req.params.id ? await Inventory.findById(req.params.id) : {};
  res.render('inventory/form', { title: req.params.id ? 'Edit Inventory' : 'Add Inventory', item, errors: [], movies: await Movie.find({ active: true }), stores: await Store.find({ active: true }) });
});
exports.inventorySave = asyncHandler(async (req, res) => {
  const payload = { ...req.body, available: req.body.status === 'Available' };
  if (req.params.id) await Inventory.findByIdAndUpdate(req.params.id, payload, { runValidators: true });
  else await Inventory.create(payload);
  res.redirect('/inventory');
});
exports.inventoryStatus = asyncHandler(async (req, res) => {
  await Inventory.findByIdAndUpdate(req.params.id, { status: req.body.status, available: req.body.status === 'Available' });
  res.redirect('/inventory');
});

exports.rentalsIndex = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const data = await paginate(Rental, query, { page: req.query.page, populate: ['customer', 'staff', { path: 'inventory', populate: 'movie store' }] });
  res.render('rentals/index', { title: 'Rentals', ...data, filters: req.query });
});
exports.rentalForm = asyncHandler(async (req, res) => res.render('rentals/form', {
  title: 'Create Rental',
  errors: [],
  customers: await Customer.find({ active: true }).sort('firstName'),
  inventory: await Inventory.find({ available: true, status: 'Available' }).populate('movie store').sort('-createdAt')
}));
exports.rentalCreate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('rentals/form', { title: 'Create Rental', errors: errors.array(), customers: await Customer.find({ active: true }), inventory: await Inventory.find({ available: true }).populate('movie store') });
  const inventory = await Inventory.findOne({ _id: req.body.inventory, available: true, status: 'Available' }).populate('movie');
  if (!inventory) throw Object.assign(new Error('Selected inventory is not available'), { statusCode: 400 });
  const rental = await Rental.create({ customer: req.body.customer, inventory: inventory._id, staff: req.user._id, rentalAmount: req.body.rentalAmount || inventory.movie.rentalRate });
  await Payment.create({ customer: req.body.customer, rental: rental._id, staff: req.user._id, amount: rental.rentalAmount, paymentMethod: req.body.paymentMethod, status: 'Paid' });
  inventory.status = 'Rented';
  inventory.available = false;
  await inventory.save();
  res.redirect('/rentals');
});
exports.rentalReturn = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental || rental.status !== 'Active') throw Object.assign(new Error('Active rental not found'), { statusCode: 404 });
  rental.status = 'Returned';
  rental.returnDate = new Date();
  await rental.save();
  await Inventory.findByIdAndUpdate(rental.inventory, { status: 'Available', available: true });
  res.redirect('/rentals');
});

exports.paymentsIndex = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.customer) query.customer = req.query.customer;
  if (req.query.status) query.status = req.query.status;
  if (req.query.from || req.query.to) query.paymentDate = {};
  if (req.query.from) query.paymentDate.$gte = new Date(req.query.from);
  if (req.query.to) query.paymentDate.$lte = new Date(req.query.to);
  const data = await paginate(Payment, query, { page: req.query.page, populate: ['customer', 'rental', 'staff'] });
  res.render('payments/index', { title: 'Payments', ...data, filters: req.query, customers: await Customer.find({ active: true }) });
});
exports.paymentForm = asyncHandler(async (req, res) => res.render('payments/form', { title: 'Create Payment', errors: [], rentals: await Rental.find().populate('customer inventory'), customers: await Customer.find({ active: true }) }));
exports.paymentCreate = asyncHandler(async (req, res) => {
  await Payment.create({ ...req.body, staff: req.user._id });
  res.redirect('/payments');
});

exports.locationsIndex = asyncHandler(async (req, res) => res.render('locations/index', {
  title: 'Locations',
  countries: await Country.find().sort('name'),
  cities: await City.find().populate('country').sort('name'),
  addresses: await Address.find().populate({ path: 'city', populate: 'country' }).sort('-createdAt')
}));
exports.locationCreate = asyncHandler(async (req, res) => {
  if (req.body.type === 'country') await Country.create({ name: req.body.name });
  if (req.body.type === 'city') await City.create({ name: req.body.name, country: req.body.country });
  if (req.body.type === 'address') await Address.create(req.body);
  res.redirect('/locations');
});

exports.staffIndex = asyncHandler(async (req, res) => {
  const data = await paginate(User, {}, { page: req.query.page, populate: ['store'] });
  res.render('staff/index', { title: 'Staff', ...data });
});
exports.staffForm = asyncHandler(async (req, res) => res.render('staff/form', { title: 'Add Staff', user: {}, stores: await Store.find({ active: true }), errors: [] }));
exports.staffCreate = asyncHandler(async (req, res) => {
  await User.create(req.body);
  res.redirect('/staff');
});

exports.apiRentals = asyncHandler(async (req, res) => res.json(await Rental.find().populate('customer inventory staff')));
exports.apiCreateRental = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ _id: req.body.inventory, available: true, status: 'Available' }).populate('movie');
  if (!inventory) return res.status(400).json({ message: 'Selected inventory is not available' });
  const rental = await Rental.create({ customer: req.body.customer, inventory: inventory._id, staff: req.user._id, rentalAmount: req.body.rentalAmount || inventory.movie.rentalRate });
  const payment = await Payment.create({ customer: req.body.customer, rental: rental._id, staff: req.user._id, amount: rental.rentalAmount, paymentMethod: req.body.paymentMethod || 'Cash', status: 'Paid' });
  inventory.status = 'Rented';
  inventory.available = false;
  await inventory.save();
  res.status(201).json({ rental, payment });
});
exports.apiReturnRental = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental || rental.status !== 'Active') return res.status(404).json({ message: 'Active rental not found' });
  rental.status = 'Returned';
  rental.returnDate = new Date();
  await rental.save();
  await Inventory.findByIdAndUpdate(rental.inventory, { status: 'Available', available: true });
  res.json(rental);
});
exports.apiPayments = asyncHandler(async (req, res) => res.json(await Payment.find().populate('customer rental staff')));

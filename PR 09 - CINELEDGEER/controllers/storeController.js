const { validationResult } = require('express-validator');
const Store = require('../models/Store');
const User = require('../models/User');
const Address = require('../models/Address');
const Inventory = require('../models/Inventory');
const Rental = require('../models/Rental');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = buildRegex(req.query.search);
  }
  const data = await paginate(Store, query, {
    page: req.query.page,
    limit: 10,
    populate: ['manager', { path: 'address', populate: { path: 'city', populate: 'country' } }]
  });
  res.render('stores/index', { title: 'Stores', ...data, filters: req.query });
});

exports.new = asyncHandler(async (req, res) => {
  const [managers, addresses] = await Promise.all([
    User.find({ role: { $in: ['Admin', 'Staff'] } }),
    Address.find().populate('city')
  ]);
  res.render('stores/form', { title: 'Add Store', store: {}, managers, addresses, errors: [] });
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [managers, addresses] = await Promise.all([
      User.find({ role: { $in: ['Admin', 'Staff'] } }),
      Address.find().populate('city')
    ]);
    return res.status(422).render('stores/form', { title: 'Add Store', store: req.body, managers, addresses, errors: errors.array() });
  }
  const store = await Store.create(req.body);
  res.setFlash('success', 'Store created successfully');
  res.redirect(`/stores/${store._id}`);
});

exports.show = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate('manager')
    .populate({ path: 'address', populate: { path: 'city', populate: 'country' } });

  if (!store) throw Object.assign(new Error('Store not found'), { statusCode: 404 });

  const [inventory, rentals] = await Promise.all([
    Inventory.find({ store: store._id }).populate('movie'),
    Rental.find().populate('customer staff').populate({
      path: 'inventory',
      match: { store: store._id },
      populate: 'movie'
    })
  ]);

  const storeRentals = rentals.filter(r => r.inventory);

  res.render('stores/show', {
    title: store.name,
    store,
    inventory,
    rentals: storeRentals
  });
});

exports.edit = asyncHandler(async (req, res) => {
  const [store, managers, addresses] = await Promise.all([
    Store.findById(req.params.id),
    User.find({ role: { $in: ['Admin', 'Staff'] } }),
    Address.find().populate('city')
  ]);
  if (!store) throw Object.assign(new Error('Store not found'), { statusCode: 404 });
  res.render('stores/form', { title: 'Edit Store', store, managers, addresses, errors: [] });
});

exports.update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [managers, addresses] = await Promise.all([
      User.find({ role: { $in: ['Admin', 'Staff'] } }),
      Address.find().populate('city')
    ]);
    return res.status(422).render('stores/form', { title: 'Edit Store', store: { _id: req.params.id, ...req.body }, managers, addresses, errors: errors.array() });
  }
  await Store.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  res.setFlash('success', 'Store updated successfully');
  res.redirect(`/stores/${req.params.id}`);
});

exports.destroy = asyncHandler(async (req, res) => {
  await Store.findByIdAndUpdate(req.params.id, { active: false });
  res.setFlash('success', 'Store deactivated successfully');
  res.redirect('/stores');
});

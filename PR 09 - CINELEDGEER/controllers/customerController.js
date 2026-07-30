const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Address = require('../models/Address');
const City = require('../models/City');
const Store = require('../models/Store');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

const formData = async () => ({ addresses: await Address.find().populate('city').sort('-createdAt'), stores: await Store.find({ active: true }).sort('name'), cities: await City.find().populate('country').sort('name') });

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.search) query.$or = [{ firstName: buildRegex(req.query.search) }, { lastName: buildRegex(req.query.search) }, { email: buildRegex(req.query.search) }, { phone: buildRegex(req.query.search) }];
  if (req.query.active) query.active = req.query.active === 'true';
  const data = await paginate(Customer, query, { page: req.query.page, populate: ['store', { path: 'address', populate: { path: 'city', populate: 'country' } }] });
  res.render('customers/index', { title: 'Customers', ...data, filters: req.query });
});

exports.new = asyncHandler(async (req, res) => res.render('customers/form', { title: 'Add Customer', customer: {}, errors: [], ...(await formData()) }));
exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('customers/form', { title: 'Add Customer', customer: req.body, errors: errors.array(), ...(await formData()) });
  await Customer.create(req.body);
  res.redirect('/customers');
});
exports.show = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('store').populate({ path: 'address', populate: { path: 'city', populate: 'country' } });
  if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  const [rentals, payments, spend] = await Promise.all([
    Rental.find({ customer: customer._id }).populate({ path: 'inventory', populate: 'movie store' }).sort('-rentalDate'),
    Payment.find({ customer: customer._id }).populate('rental staff').sort('-paymentDate'),
    Payment.aggregate([{ $match: { customer: customer._id, status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);
  res.render('customers/show', { title: `${customer.firstName} ${customer.lastName}`, customer, rentals, payments, totalSpending: spend[0]?.total || 0 });
});
exports.edit = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  res.render('customers/form', { title: 'Edit Customer', customer, errors: [], ...(await formData()) });
});
exports.update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('customers/form', { title: 'Edit Customer', customer: { _id: req.params.id, ...req.body }, errors: errors.array(), ...(await formData()) });
  await Customer.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  res.redirect(`/customers/${req.params.id}`);
});
exports.destroy = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, { active: false });
  res.redirect('/customers');
});

exports.apiIndex = asyncHandler(async (req, res) => res.json(await Customer.find().populate('store address')));
exports.apiCreate = asyncHandler(async (req, res) => res.status(201).json(await Customer.create(req.body)));
exports.apiUpdate = asyncHandler(async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
exports.apiDelete = asyncHandler(async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, { active: false }, { new: true })));

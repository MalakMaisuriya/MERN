const { validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');
const Address = require('../models/Address');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const data = await paginate(User, {}, {
    page: req.query.page,
    limit: 10,
    sort: { createdAt: -1 },
    populate: ['store', { path: 'address', populate: 'city' }]
  });

  res.render('staff/index', {
    title: 'Staff Management',
    ...data
  });
});

exports.new = asyncHandler(async (req, res) => {
  const [stores, addresses] = await Promise.all([
    Store.find({ active: true }).sort('name'),
    Address.find().populate('city')
  ]);

  res.render('staff/form', {
    title: 'Add Staff Member',
    user: {},
    stores,
    addresses,
    errors: []
  });
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [stores, addresses] = await Promise.all([
      Store.find({ active: true }).sort('name'),
      Address.find().populate('city')
    ]);
    return res.status(422).render('staff/form', {
      title: 'Add Staff Member',
      user: req.body,
      stores,
      addresses,
      errors: errors.array()
    });
  }

  await User.create(req.body);
  res.setFlash('success', 'Staff account created successfully');
  res.redirect('/staff');
});

exports.edit = asyncHandler(async (req, res) => {
  const [user, stores, addresses] = await Promise.all([
    User.findById(req.params.id),
    Store.find({ active: true }).sort('name'),
    Address.find().populate('city')
  ]);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  res.render('staff/form', {
    title: 'Edit Staff Member',
    user,
    stores,
    addresses,
    errors: []
  });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const { firstName, lastName, email, phone, role, store, address, active, password } = req.body;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.phone = phone;
  user.role = role;
  user.store = store || undefined;
  user.address = address || undefined;
  user.active = active === 'on' || active === true || active === 'true';

  if (password && password.trim().length >= 6) {
    user.password = password.trim();
  }

  await user.save();
  res.setFlash('success', 'Staff account updated successfully');
  res.redirect('/staff');
});

exports.destroy = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });
  res.setFlash('success', 'Staff member deactivated');
  res.redirect('/staff');
});

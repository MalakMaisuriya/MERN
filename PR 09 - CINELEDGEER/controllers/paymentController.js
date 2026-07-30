const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.customer) query.customer = req.query.customer;
  if (req.query.status) query.status = req.query.status;
  if (req.query.method) query.paymentMethod = req.query.method;

  if (req.query.from || req.query.to) {
    query.paymentDate = {};
    if (req.query.from) query.paymentDate.$gte = new Date(req.query.from);
    if (req.query.to) query.paymentDate.$lte = new Date(req.query.to + 'T23:59:59');
  }

  const data = await paginate(Payment, query, {
    page: req.query.page,
    limit: 15,
    sort: { paymentDate: -1 },
    populate: [
      'customer',
      'staff',
      { path: 'rental', populate: { path: 'inventory', populate: 'movie' } }
    ]
  });

  const customers = await Customer.find({ active: true }).sort('firstName');

  res.render('payments/index', {
    title: 'Payment History & Records',
    ...data,
    filters: req.query,
    customers
  });
});

exports.new = asyncHandler(async (req, res) => {
  const [rentals, customers] = await Promise.all([
    Rental.find({ status: 'Active' }).populate('customer').populate({ path: 'inventory', populate: 'movie' }),
    Customer.find({ active: true }).sort('firstName')
  ]);

  res.render('payments/form', {
    title: 'Process Payment',
    rentals,
    customers,
    errors: []
  });
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [rentals, customers] = await Promise.all([
      Rental.find({ status: 'Active' }).populate('customer').populate({ path: 'inventory', populate: 'movie' }),
      Customer.find({ active: true }).sort('firstName')
    ]);
    return res.status(422).render('payments/form', {
      title: 'Process Payment',
      rentals,
      customers,
      errors: errors.array()
    });
  }

  await Payment.create({
    ...req.body,
    staff: req.user._id,
    paymentDate: new Date(),
    status: 'Paid'
  });

  res.setFlash('success', 'Payment recorded successfully');
  res.redirect('/payments');
});

const { validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;

  const data = await paginate(Rental, query, {
    page: req.query.page,
    limit: 12,
    sort: { rentalDate: -1 },
    populate: ['customer', 'staff', { path: 'inventory', populate: 'movie store' }]
  });

  res.render('rentals/index', {
    title: 'Rental Management',
    ...data,
    filters: req.query
  });
});

exports.new = asyncHandler(async (req, res) => {
  const [customers, availableInventory] = await Promise.all([
    Customer.find({ active: true }).sort('firstName'),
    Inventory.find({ available: true, status: 'Available' }).populate('movie store').sort('-createdAt')
  ]);

  res.render('rentals/form', {
    title: 'New Movie Rental',
    customers,
    inventoryList: availableInventory,
    errors: []
  });
});

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  const { customer, inventory, paymentMethod, customAmount } = req.body;

  const [customers, availableInventory] = await Promise.all([
    Customer.find({ active: true }).sort('firstName'),
    Inventory.find({ available: true, status: 'Available' }).populate('movie store')
  ]);

  if (!errors.isEmpty()) {
    return res.status(422).render('rentals/form', {
      title: 'New Movie Rental',
      customers,
      inventoryList: availableInventory,
      errors: errors.array()
    });
  }

  // Check inventory availability
  const item = await Inventory.findOne({ _id: inventory, available: true, status: 'Available' }).populate('movie');
  if (!item) {
    return res.status(400).render('rentals/form', {
      title: 'New Movie Rental',
      customers,
      inventoryList: availableInventory,
      errors: [{ msg: 'Selected inventory copy is not available for rental' }]
    });
  }

  const rentalRate = customAmount ? parseFloat(customAmount) : item.movie.rentalRate;

  // 1. Create rental record
  const rental = await Rental.create({
    customer,
    inventory: item._id,
    staff: req.user._id,
    rentalDate: new Date(),
    status: 'Active',
    rentalAmount: rentalRate
  });

  // 2. Update inventory status to Rented
  item.status = 'Rented';
  item.available = false;
  await item.save();

  // 3. Auto-generate payment record for immediate checkout
  await Payment.create({
    customer,
    rental: rental._id,
    staff: req.user._id,
    amount: rentalRate,
    paymentMethod: paymentMethod || 'Cash',
    paymentDate: new Date(),
    status: 'Paid'
  });

  res.setFlash('success', 'Rental created and payment completed successfully');
  res.redirect('/rentals');
});

exports.returnRental = asyncHandler(async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental || rental.status !== 'Active') {
    throw Object.assign(new Error('Active rental not found or already returned'), { statusCode: 400 });
  }

  // 1. Mark rental as Returned
  rental.status = 'Returned';
  rental.returnDate = new Date();
  await rental.save();

  // 2. Release inventory copy back to Available
  await Inventory.findByIdAndUpdate(rental.inventory, {
    status: 'Available',
    available: true
  });

  res.setFlash('success', 'Movie returned successfully and inventory updated');
  res.redirect('/rentals');
});

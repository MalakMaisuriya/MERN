const { validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Movie = require('../models/Movie');
const Store = require('../models/Store');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.store) query.store = req.query.store;
  if (req.query.movie) query.movie = req.query.movie;
  if (req.query.status) query.status = req.query.status;

  const data = await paginate(Inventory, query, {
    page: req.query.page,
    limit: 15,
    sort: { createdAt: -1 },
    populate: ['movie', 'store']
  });

  const [stores, movies] = await Promise.all([
    Store.find({ active: true }).sort('name'),
    Movie.find({ active: true }).sort('title')
  ]);

  res.render('inventory/index', {
    title: 'Inventory Management',
    ...data,
    filters: req.query,
    stores,
    movies
  });
});

exports.new = asyncHandler(async (req, res) => {
  const [movies, stores] = await Promise.all([
    Movie.find({ active: true }).sort('title'),
    Store.find({ active: true }).sort('name')
  ]);
  res.render('inventory/form', {
    title: 'Add Inventory Copies',
    item: {},
    movies,
    stores,
    errors: []
  });
});

exports.create = asyncHandler(async (req, res) => {
  const { movie, store, quantity, status } = req.body;
  const count = Math.max(parseInt(quantity || 1, 10), 1);

  const movies = await Movie.find({ active: true }).sort('title');
  const stores = await Store.find({ active: true }).sort('name');

  if (!movie || !store) {
    return res.status(422).render('inventory/form', {
      title: 'Add Inventory Copies',
      item: req.body,
      movies,
      stores,
      errors: [{ msg: 'Movie and Store are required' }]
    });
  }

  const movieDoc = await Movie.findById(movie);
  const prefix = movieDoc ? movieDoc.title.substring(0, 3).toUpperCase() : 'MOV';

  const newItems = [];
  for (let i = 0; i < count; i++) {
    const sku = `INV-${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const statusVal = status || 'Available';
    newItems.push({
      movie,
      store,
      status: statusVal,
      available: statusVal === 'Available',
      sku
    });
  }

  await Inventory.insertMany(newItems);
  res.setFlash('success', `${count} inventory item(s) added successfully`);
  res.redirect('/inventory');
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const item = await Inventory.findById(req.params.id);
  if (!item) throw Object.assign(new Error('Inventory item not found'), { statusCode: 404 });

  item.status = status;
  item.available = status === 'Available';
  await item.save();

  res.setFlash('success', `Status updated to ${status}`);
  res.redirect('/inventory');
});

exports.destroy = asyncHandler(async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.setFlash('success', 'Inventory item deleted');
  res.redirect('/inventory');
});

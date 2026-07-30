const { validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const Actor = require('../models/Actor');
const Category = require('../models/Category');
const Language = require('../models/Language');
const Inventory = require('../models/Inventory');
const { asyncHandler, paginate, buildRegex, toArray } = require('../utils/helpers');

const formData = async () => ({
  actors: await Actor.find().sort('firstName'),
  categories: await Category.find().sort('name'),
  languages: await Language.find().sort('name')
});

exports.index = asyncHandler(async (req, res) => {
  const query = { active: true };
  if (req.query.search) query.$or = [{ title: buildRegex(req.query.search) }, { description: buildRegex(req.query.search) }];
  if (req.query.category) query.categories = req.query.category;
  if (req.query.language) query.language = req.query.language;
  if (req.query.releaseYear) query.releaseYear = Number(req.query.releaseYear);
  const sortMap = { title: { title: 1 }, newest: { createdAt: -1 }, rate: { rentalRate: 1 }, year: { releaseYear: -1 } };
  const data = await paginate(Movie, query, { page: req.query.page, sort: sortMap[req.query.sort] || { createdAt: -1 }, populate: ['language', 'categories'] });
  res.render('movies/index', { title: 'Movies', ...data, filters: req.query, categories: await Category.find().sort('name'), languages: await Language.find().sort('name') });
});

exports.new = asyncHandler(async (req, res) => res.render('movies/form', { title: 'Add Movie', movie: {}, errors: [], ...(await formData()) }));

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  const data = await formData();
  if (!errors.isEmpty()) return res.status(422).render('movies/form', { title: 'Add Movie', movie: req.body, errors: errors.array(), ...data });
  const movie = await Movie.create({
    ...req.body,
    actors: toArray(req.body.actors),
    categories: toArray(req.body.categories),
    specialFeatures: String(req.body.specialFeatures || '').split(',').map(s => s.trim()).filter(Boolean),
    poster: req.file ? `/uploads/${req.file.filename}` : undefined
  });
  await Actor.updateMany({ _id: { $in: movie.actors } }, { $addToSet: { movies: movie._id } });
  res.redirect(`/movies/${movie._id}`);
});

exports.show = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate('language actors categories');
  if (!movie) throw Object.assign(new Error('Movie not found'), { statusCode: 404 });
  const inventory = await Inventory.find({ movie: movie._id }).populate('store');
  res.render('movies/show', { title: movie.title, movie, inventory });
});

exports.edit = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw Object.assign(new Error('Movie not found'), { statusCode: 404 });
  res.render('movies/form', { title: 'Edit Movie', movie, errors: [], ...(await formData()) });
});

exports.update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw Object.assign(new Error('Movie not found'), { statusCode: 404 });
  if (!errors.isEmpty()) return res.status(422).render('movies/form', { title: 'Edit Movie', movie: { ...movie.toObject(), ...req.body }, errors: errors.array(), ...(await formData()) });
  movie.set({
    ...req.body,
    actors: toArray(req.body.actors),
    categories: toArray(req.body.categories),
    specialFeatures: String(req.body.specialFeatures || '').split(',').map(s => s.trim()).filter(Boolean)
  });
  if (req.file) movie.poster = `/uploads/${req.file.filename}`;
  await movie.save();
  await Actor.updateMany({}, { $pull: { movies: movie._id } });
  await Actor.updateMany({ _id: { $in: movie.actors } }, { $addToSet: { movies: movie._id } });
  res.redirect(`/movies/${movie._id}`);
});

exports.destroy = asyncHandler(async (req, res) => {
  await Movie.findByIdAndUpdate(req.params.id, { active: false });
  res.redirect('/movies');
});

exports.apiIndex = asyncHandler(async (req, res) => res.json(await Movie.find({ active: true }).populate('language actors categories')));
exports.apiShow = asyncHandler(async (req, res) => res.json(await Movie.findById(req.params.id).populate('language actors categories')));
exports.apiCreate = asyncHandler(async (req, res) => res.status(201).json(await Movie.create(req.body)));
exports.apiUpdate = asyncHandler(async (req, res) => res.json(await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
exports.apiDelete = asyncHandler(async (req, res) => res.json(await Movie.findByIdAndUpdate(req.params.id, { active: false }, { new: true })));

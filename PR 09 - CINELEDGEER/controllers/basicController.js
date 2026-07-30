const { validationResult } = require('express-validator');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

const configs = {
  actors: { Model: require('../models/Actor'), view: 'actors', label: 'Actor', search: ['firstName', 'lastName'], populate: ['movies'] },
  categories: { Model: require('../models/Category'), view: 'categories', label: 'Category', search: ['name', 'description'] },
  languages: { Model: require('../models/Language'), view: 'locations', label: 'Language', search: ['name'] },
  countries: { Model: require('../models/Country'), view: 'locations', label: 'Country', search: ['name'] }
};

const getConfig = key => configs[key];

exports.index = key => asyncHandler(async (req, res) => {
  const cfg = getConfig(key);
  const query = {};
  if (req.query.search) query.$or = cfg.search.map(field => ({ [field]: buildRegex(req.query.search) }));
  const data = await paginate(cfg.Model, query, { page: req.query.page, sort: { createdAt: -1 }, populate: cfg.populate || [] });
  res.render(`${cfg.view}/index`, { title: `${cfg.label}s`, resource: key, label: cfg.label, ...data, filters: req.query });
});

exports.new = key => (req, res) => {
  const cfg = getConfig(key);
  res.render(`${cfg.view}/form`, { title: `Add ${cfg.label}`, resource: key, label: cfg.label, item: {}, errors: [] });
};

exports.create = key => asyncHandler(async (req, res) => {
  const cfg = getConfig(key);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render(`${cfg.view}/form`, { title: `Add ${cfg.label}`, resource: key, label: cfg.label, item: req.body, errors: errors.array() });
  await cfg.Model.create(req.body);
  res.redirect(`/${key}`);
});

exports.edit = key => asyncHandler(async (req, res) => {
  const cfg = getConfig(key);
  const item = await cfg.Model.findById(req.params.id);
  if (!item) throw Object.assign(new Error(`${cfg.label} not found`), { statusCode: 404 });
  res.render(`${cfg.view}/form`, { title: `Edit ${cfg.label}`, resource: key, label: cfg.label, item, errors: [] });
});

exports.update = key => asyncHandler(async (req, res) => {
  const cfg = getConfig(key);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render(`${cfg.view}/form`, { title: `Edit ${cfg.label}`, resource: key, label: cfg.label, item: { _id: req.params.id, ...req.body }, errors: errors.array() });
  await cfg.Model.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  res.redirect(`/${key}`);
});

exports.destroy = key => asyncHandler(async (req, res) => {
  const cfg = getConfig(key);
  await cfg.Model.findByIdAndDelete(req.params.id);
  res.redirect(`/${key}`);
});

exports.showActor = asyncHandler(async (req, res) => {
  const actor = await configs.actors.Model.findById(req.params.id).populate('movies');
  if (!actor) throw Object.assign(new Error('Actor not found'), { statusCode: 404 });
  res.render('actors/show', { title: `${actor.firstName} ${actor.lastName}`, actor });
});

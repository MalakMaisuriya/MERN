const { validationResult } = require('express-validator');
const Actor = require('../models/Actor');
const Movie = require('../models/Movie');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.search) {
    const regex = buildRegex(req.query.search);
    query.$or = [{ firstName: regex }, { lastName: regex }, { bio: regex }];
  }
  const data = await paginate(Actor, query, { page: req.query.page, limit: 12, sort: { firstName: 1 }, populate: ['movies'] });
  res.render('actors/index', { title: 'Actors', ...data, filters: req.query });
});

exports.new = (req, res) => {
  res.render('actors/form', { title: 'Add Actor', actor: {}, errors: [] });
};

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('actors/form', { title: 'Add Actor', actor: req.body, errors: errors.array() });
  }
  const actor = await Actor.create(req.body);
  res.setFlash('success', 'Actor created successfully');
  res.redirect(`/actors/${actor._id}`);
});

exports.show = asyncHandler(async (req, res) => {
  const actor = await Actor.findById(req.params.id).populate({ path: 'movies', populate: ['language', 'categories'] });
  if (!actor) throw Object.assign(new Error('Actor not found'), { statusCode: 404 });
  res.render('actors/show', { title: `${actor.firstName} ${actor.lastName}`, actor });
});

exports.edit = asyncHandler(async (req, res) => {
  const actor = await Actor.findById(req.params.id);
  if (!actor) throw Object.assign(new Error('Actor not found'), { statusCode: 404 });
  res.render('actors/form', { title: 'Edit Actor', actor, errors: [] });
});

exports.update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('actors/form', { title: 'Edit Actor', actor: { _id: req.params.id, ...req.body }, errors: errors.array() });
  }
  const actor = await Actor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.setFlash('success', 'Actor updated successfully');
  res.redirect(`/actors/${actor._id}`);
});

exports.destroy = asyncHandler(async (req, res) => {
  const actorId = req.params.id;
  await Movie.updateMany({ actors: actorId }, { $pull: { actors: actorId } });
  await Actor.findByIdAndDelete(actorId);
  res.setFlash('success', 'Actor deleted successfully');
  res.redirect('/actors');
});

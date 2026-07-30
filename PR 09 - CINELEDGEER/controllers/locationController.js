const { validationResult } = require('express-validator');
const Country = require('../models/Country');
const City = require('../models/City');
const Address = require('../models/Address');
const Language = require('../models/Language');
const { asyncHandler, paginate } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const [countries, cities, addresses, languages] = await Promise.all([
    Country.find().sort('name'),
    City.find().populate('country').sort('name'),
    Address.find().populate({ path: 'city', populate: 'country' }).sort('-createdAt'),
    Language.find().sort('name')
  ]);

  res.render('locations/index', {
    title: 'Locations & Languages',
    countries,
    cities,
    addresses,
    languages
  });
});

exports.createCountry = asyncHandler(async (req, res) => {
  if (req.body.name && req.body.name.trim()) {
    await Country.create({ name: req.body.name.trim() });
    res.setFlash('success', 'Country added successfully');
  }
  res.redirect('/locations');
});

exports.createCity = asyncHandler(async (req, res) => {
  if (req.body.name && req.body.country) {
    await City.create({ name: req.body.name.trim(), country: req.body.country });
    res.setFlash('success', 'City added successfully');
  }
  res.redirect('/locations');
});

exports.createAddress = asyncHandler(async (req, res) => {
  const { line1, line2, district, city, postalCode, phone } = req.body;
  if (line1 && city) {
    await Address.create({ line1, line2, district, city, postalCode, phone });
    res.setFlash('success', 'Address created successfully');
  }
  res.redirect('/locations');
});

exports.createLanguage = asyncHandler(async (req, res) => {
  if (req.body.name && req.body.name.trim()) {
    await Language.create({ name: req.body.name.trim() });
    res.setFlash('success', 'Language added successfully');
  }
  res.redirect('/locations');
});

exports.deleteCountry = asyncHandler(async (req, res) => {
  await Country.findByIdAndDelete(req.params.id);
  res.setFlash('success', 'Country deleted');
  res.redirect('/locations');
});

exports.deleteCity = asyncHandler(async (req, res) => {
  await City.findByIdAndDelete(req.params.id);
  res.setFlash('success', 'City deleted');
  res.redirect('/locations');
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.setFlash('success', 'Address deleted');
  res.redirect('/locations');
});

exports.deleteLanguage = asyncHandler(async (req, res) => {
  await Language.findByIdAndDelete(req.params.id);
  res.setFlash('success', 'Language deleted');
  res.redirect('/locations');
});

const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Movie = require('../models/Movie');
const { asyncHandler, paginate, buildRegex } = require('../utils/helpers');

exports.index = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.search) {
    const regex = buildRegex(req.query.search);
    query.$or = [{ name: regex }, { description: regex }];
  }
  const data = await paginate(Category, query, { page: req.query.page, limit: 10, sort: { name: 1 } });
  
  // Aggregate movie counts per category
  const categoryCounts = await Movie.aggregate([
    { $match: { active: true } },
    { $unwind: '$categories' },
    { $group: { _id: '$categories', count: { $sum: 1 } } }
  ]);
  
  const countMap = {};
  categoryCounts.forEach(c => {
    countMap[c._id.toString()] = c.count;
  });

  const itemsWithCounts = data.items.map(item => ({
    ...item.toObject(),
    movieCount: countMap[item._id.toString()] || 0
  }));

  res.render('categories/index', { title: 'Categories', ...data, items: itemsWithCounts, filters: req.query });
});

exports.new = (req, res) => {
  res.render('categories/form', { title: 'Add Category', category: {}, errors: [] });
};

exports.create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('categories/form', { title: 'Add Category', category: req.body, errors: errors.array() });
  }
  await Category.create(req.body);
  res.setFlash('success', 'Category created successfully');
  res.redirect('/categories');
});

exports.edit = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  res.render('categories/form', { title: 'Edit Category', category, errors: [] });
});

exports.update = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('categories/form', { title: 'Edit Category', category: { _id: req.params.id, ...req.body }, errors: errors.array() });
  }
  await Category.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  res.setFlash('success', 'Category updated successfully');
  res.redirect('/categories');
});

exports.destroy = asyncHandler(async (req, res) => {
  const catId = req.params.id;
  await Movie.updateMany({ categories: catId }, { $pull: { categories: catId } });
  await Category.findByIdAndDelete(catId);
  res.setFlash('success', 'Category deleted successfully');
  res.redirect('/categories');
});

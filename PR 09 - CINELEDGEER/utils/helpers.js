const mongoose = require('mongoose');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const toArray = value => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const isObjectId = value => mongoose.Types.ObjectId.isValid(value);

const paginate = async (model, query, options = {}) => {
  const page = Math.max(parseInt(options.page || 1, 10), 1);
  const limit = Math.min(Math.max(parseInt(options.limit || 10, 10), 1), 50);
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  let cursor = model.find(query).sort(sort).skip(skip).limit(limit);
  (options.populate || []).forEach(pop => { cursor = cursor.populate(pop); });
  const [items, total] = await Promise.all([cursor, model.countDocuments(query)]);
  return { items, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) };
};

const buildRegex = term => new RegExp(String(term || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

module.exports = { asyncHandler, toArray, isObjectId, paginate, buildRegex };

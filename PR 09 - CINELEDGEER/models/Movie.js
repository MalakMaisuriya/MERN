const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true, trim: true },
  releaseYear: { type: Number, required: true, min: 1900, max: 2100 },
  language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language', required: true },
  rentalDuration: { type: Number, required: true, min: 1, default: 3 },
  rentalRate: { type: Number, required: true, min: 0 },
  length: { type: Number, min: 1 },
  replacementCost: { type: Number, required: true, min: 0 },
  rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], default: 'PG' },
  specialFeatures: [{ type: String, trim: true }],
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  poster: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);

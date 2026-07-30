const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  bio: { type: String, trim: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
}, { timestamps: true });

actorSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Actor', actorSchema);

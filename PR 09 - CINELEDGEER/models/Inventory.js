const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  status: { type: String, enum: ['Available', 'Rented', 'Maintenance', 'Lost'], default: 'Available' },
  available: { type: Boolean, default: true },
  sku: { type: String, trim: true, unique: true }
}, { timestamps: true });

inventorySchema.pre('save', function syncAvailability(next) {
  this.available = this.status === 'Available';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);

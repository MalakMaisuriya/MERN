const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);

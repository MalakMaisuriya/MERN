const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  district: { type: String, required: true, trim: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  postalCode: { type: String, trim: true },
  phone: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);

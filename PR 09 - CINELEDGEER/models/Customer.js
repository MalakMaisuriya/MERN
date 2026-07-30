const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

customerSchema.index({ firstName: 1, lastName: 1, email: 1 });

module.exports = mongoose.model('Customer', customerSchema);

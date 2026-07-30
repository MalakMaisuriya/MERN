const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

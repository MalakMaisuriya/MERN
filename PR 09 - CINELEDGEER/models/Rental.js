const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rentalDate: { type: Date, default: Date.now },
  returnDate: Date,
  status: { type: String, enum: ['Active', 'Returned', 'Overdue', 'Cancelled'], default: 'Active' },
  rentalAmount: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);

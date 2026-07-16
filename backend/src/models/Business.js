const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    gstin: { type: String, trim: true, default: null },
    lowStockThresholdDefault: { type: Number, default: 5 },
    orderCounter: { type: Number, default: 0 }, // incremented atomically to generate order numbers
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);

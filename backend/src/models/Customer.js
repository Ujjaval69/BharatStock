const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);

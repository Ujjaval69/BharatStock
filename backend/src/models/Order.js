const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot, in case product is edited later
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // snapshot of sellingPrice at order time
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    orderNumber: { type: String, required: true }, // human-friendly, per-business sequential
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerNameSnapshot: { type: String, default: 'Walk-in' },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

orderSchema.index({ business: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ business: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

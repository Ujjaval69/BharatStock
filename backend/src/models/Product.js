const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    category: { type: String, trim: true, default: 'General' },
    unit: { type: String, trim: true, default: 'pcs' }, // pcs, kg, litre, box...
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ business: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ business: 1, name: 'text' });

module.exports = mongoose.model('Product', productSchema);

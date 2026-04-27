const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    code: String,
    image: String,
    description: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    mrp: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    netPrice: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationId: {
      type: String,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customerName: {
      type: String,
      default: 'N/A',
      trim: true
    },
    products: [quotationItemSchema],
    subtotal: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quotation', quotationSchema);

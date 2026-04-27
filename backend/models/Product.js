const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    groupCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      default: ''
    },
    imagePublicId: {
      type: String,
      default: ''
    },
    imageProvider: {
      type: String,
      enum: ['', 'local', 'cloudinary'],
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

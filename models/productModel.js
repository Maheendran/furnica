/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const produtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    imageUrl: {
      type: [String],
      require: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      require: true,
    },
    material: {
      type: String,
      require: true,
    },
    brand: {
      type: String,
      require: true,
    },
    stock: {
      type: Number,
      require: true,
    },
    outofstock: {
      type: Boolean,
      default: false,
    },
    overview: {
      type: String,
      require: true,
    },
    offer: {

      realprice: {
        type: Number,
      },
      offerpercent: {
        type: Number,
      },
    },
    wishlist: {
      type: Boolean,
      default: false,
    },
    review: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
        },
        date: {
          type: String,
        },
        name: {
          type: String,
        },
        time: {
          type: String,
        },

      },
    ],
  },

  { timestamps: true },
);

module.exports = mongoose.model('Product', produtSchema);

/* eslint-disable linebreak-style */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
    },

    mobile: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      required: true,
    },

    isBlocked: {
      type: Boolean,
      required: true,
    },

    wallet: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: 'String',
    },
    referralUsers: {
      type: [String],
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    walletHistory: [
      {
        method: {
          type: String,
          required: true,
        },
        situation: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
        },
        date: {
          type: String,
        },
        time: {
          type: Date,
        },
      },
    ],

  },

  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);

/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const slider = mongoose.Schema({

  imageUrl: {
    type: [String],
  },
  category: {
    type: String,
  },

}, { timestamp: true });
module.exports = mongoose.model('slider', slider);

/* eslint-disable linebreak-style */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = () => {
  try {
    mongoose.connect(process.env.mongo_url);
    console.log('mongodb connected');
  } catch (error) {
    console.log('error');
  }
};

module.exports = {
  connectDB,
};

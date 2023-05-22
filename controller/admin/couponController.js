/* eslint-disable linebreak-style */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const cron = require('node-cron');
const Coupon = require('../../models/couponModel.js');
const Category = require('../../models/categoryModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************Coupons section*************************//
cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  const coupons = await Coupon.find();
  coupons.forEach(async (coupon) => {
    const couponDate = new Date(coupon.date);
    if (today > couponDate) {
      await coupon.save();
    }
  });
});

// ************************Coupons list section*************************//
const coupons = async (req, res) => {
  try {
    const couponlist = await Coupon.find();
    const category = await Category.find();
    res.render('admin/coupons', { couponlist, category, title: 'Coupons' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************add new Coupons section*************************//
const newcoupon = async (req, res) => {
  try {
    const newcoupon = new Coupon(req.body);
    const existName = await Coupon.find({
      code: { $regex: new RegExp(req.body.code, 'i') },
    });
    if (existName.length === 0) {
      await newcoupon.save();
      res.json('success');
    } else {
      res.json('nameError');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const couponDelete = async (req, res) => {
  try {
    const couponid = req.query.code.trim();
    await Coupon.findByIdAndDelete(couponid);
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
module.exports = {
  coupons,
  newcoupon,
  couponDelete,
};

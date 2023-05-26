/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
const User = require('../../models/userModel');
const Address = require('../../models/addressMode');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************profile section*************************//
const profile = async (req, res) => {
  try {
    const userdata = req.session.user;
    const userdetail = await User.findById(userdata._id);
    const historysort = userdetail.walletHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
    const address = await Address.find({ userId: userdata._id });
    res.render('user/profile', {
      userdata: userdetail, address, walletamount: userdetail.wallet, wallethistory: historysort, title: 'Profile',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post updateprofile section*************************//
const updatedprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const emailexist = await User.find({ email: req.body.email, _id: { $ne: req.params.id } });
    if (emailexist.length==0) {
      await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
          },
        },
      );
      const user = await User.findById(id);
      req.session.user = user;
      const userdata = req.session.user;
      const userdetail = await User.findById(userdata._id);
      const historysort = userdetail.walletHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
      const address = await Address.find({ userId: userdata._id });
      res.render('user/profile', {
        userdata: userdetail, address, walletamount: userdetail.wallet, wallethistory: historysort, title: 'Profile',
      });
    }
    else{
      res.redirect("/profile")
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************new profile section*************************//
const createAddress = async (req, res) => {
  try {
    req.body.is_default = false;
    const data = new Address(req.body);
    await data.save();
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************remove address section*************************//
const removeAddress = async (req, res) => {
  try {
    const id = req.body.addressId;
    await Address.findByIdAndDelete(id);
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************update address section*************************//
const updateAddress = async (req, res) => {
  try {
    const param = req.params.id;
    const address = await Address.findById(param);
    res.render('user/updateAddress', { address, title: 'Update address' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post udate address section*************************//
const updatedAddress = async (req, res) => {
  try {
    const {
      address,
      userId,
      name,
      mobile,
      adressLine1,
      pin,
      state,
      city,
      country,
    } = req.body;

    await Address.findByIdAndUpdate(
      address,
      {
        userId, name, mobile, adressLine1, pin, state, city, country,
      },
      { new: true },
    );
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  updatedprofile,
  profile,
  createAddress,
  removeAddress,
  updateAddress,
  updatedAddress,
};

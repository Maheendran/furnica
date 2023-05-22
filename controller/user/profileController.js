/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const User = require('../../models/userModel');
const Address = require('../../models/addressMode');

// ************************profile section*************************//
const profile = async (req, res) => {
  const userdata = req.session.user;
  const userdetail = await User.findById(userdata._id);
  const historysort = userdetail.walletHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
  const address = await Address.find({ userId: userdata._id });
  res.render('user/profile', {
    userdata: userdetail, address, walletamount: userdetail.wallet, wallethistory: historysort, title: 'Profile',
  });
};
// ************************update profile section*************************//
const updateprofile = async (req, res) => {
  const userdata = req.session.user;
  const address = await Address.find({ userId: userdata._id });
  res.render('user/editprofile', { userdata, address, title: 'Update profile' });
};

// ************************post updateprofile section*************************//
const updatedprofile = async (req, res) => {
  try {
    const { id } = req.params;
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

    const address = await Address.find({ userId: userdata._id });
    res.render('user/profile', { userdata, address });
  } catch (error) {
    res.render('error');
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
    res.render('user/error');
  }
};

// ************************remove address section*************************//
const removeAddress = async (req, res) => {
  try {
    const id = req.body.addressId;
    await Address.findByIdAndDelete(id);
    res.json('success');
  } catch (error) {
    res.render('user/error');
  }
};

// ************************update address section*************************//
const updateAddress = async (req, res) => {
  try {
    const param = req.params.id;
    const address = await Address.findById(param);

    res.render('user/updateAddress', { address, title: 'Update address' });
  } catch (error) {
    res.render('user/error');
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
    res.render('user/error');
  }
};

module.exports = {
  updatedprofile,
  profile,
  updateprofile,
  createAddress,
  removeAddress,
  updateAddress,
  updatedAddress,
};

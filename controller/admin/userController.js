/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const User = require('../../models/userModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************admin login section*************************//
const adminlogin = async (req, res) => {
  try {
    res.render('admin/login');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post admin section*************************//
const adminlogedin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === process.env.adminUsername) {
      if (password === process.env.adminPassword) {
        req.session.admin = process.env.adminUsername;
        res.redirect('/admin');
      } else {
        res.render('admin/login', { errorDetail: 'password not match' });
      }
    } else {
      res.render('admin/login', { errorDetail: 'username not match' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************admin logout section*************************//
const adminlogout = async (req, res) => {
  try {
    req.session.admin = null;
    res.render('admin/login');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************userlist section*************************//
const usersList = async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/userlist', { users, title: 'Users' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************user block section*************************//
const blockUser = async (req, res) => {
  const { id } = req.params;
  try {
    // eslint-disable-next-line no-shadow
    const blockUser = await User.findById(id);
    const { isBlocked } = blockUser;
    await User.findByIdAndUpdate(
      id,
      { $set: { isBlocked: !isBlocked } },
      { new: true },
    );
    req.session.user = null;
    res.redirect('/admin/users');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  adminlogout,
  adminlogin,
  adminlogedin,
  usersList,
  blockUser,
};

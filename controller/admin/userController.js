/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const User = require('../../models/userModel.js');
// ************************admin login section*************************//
const adminlogin = async (req, res) => {
  try {
    res.render('admin/login');
  } catch (error) {
    res.render('user/error');
  }
};

// ************************post admin section*************************//
const adminlogedin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.adminUsername) {
      if (password === process.env.adminPassword) {
        req.session.admin = process.env.adminUsername;

        res.redirect('/furnica/admin/dashboard');
      } else {
        res.render('admin/login', { errorDetail: 'password not match' });
      }
    } else {
      res.render('admin/login', { errorDetail: 'username not match' });
    }
  } catch (error) {
    res.render('user/error');
  }
};

// ************************admin logout section*************************//
const adminlogout = async (req, res) => {
  try {
    req.session.admin = null;
    res.render('admin/login');
  } catch (error) {
    res.render('user/error');
  }
};

// ************************userlist section*************************//
const usersList = async (req, res) => {
  try {
    const users = await User.find();

    res.render('admin/userlist', { users, title: 'Users' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.redirect('/furnica/admin/users');
  } catch (error) {
    res.render('user/error');
  }
};

module.exports = {
  adminlogout,
  adminlogin,
  adminlogedin,
  usersList,
  blockUser,
};

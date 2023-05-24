/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const errorHandler = require('./errorHandler.js');

const isLogin = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      res.render('admin/login');
    } else {
      next();
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect('/admin/');
    }
    next();
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = { isLogin, isLogout };

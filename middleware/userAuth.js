/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */

const errorHandler = require('./errorHandler.js');

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect('/');
    } else {
      next();
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const loggedin = async (req, res, next) => {
  try {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const isOtp = async (req, res, next) => {
  try {
    if (req.session.otpsession !== undefined) {
      next();
    } else {
      res.render('user/forgotpassword/mailSubmittion');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const isOtpsignup = async (req, res, next) => {
  try {
    if (req.session.otpsession !== undefined) {
      next();
    } else {
      res.render('user/signup');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  isLogin,
  isOtp,
  isOtpsignup,
  loggedin,
};

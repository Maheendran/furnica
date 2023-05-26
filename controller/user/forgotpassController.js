/* eslint-disable linebreak-style */
/* eslint-disable eqeqeq */
/* eslint-disable import/extensions */

const userHelper = require('../../helper/userHelper');
const usermodel = require('../../models/userModel');
const errorHandler = require('../../middleware/errorHandler.js');

const generateOtp = () => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  return otp;
};
// ************************forgotpassword section*************************//
const mailSubmit = async (req, res) => {
  try {
    if (req.session.forgotmail) {
      const emailErr = 'Invalid email';
      req.session.forgotmail = false;
      res.render('user/forgotpassword/mailSubmittion', {
        emailErr,
        title: 'Registred Email',
      });
    } else {
      res.render('user/forgotpassword/mailSubmittion', {
        title: 'Registred Email',
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post mailsend section*************************//
const postMailSubmit = async (req, res) => {
  req.session.otpsession = true;
  try {
    const { email } = req.body;
    req.session.otpEmail = email;
    const userdata = await usermodel.findOne({ email: req.session.otpEmail });
    if (userdata) {
      const otp = generateOtp();
      req.session.otpsession = true;
      await usermodel.updateOne(
        { email: req.session.otpEmail },
        { $set: { otp } },
      );
      setTimeout(async () => {
        req.session.otpsession = null;
        await usermodel.updateOne(
          { email: req.session.otpEmail },
          { $set: { otp: '' } },
        );
      }, 60 * 1000);

      const DBopt = await usermodel.findOne({ email: req.session.otpEmail });
      await userHelper.verifyEmail(req.session.otpEmail, DBopt.otp);
      res.redirect('/otp');
    } else {
      req.session.forgotmail = true;
      res.redirect('/forgotPassword');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************otp section*************************//
const otpPage = async (req, res) => {
  try {
    res.render('user/forgotpassword/otpPage', {
      otpEmail: req.session.otpEmail,
      errorotps: '',
      title: 'Otp',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post otp section*************************//
const postOtppage = async (req, res) => {
  const enterOtp = req.body.otp;
  try {
    const DBopt = await usermodel.findOne({ email: req.session.otpEmail });

    if (enterOtp == DBopt.otp) {
      await usermodel.updateOne(
        { email: req.session.otpEmail },
        { $set: { otp: '' } },
      );
      res.redirect('/resetPassword');
    } else {
      res.render('user/forgotpassword/otpPage', { errorotps: 'Invalid OTP' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************resend otp section*************************//
const resendOtp = async (req, res) => {
  try {
    const otp = generateOtp();
    await usermodel.updateOne(
      { email: req.session.otpEmail },
      { $set: { otp } },
    );
    const dbotp = await usermodel.findOne({ email: req.session.otpEmail });
    await userHelper.verifyEmail(req.session.otpEmail, dbotp.otp);
    res.redirect('/otp');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************reset password section*************************//
const resetPasswordpage = async (req, res) => {
  try {
    res.render('user/forgotpassword/resetPassword', {
      title: 'Reset password',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************post rest password section*************************//
const postResetpass = async (req, res) => {
  const newPassword = req.body.password;
  const { confirmPassword } = req.body;
  try {
    if (newPassword == confirmPassword) {
      const hashedPassword = await userHelper.hashPassword(newPassword);
      const userData = await usermodel.findOne({ email: req.session.otpEmail });
      await usermodel.updateOne(
        { email: req.session.otpEmail },
        { $set: { password: hashedPassword } },
      );
      req.session.user = userData;
      req.session.otpEmail = null;
      req.session.otpsession = null;
      res.redirect('/login');
    } else {
      res.render('user/forgotpassword/resetPassword', {
        title: 'Reset password',
        errorDetail: 'password not matching',
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  postResetpass,
  resetPasswordpage,
  postOtppage,
  otpPage,
  postMailSubmit,
  mailSubmit,
  resendOtp,
};

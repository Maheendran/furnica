/* eslint-disable linebreak-style */
const userHelper = require('../../helper/userHelper');
const usermodel = require('../../models/userModel');

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
      res.render('user/forgotpassword/mailSubmittion', { emailErr, title: 'Registred Email' });
    } else {
      res.render('user/forgotpassword/mailSubmittion', { title: 'Registred Email' });
    }
  } catch (error) {
    res.render('user/error');
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
      res.redirect('/furnica/otp');
    } else {
      req.session.forgotmail = true;
      res.redirect('/furnica/forgotPassword');
    }
  } catch (error) {
    res.render('user/error');
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
    res.render('user/error');
  }
};

// ************************post otp section*************************//
const postOtppage = async (req, res) => {
  const enterOtp = req.body.otp;
  try {
    const DBopt = await usermodel.findOne({ email: req.session.otpEmail });

    if (enterOtp === DBopt.otp) {
      await usermodel.updateOne(
        { email: req.session.otpEmail },
        { $set: { otp: '' } },
      );

      res.redirect('/furnica/resetPassword');
    } else {
      res.render('user/forgotpassword/otpPage', { errorotps: 'Invalid OTP' });
    }
  } catch (error) {
    res.render('user/error');
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
    res.redirect('/furnica/otp');
  } catch (error) {
    res.render('user/error');
  }
};

// ************************reset password section*************************//
const resetPasswordpage = async (req, res) => {
  try {
    res.render('user/forgotpassword/resetPassword', { title: 'Reset password' });
  } catch (error) {
    res.render('user/error');
  }
};

// ************************post rest password section*************************//
const postResetpass = async (req, res) => {
  const newPassword = req.body.password;
  try {
    const hashedPassword = await userHelper.hashPassword(newPassword);
    const userData = await usermodel.findOne({ email: req.session.otpEmail });
    await usermodel.updateOne(
      { email: req.session.otpEmail },
      { $set: { password: hashedPassword } },
    );
    req.session.user = userData;
    req.session.otpEmail = null;
    req.session.otpsession = null;

    res.redirect('/furnica/login');
  } catch (error) {
    res.render('user/error');
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

/* eslint-disable linebreak-style */
/* eslint-disable no-var */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable import/extensions */
const argon2 = require('argon2');
const usermodel = require('../../models/userModel.js');
const Category = require('../../models/categoryModel.js');
const Product = require('../../models/productModel.js');
const userHelper = require('../../helper/userHelper.js');
const Banner = require('../../models/bannerModel.js');
const User = require('../../models/userModel.js');
const Order = require('../../models/orderModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
const Slider = require('../../models/sliderModel.js');
// ************************signup section*************************//
const usersignup = (req, res) => {
  try {
    res.render('user/signup');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************do signup section*************************//
const doSignup = async (req, res) => {
  const { email, mobile, referral } = req.body;
  try {
    if (referral !== null) {
      req.session.refferal = referral;
    }
    const hashedPassword = await userHelper.hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const userexist = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!userexist) {
      const otp = generateOtp();
      (req.body.isVerified = false),
      (req.body.isBlocked = false),
      (req.body.otp = otp);

      req.session.sigupUser = req.body;
      req.session.signupOtp = req.body.email;
      req.session.otpsession = true;

      setTimeout(async () => {
        req.session.otpsession = null;
        req.session.signupOtp = null;
        req.session.refferal = null;
        await User.updateOne(
          { email: req.session.signupOtp },
          { $set: { otp: '' } },
        );
      }, 180 * 1000);

      const data = new User(req.session.sigupUser);
      await data.save();

      const dbotp = await usermodel.findOne({ email: req.session.signupOtp });
      await userHelper.verifyEmail(req.session.signupOtp, dbotp.otp);

      res.redirect('/getOtp');
    } else {
      res.render('user/signup', { errorDetail: 'email already exist' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const referralLink = async (req, res) => {
  try {
    const refferalcode = req.query.code;
    req.session.user = false;
    res.render('user/signup', { refferalcode });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************ signup otp section*************************//
const generateOtp = () => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  return otp;
};
const submitOtp = async (req, res) => {
  try {
    const enterOtp = req.body.otp;
    const DBopt = await User.findOne({ email: req.session.signupOtp });
    if (enterOtp == DBopt.otp) {
      req.session.sigupUser.isVerified = true;
      const alldata = req.session.sigupUser;

      if (req.session.refferal) {
        const referralCode = req.session.refferal;

        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        const history = {
          method: 'Credited',
          situation: 'Refferal Bonus',
          amount: 30,
          date: formattedDate,
          time: currentDate,
        };

        await User.updateOne(
          { referralCode },
          {
            $addToSet: { referralUsers: DBopt._id },
            $inc: { wallet: 30 },
            $push: { walletHistory: history },
          },
        );
        await User.updateOne(
          { email: alldata.email },
          { $inc: { wallet: 30 }, $push: { walletHistory: history } },
        );
      }
      function generateReferralCode(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }
        return code;
      }
      const referralCode = generateReferralCode(8);

      await User.updateOne(
        { email: alldata.email },
        { $set: { isVerified: alldata.isVerified, otp: '', referralCode } },
      );
      req.session.sigupUser = null;
      req.session.signupOtp = null;
      req.session.refferal = null;
      res.redirect('/login');
    } else {
      res.render('user/otpsubmit', { errorotps: 'Invalid OTP' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************login section*************************//
const userLogin = async (req, res) => {
  try {
    const successMsg = 'User registered sucessfully';
    const accountBlock = 'Temporarily account blocked';
    const mailErr = 'Incorrect email or password';
    if (req.session.successMsg) {
      req.session.successMsg = false;
      res.render('user/login', { successMsg });
    } else if (req.session.userBlocked) {
      req.session.userBlocked = false;
      res.render('user/login', { accountBlock });
    } else if (req.session.mailErr) {
      req.session.mailErr = false;
      res.render('user/login', { mailErr });
    } else {
      res.render('user/login', { mailErr: ' ', accountBlock: ' ' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const doLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      let userData = await usermodel.findOne({ email });
      if (userData) {
        if (await argon2.verify(userData.password, password)) {
          const { isBlocked } = userData;
          if (!isBlocked) {
            req.session.LoggedIn = true;
            req.session.user = userData;
            res.redirect('/');
          } else {
            userData = null;
            req.session.userBlocked = true;
            res.redirect('/login');
          }
        } else {
          req.session.mailErr = true;
          res.redirect('/login');
        }
      } else {
        req.session.mailErr = true;
        res.redirect('/login');
      }
    } else {
      res.render('user/login');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const resendOtop = async (req, res) => {
  try {
    const otp = generateOtp();
    await User.updateOne(
      { email: req.session.signupOtp },
      { $set: { otp } },
    );
    const DBopt = await usermodel.findOne({ email: req.session.signupOtp });
    await userHelper.verifyEmail(req.session.signupOtp, DBopt.otp);
    res.redirect('/getOtp');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const getOtp = async (req, res) => {
  try {
    res.render('user/otpsubmit');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const userlogout = async (req, res) => {
  try {
    req.session.user = null;
    res.redirect('/login');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************home section*************************//
const homePage = async (req, res) => {
  try {
    const product = await Product.find().sort({ timestamps: -1 }).limit(10);
    const category = await Category.find().limit(3);
    const userdata = req.session.user;
    const bannerdata = await Banner.find();
    const slider = await Slider.find();
    res.render('user/home', {
      category, product, userdata, bannerdata, title: 'Home', slider,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************products section*************************//

const Allproducts = async (req, res) => {
  try {
    const productList = await Product.find();
    const userdata = req.session.user;
    const pageNumber = req.query.page;
    const pageSize = 4;
    const totalItems = productList.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
    const pageData = productList.slice(startIndex, endIndex + 1);
    const category = await Category.find();
    res.render('user/productlist', {
      productList: pageData,
      userdata,
      totalPages,
      pageNumber,
      title: 'Products',
      category,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const quaryProducts = async (req, res) => {
  const param = req.params.category;

  try {
    const productList = await Product.find({ category: param });
    const userdata = req.session.user;
    const pageNumber = 1;
    const pageSize = 4;
    const totalItems = productList.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
    const pageData = productList.slice(startIndex, endIndex + 1);
    const category = await Category.find();
    if (pageData.length === 0) {
      res.render('user/Nomatches');
    } else {
      res.render('user/productlist', {
        productList: pageData,
        userdata,
        totalPages,
        pageNumber,
        category,
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const productDetail = async (req, res) => {
  const param = req.params.id;
  try {
    const details = await Product.findOne({ _id: param });
    const categoryData = await Category.findOne({ _id: details.category });
    let userdata = req.session.user;
    let reviewlist;
    if (req.session.user) {
      reviewlist = await Order.find({
        userId: userdata._id,
        status: 'Order Arrived',
        'product.id': param,
      });
    } else {
      reviewlist = [];
      userdata = '';
    }
    const data = await Product.find({ _id: param });
    const Listreview = data[0].review;

    res.render('user/productsdetails', {
      details, categoryData, reviewlist, userdata, Listreview, title: 'Product detail',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************add review section*************************//
const Addreview = async (req, res) => {
  try {
    const {
      prodId, userId, message, name,
    } = req.body;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const isoDateString = `${day}-${month}-${year}`;
    const currentTime = new Date();
    const review = {
      userId,
      message,
      date: isoDateString,
      name,
      time: currentTime,
    };
    await Product.findOneAndUpdate(
      { _id: prodId },
      { $push: { review } },
      { new: true },
    );
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************delete review section*************************//
const deletereview = async (req, res) => {
  try {
    const { editreview, prodId } = req.body;
    const productData = await Product.findById(prodId);
    productData.review.splice(editreview, 1);
    await productData.save();
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************update review section*************************//
const editreview = async (req, res) => {
  try {
    const { reviewIndex, prodId, reviewInput } = req.body;
    await Product.updateOne(
      { _id: prodId },
      { $set: { [`review.${reviewIndex}.message`]: reviewInput } },
    );
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const error = async (req, res) => {
  res.render('user/error');
};
module.exports = {
  usersignup,
  doSignup,
  referralLink,
  userLogin,
  submitOtp,
  doLogin,
  homePage,
  resendOtop,
  getOtp,
  Allproducts,
  quaryProducts,
  productDetail,
  userlogout,
  error,
  Addreview,
  deletereview,
  editreview,
};

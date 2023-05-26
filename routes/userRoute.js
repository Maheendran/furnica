/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable import/order */
const express = require('express');
const dotenv = require('dotenv');
const userController = require('../controller/user/userController');
const forgotpassController = require('../controller/user/forgotpassController');
const cartController = require('../controller/user/cartController');
const sortFilterController = require('../controller/user/sort&filterController');
const checkoutController = require('../controller/user/checkoutController');
const profileController = require('../controller/user/profileController');

dotenv.config();

const Razorpay = require('razorpay');
const {
  isLogin,
  isOtp,
  isOtpsignup,
  loggedin,
} = require('../middleware/userAuth.js');

dotenv.config();
const userRoute = express.Router();
// =====================signup section=================//
userRoute.get('/signup', isLogin, userController.usersignup);
userRoute.post('/signup', userController.doSignup);
userRoute.get('/referral', userController.referralLink);
// ===================== otp section=================//
userRoute.get('/getOtp', isOtpsignup, userController.getOtp);
userRoute.post('/getOtp', isOtpsignup, userController.submitOtp);
userRoute.get('/resendOtp', isLogin, userController.resendOtop);

// =====================login section=================//
userRoute.get('/login', isLogin, userController.userLogin);
userRoute.post('/login', userController.doLogin);
userRoute.get('/logout', userController.userlogout);

// =====================forgotpassword section=================//

userRoute.get('/forgotPassword', isLogin, forgotpassController.mailSubmit);
userRoute.post('/forgotPassword', forgotpassController.postMailSubmit);
userRoute.get('/otp', isOtp, forgotpassController.otpPage);
userRoute.post('/otp', isOtp, forgotpassController.postOtppage);
userRoute.get('/resetPassword', isOtp, forgotpassController.resetPasswordpage);
userRoute.post('/resetPassword', forgotpassController.postResetpass);
userRoute.get('/otpResend', isOtp, forgotpassController.resendOtp);

// =====================home section=================//

userRoute.get('/', userController.homePage);
userRoute.get('/Allproducts', userController.Allproducts);
userRoute.get('/products/:category', userController.quaryProducts);
userRoute.get('/detail/:id', userController.productDetail);

// ===============review===============//
userRoute.post('/Addreview', userController.Addreview);
userRoute.post('/deleteReview', userController.deletereview);
userRoute.post('/editReview', userController.editreview);

// ===============cart section===============/
userRoute.get('/cart', loggedin, cartController.cartLoading);
userRoute.post('/addtoCart', loggedin, cartController.addToCart);
userRoute.post('/removeCart', loggedin, cartController.removecart);
userRoute.post('/quantity', loggedin, cartController.quantityIncrement);

// ===============whishlist===============//
userRoute.get('/wishlist', loggedin, cartController.wishlist);
userRoute.post('/addwishlist', loggedin, cartController.addwishlist);
userRoute.get('/removeWishlist/:id/:index', loggedin, cartController.removeWishlist);
userRoute.get('/wishlistToCart/:id/:index', loggedin, cartController.wishlistToCart);
// ===============user profile===============//
userRoute.get('/profile', loggedin, profileController.profile);
userRoute.post('/updatedprofile/:id', loggedin, profileController.updatedprofile);
//= ============== address===============//
userRoute.post('/createAddress', loggedin, profileController.createAddress);
userRoute.post('/removeAddress', loggedin, profileController.removeAddress);
userRoute.get('/updateAddress/:id', loggedin, profileController.updateAddress);
userRoute.post('/updateAddress', loggedin, profileController.updatedAddress);

// checkout
userRoute.get('/checkout', loggedin, checkoutController.checkout);
userRoute.post('/checkout', checkoutController.orderConfirm);
userRoute.post('/mycoupon', loggedin, cartController.mycoupon);
userRoute.post('/clearCoupon', loggedin, cartController.clearCoupon);
userRoute.get('/checkStock', loggedin, checkoutController.checkStock);

// ===================uncompleted section===========================//
userRoute.get('/orderslist', loggedin, checkoutController.orderlist);
userRoute.post('/ordercancel', loggedin, checkoutController.ordercancel);
userRoute.get('/orderdetail/:id', loggedin, checkoutController.orderdetail);
userRoute.get('/success', loggedin, checkoutController.success);
userRoute.post('/orderReturn', loggedin, checkoutController.orderReturn);

// ===================sort filter search section===========================//

userRoute.get('/sorting', sortFilterController.sortby);

// ===================payment section===========================//
userRoute.post('/walletamount', checkoutController.walletamount);
userRoute.get('/DownloadInvoice', checkoutController.invoicedownload);
userRoute.post('/payment', async (req, res) => {
  const { amount } = req.body;
  const instance = new Razorpay({ key_id: 'rzp_test_PDb2mkTumdooCe', key_secret: 'L67cmkeEu1lbBkv9S7uSuWcg' });
  const order = await instance.orders.create({
    amount,
    currency: 'INR',
    receipt: 'receipt#1',
  });
  res.json({
    success: true,
    order,
    amount,
  });
});
module.exports = userRoute;

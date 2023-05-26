/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const express = require('express');
const userController = require('../controller/admin/userController.js');
const couponController = require('../controller/admin/couponController.js');
const dashboardController = require('../controller/admin/dashboardController.js');
const categoryController = require('../controller/admin/categoryController.js');
const productController = require('../controller/admin/productController.js');
const bannerController = require('../controller/admin/bannerController.js');
const OrderController = require('../controller/admin/orderController.js');
const OfferManagement = require('../controller/admin/offerController.js');
const Upload = require('../middleware/multer.js');
const adminAuth = require('../middleware/adminAuth.js');

const adminRoute = express.Router();
// ************************login section*************************//

adminRoute.get('/login', adminAuth.isLogout, userController.adminlogin);
adminRoute.post('/login', userController.adminlogedin);
adminRoute.get('/logout', userController.adminlogout);

// ************************dashboard section*************************//

adminRoute.get('/', adminAuth.isLogin, dashboardController.dashboard);
adminRoute.get('/pdfconvert', adminAuth.isLogin, dashboardController.pdfconvert);
adminRoute.post('/chart', adminAuth.isLogin, dashboardController.chartdata);
adminRoute.get('/salesreport/:duration', adminAuth.isLogin, dashboardController.salesreport);

// ************************product section*************************//

adminRoute.get('/addproduct', adminAuth.isLogin, productController.getProducts);
adminRoute.post('/addproduct', Upload.array('image', 3), productController.createProduct);
adminRoute.get('/productlist', adminAuth.isLogin, productController.productlist);
adminRoute.get('/updateproduct/:id', Upload.array('image', 3), adminAuth.isLogin, productController.updateproduct);
adminRoute.post('/updateproduct/:id', Upload.array('image', 3), productController.productUpdated);
adminRoute.get('/deleteProduct/:id', productController.productdelete);
adminRoute.post('/deleteImage', productController.prodImageDelete);

// ************************category section*************************//
adminRoute.get('/addcategory', adminAuth.isLogin, categoryController.categorylist);
adminRoute.post('/addcategory', Upload.array('image', 1), categoryController.addcategory);
adminRoute.get('/updateCategory/:id', adminAuth.isLogin, categoryController.updateCategorypage);
adminRoute.post('/updateCategory/:id', Upload.array('image', 1), categoryController.updatecategory);

// ************************user section*************************//
adminRoute.get('/users', adminAuth.isLogin, userController.usersList);
adminRoute.get('/blockUser/:id', adminAuth.isLogin, userController.blockUser);

// ************************orders section*************************//
adminRoute.get('/orders', adminAuth.isLogin, OrderController.orderslist);
adminRoute.get('/orderdetail/:id', adminAuth.isLogin, OrderController.orderdetail);
adminRoute.post('/removerOrder', adminAuth.isLogin, OrderController.removerOrder);
adminRoute.post('/updatestatus', adminAuth.isLogin, OrderController.updatestatus);

// ************************coupon section*************************//
adminRoute.get('/coupons', adminAuth.isLogin, couponController.coupons);
adminRoute.post('/newcoupon', adminAuth.isLogin, couponController.newcoupon);
adminRoute.get('/couponDelete', adminAuth.isLogin, couponController.couponDelete);

// ************************offer section*************************//
adminRoute.get('/offerManagement', adminAuth.isLogin, OfferManagement.offerManagement);
adminRoute.post('/categoryOffer', adminAuth.isLogin, OfferManagement.categoryOffer);
adminRoute.post('/deleteOffer', adminAuth.isLogin, OfferManagement.deleteOffer);
adminRoute.post('/productOffer', adminAuth.isLogin, OfferManagement.productOffer);
adminRoute.post('/deleteProductOffer', adminAuth.isLogin, OfferManagement.deleteProductOffer);

// ====================banner =============================//

adminRoute.get('/banner', adminAuth.isLogin, bannerController.banner);
adminRoute.post('/newbanner', adminAuth.isLogin, Upload.array('image', 1), bannerController.newbanner);
adminRoute.get('/updatebanner', adminAuth.isLogin, bannerController.updatebannerload);
adminRoute.post('/updatebanner', adminAuth.isLogin, Upload.array('image', 1), bannerController.postupdatebanner);
adminRoute.get('/deletebanner', adminAuth.isLogin, bannerController.deletebanner);
// sliders
adminRoute.get('/sliders', adminAuth.isLogin, bannerController.slider);
adminRoute.post('/addsliders', adminAuth.isLogin, Upload.array('image', 1), bannerController.addslider);
adminRoute.get('/deleteslider/:id', adminAuth.isLogin, bannerController.deleteslider);
module.exports = adminRoute;

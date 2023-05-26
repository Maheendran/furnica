/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');
const User = require('../../models/userModel.js');
const Address = require('../../models/addressMode');
const Order = require('../../models/orderModel.js');
const Coupon = require('../../models/couponModel.js');
const Product = require('../../models/productModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************checkout page section*************************//
const checkout = async (req, res) => {
  try {
    const userdata = req.session.user;
    const address = await Address.find({ userId: userdata._id });
    const user = await User.findOne({ _id: userdata._id })
      .populate('cart.product')
      .lean();
    const { cart } = user;
    let subTotal = 0;
    cart.forEach((val) => {
      val.total = val.product.price * val.quantity;
      subTotal += val.total;
    });
    const currentDate = new Date();
    const fiveDaysLater = new Date(
      currentDate.getTime() + 5 * 24 * 60 * 60 * 1000,
    );
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = fiveDaysLater.toLocaleDateString('en-GB', options);
    let discounamount;
    let lastprice;
    if (req.session.mycoupon != null) {
      const couponId = req.session.mycoupon;
      const coupondata = await Coupon.findById(couponId._id);
      if (subTotal > coupondata.maximum) {
        discounamount = Math.ceil(
          coupondata.maximum * (coupondata.percent / 100),
        );
        lastprice = subTotal - discounamount;
      } else {
        discounamount = Math.ceil(subTotal * (coupondata.percent / 100));
        lastprice = subTotal - discounamount;
      }
    } else {
      lastprice = subTotal;
      discounamount = 0;
    }
    const walletBalance = await User.findById(userdata);
    const { wallet } = walletBalance;
    res.render('user/checkout', {
      subTotal,
      lastprice,
      discounamount,
      address,
      formattedDate,
      cart,
      userdata,
      wallet,
      title: 'Checkout',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************order comfirm section*************************//
const orderConfirm = async (req, res) => {
  try {
    const userData = req.session.user;
    const {
      couponId, walletpayed, total, paymentMethod,
    } = req.body;
    const user = await User.findOne({ _id: userData._id })
      .populate('cart.product')
      .lean();
    const cartPro = user.cart;
    const productDet = cartPro.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.imageUrl[0],
      total: item.product.price * item.quantity,
      description: item.product.description,
    }));
    if (couponId !== '') {
      await Coupon.updateOne(
        { code: couponId },
        { $addToSet: { userId: userData._id } },
        { new: true },
      );
    }

    req.body.product = productDet;
    req.body.name = userData.name;
    req.body.userId = userData._id;
    req.body.status = 'Order placed';
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    req.body.date = formattedDate;
    const order = new Order(req.body);
    await order.save();
    if (paymentMethod === 'Wallet') {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const history = {
        method: 'Debited',
        situation: 'Order successfully',
        amount: total,
        date: formattedDate,
        time: currentDate,
      };
      await User.findByIdAndUpdate(userData._id, {
        $push: { walletHistory: history },
      });
    }
    order.product.forEach(async (prod) => {
      const updatedProd = await Product.findOneAndUpdate(
        { _id: prod.id },
        { $inc: { stock: -prod.quantity } },
        { new: true },
      );
      if (updatedProd.stock === 0) {
        await Product.findOneAndUpdate(
          { _id: prod.id },
          { $set: { outofstock: true } },
        );
      }
    });
    await User.updateOne({ _id: userData._id }, { cart: [] });
    if (walletpayed === 'true') {
      const userId = userData._id;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { wallet: -req.body.total } },
        { new: true },
      );

      if (updatedUser.wallet < 0) {
        updatedUser.wallet = 0;
        await updatedUser.save();
      }
    }

    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// =======checkStock==============//
const checkStock = async (req, res) => {
  try {
    const userdata = req.session.user;
    const products = await Product.find();
    const user = await User.findOne({ _id: userdata._id })
      .populate('cart.product')
      .lean();
    const { cart } = user;
    cart.forEach((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product._id.toString(),
      );
      if (item.quantity <= product.stock) {
        res.json('success');
      } else {
        res.json('outofstock');
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************orderlist section*************************//

const orderlist = async (req, res) => {
  try {
    const userdata = req.session.user;
    const orderData = await Order.find({ userId: req.session.user._id }).sort({
      _id: -1,
    });
    const currentDate = new Date();
    res.render('user/orderslist', {
      orders: orderData,
      userdata,
      currentDate,
      title: 'Orders',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************order cancelsection*************************//
const ordercancel = async (req, res) => {
  try {
    const orderid = req.body.orderid.trim();
    const orderdetail = await Order.find({
      _id: orderid,
      paymentMethod: { $in: ['Gpay', 'Wallet'] },
    });

    if (orderdetail.length > 0) {
      const userdata = req.session.user;
      const userId = userdata._id;
      const walletAmount = orderdetail[0].total;
      await User.findByIdAndUpdate(
        userId,
        { $inc: { wallet: walletAmount } },
        { new: true },
      );
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const history = {
        method: 'Credited',
        situation: 'Order cancelled',
        amount: walletAmount,
        date: formattedDate,
        time: currentDate,
      };
      await User.findByIdAndUpdate(userId, {
        $push: { walletHistory: history },
      });
    }

    await Order.findByIdAndUpdate(
      orderid,
      { status: 'Cancelled' },
      { new: true },
    );
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************return order section*************************//
const orderReturn = async (req, res) => {
  try {
    const orderid = req.body.orderid.trim();
    const orderdetail = await Order.find({ _id: orderid });
    const userdata = req.session.user;
    const userId = userdata._id;
    const walletAmount = orderdetail[0].total;
    if (orderdetail.length > 0) {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const history = {
        method: 'Credited',
        situation: 'Order Refund',
        amount: walletAmount,
        date: formattedDate,
        time: currentDate,
      };
      await User.findByIdAndUpdate(
        userId,
        { $inc: { wallet: walletAmount }, $push: { walletHistory: history } },
        { new: true },
      );
      await Order.findByIdAndUpdate(
        orderid,
        { status: 'Returned' },
        { new: true },
      );
    }
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************order suucess section*************************//
const success = async (req, res) => {
  try {
    res.render('user/successorder', { title: 'Order success' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************order detail section*************************//
const orderdetail = async (req, res) => {
  try {
    const param = req.params.id;
    const orders = await Order.findById(param);
    const address = await Address.findById(orders.address);

    const userdata = req.session.user;
    const currentDate = new Date();
    res.render('user/orderdetail', {
      orders,
      userdata,
      currentDate,
      address,
      title: 'Order detail',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const walletamount = async (req, res) => {
  try {
    const { amount } = req.body;
    const userdata = req.session.user;
    const userId = userdata._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: -amount } },
      { new: true },
    );
    if (updatedUser.wallet < 0) {
      updatedUser.wallet = 0;
      await updatedUser.save();
    }
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const invoicedownload = async (req, res) => {
  try {
    const { orderId } = req.query;
    const orders = await Order.findById(orderId);
    const address = await Address.findById(orders.address);
    const data = {
      orders,
      address,
    };
    const filePathName = path.resolve(
      __dirname,
      '../../views/user/invoice.ejs',
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);

    // Update the code to use Puppeteer for generating the PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.pdf({
      path: 'Invoice.pdf',
      format: 'A4',
      printBackground: true,
    });
    await browser.close();

    const pdfFilePath = 'Invoice.pdf';
    const pdfData = fs.readFileSync(pdfFilePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Invoice.pdf"');

    res.send(pdfData);
  } catch (error) {
    errorHandler(error, req, res);
  }
};
module.exports = {
  checkout,
  orderConfirm,
  orderlist,
  ordercancel,
  success,
  orderdetail,
  orderReturn,
  walletamount,
  invoicedownload,
  checkStock,
};

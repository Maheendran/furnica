/* eslint-disable linebreak-style */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-use-before-define */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');
const Orders = require('../../models/orderModel.js');
const User = require('../../models/userModel.js');
const Product = require('../../models/productModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************Dashboard section*************************//
const dashboard = async (req, res) => {
  try {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyorder = await Orders.find({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: oneWeekAgo },
    });
    const dailyorder = await Orders.find({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: oneDayAgo },
    });
    const oneYearAgo = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate(),
    );
    const Yearorder = await Orders.find({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: oneYearAgo },
    });
    const totalPrice = weeklyorder.reduce((acc, curr) => acc + curr.total, 0);
    const allprice = await Orders.find({ status: { $ne: 'cancelled' } });
    const overallprice = allprice.reduce((acc, curr) => acc + curr.total, 0);
    res.render('admin/dashboard', {
      weeklyOrder: weeklyorder.length,
      dailyorder: dailyorder.length,
      Yearorder: Yearorder.length,
      totalPrice,
      overallprice,
      title: 'Dasboard',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************Chart section*************************//
const chartdata = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          total: {
            $sum: '$total',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
      {
        $limit: 5,
      },
    ];
    const result = await Orders.aggregate(pipeline);
    const perdayuser = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);
    const paymentmethod = await Orders.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
        },
      },
    ]);
    const mostSellingProduct = await Orders.aggregate([
      { $unwind: '$product' },
      { $group: { _id: '$product.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const leaststock = await Product.aggregate([
      { $match: { stock: { $lte: 10 } } },
      {
        $project: {
          _id: 0,
          name: 1,
          stock: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);
    res.json({
      result,
      perdayuser,
      paymentmethod,
      mostSellingProduct,
      leaststock,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************Pdf section*************************//
const pdfconvert = async (req, res) => {
  try {
    const { duration } = req.query;

    const today = new Date();
    let durationDate;
    if (duration === 'Daily') {
      durationDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    } else if (duration === 'Weekly') {
      durationDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (duration === 'Yearly') {
      durationDate = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
      );
    }
    const filteredDocs = await Orders.find({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: durationDate },
    }).sort({ createdAt: -1 });
    const data = {
      orders: filteredDocs,
    };
    const filePathName = path.resolve(
      __dirname,
      '../../views/admin/htmltopdf.ejs',
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    await page.pdf({
      path: 'DailySalesReport.pdf',
      format: 'A4',
      printBackground: true,
    });
    await browser.close();

    const pdfFilePath = 'DailySalesReport.pdf';
    const pdfData = fs.readFileSync(pdfFilePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="DailySalesReport.pdf"',
    );

    res.send(pdfData);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************sales report section*************************//
const salesreport = async (req, res) => {
  const { duration } = req.params;
  try {
    const today = new Date();
    let orderslist;
    if (duration === 'Daily') {
      const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      orderslist = await Orders.find({
        status: { $ne: 'cancelled' },
        createdAt: { $gte: oneDayAgo },
      });
    } else if (duration === 'Weekly') {
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      orderslist = await Orders.find({
        status: { $ne: 'cancelled' },
        createdAt: { $gte: oneWeekAgo },
      });
    } else if (duration === 'Yearly') {
      const oneYearAgo = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate(),
      );
      orderslist = await Orders.find({
        status: { $ne: 'cancelled' },
        createdAt: { $gte: oneYearAgo },
      });
    }

    res.render('admin/salesreport', {
      orderlength: orderslist.length,
      orders: orderslist,
      durations: duration,
      title: 'Sales report',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  dashboard,
  chartdata,
  pdfconvert,
  salesreport,
};

/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable linebreak-style */
const Orders = require('../../models/orderModel.js');
const Address = require('../../models/addressMode.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************Orderlist section*************************//
const orderslist = async (req, res) => {
  try {
    const orders = await Orders.find().sort({
      createdAt: -1,
    });
    res.render('admin/orderslist', { orders, title: 'Orders' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************Remove orderlist section*************************//
const removerOrder = async (req, res) => {
  try {
    const orderId = req.body.orderid;
    await Orders.findByIdAndDelete(orderId);
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************update Orderlist section*************************//
const updatestatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderid = req.body.orderid.trim();
    if (status === 'Order Arrived') {
      const currentDate = new Date();
      const threeDaysLater = new Date(
        currentDate.setDate(currentDate.getDate() + 3),
      );
      await Orders.findByIdAndUpdate(
        orderid,
        { status, returndate: threeDaysLater },
        { new: true },
      );
    } else {
      await Orders.findByIdAndUpdate(
        orderid,
        { status, arrivedDate: '' },
        { new: true },
      );
    }
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************Order detail section*************************//
const orderdetail = async (req, res) => {
  try {
    const param = req.params.id;
    const orders = await Orders.findById(param);
    const address = await Address.findById(orders.address);
    res.render('admin/orderdetails', {
      orders,
      address,
      title: 'Order detail',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  orderslist,
  removerOrder,
  updatestatus,
  orderdetail,
};

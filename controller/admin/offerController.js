/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable linebreak-style */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const cron = require('node-cron');
const Category = require('../../models/categoryModel.js');
const Product = require('../../models/productModel.js');
const Offer = require('../../models/offerModerl.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************offer page section*************************//
const offerManagement = async (req, res) => {
  try {
    const offer = await Offer.find();
    const products = await Product.find();
    const category = await Category.find();
    res.render('admin/offerManagement', {
      category,
      offer,
      products,
      title: 'Offers',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// per sec */10 * * * * *
// ************************automatic running section*************************//
cron.schedule(' 0 0 * * * *', async () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const activeOffers = await Offer.find({
    startdate: { $lte: formattedDate },
    status: { $eq: 'inactive' },
  });
  const inactiveOffers = await Offer.find({
    enddate: { $lt: formattedDate },
    status: { $eq: 'active' },
  });

  if (activeOffers) {
    for (const offer of activeOffers) {
      offer.status = 'active';
      await offer.save();
      const products = await Product.find({ category: offer.offerid });
      for (const product of products) {
        product.price = Math.floor(
          product.price - product.price * (offer.percent / 100),
        );
        await product.save();
      }
    }
  }

  if (inactiveOffers) {
    for (const offer of inactiveOffers) {
      offer.status = 'end';
      await offer.save();
      if (offer.offerfor === 'category') {
        const products = await Product.find({ category: offer.offerid });
        for (const product of products) {
          product.price = product.offer.realprice;
          product.offer.offerpercent = 0;
          await product.save();
        }
      } else {
        const products = await Product.find({ name: offer.offerid });
        products[0].price = products[0].offer.realprice;
        products[0].offer.offerpercent = 0;
        await products[0].save();
      }
    }
  }
});
// ************************category offer section*************************//
const categoryOffer = async (req, res) => {
  try {
    const offerexist = await Offer.find({ offerid: req.body.categoryId });
    if (offerexist.length === 0) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const offerDetails = {
        offerfor: 'category',
        offerid: req.body.categoryId,
        percent: req.body.offeramount,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        status: '',
      };
      if (req.body.startdate >= formattedDate) {
        offerDetails.status = 'inactive';
      } else {
        offerDetails.status = 'active';
      }
      const data = new Offer(offerDetails);
      data.save();
      if (data.status === 'active') {
        Product.find({ category: data.offerid })
          .then((products) => {
            products.forEach((product) => {
              if (product.offer.offerpercent === 0) {
                product.offer.realprice = product.price;
                product.offer.offerpercent = data.percent;
                product.price = Math.floor(
                  product.price - product.price * (data.percent / 100),
                );
                product.save();
              }
            });
          })
          .catch(() => {
            res.render('user/error');
          });
      }
      res.json('success');
    } else {
      res.json('existing');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************category dlete offer section*************************//
const deleteOffer = async (req, res) => {
  try {
    const { offerID } = req.body;
    const offerlist = await Offer.findById(offerID);
    Product.find({ category: offerlist.offerid })
      .then((products) => {
        products.forEach((product) => {
          product.price = product.offer.realprice;
          product.offer.offerpercent = 0;
          product.save();
        });
      })
      .catch(() => {
        res.render('user/error');
      });
    await Offer.findByIdAndDelete(offerlist._id);
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************product offer section*************************//
const productOffer = async (req, res) => {
  try {
    const offerexist = await Offer.find({ offerid: req.body.productname });
    if (offerexist.length === 0) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const offerDetails = {
        offerfor: 'product',
        offerid: req.body.productname,
        percent: req.body.offeramount,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        status: '',
      };
      if (req.body.startdate >= formattedDate) {
        offerDetails.status = 'inactive';
      } else {
        offerDetails.status = 'active';
      }
      const data = new Offer(offerDetails);
      data.save();
      const productdetail = await Product.find({ name: req.body.productname });
      const currentprice = Math.floor(
        productdetail[0].price - productdetail[0].price * (data.percent / 100),
      );
      await Product.updateOne(
        { name: req.body.productname },
        {
          $set: {
            price: currentprice,
            'offer.offerpercent': req.body.offeramount,
          },
        },
      );
      res.json('success');
    } else {
      res.json('existing');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************delete product offer section*************************//
const deleteProductOffer = async (req, res) => {
  try {
    const { offerID } = req.body;
    const offerlist = await Offer.findById(offerID);
    Product.find({ name: offerlist.offerid })
      .then((products) => {
        products[0].price = products[0].offer.realprice;
        products[0].offer.offerpercent = 0;
        products[0].save();
      })
      .catch(() => {
        res.render('user/error');
      });
    await Offer.findByIdAndDelete(offerlist._id);
    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  categoryOffer,
  offerManagement,
  deleteOffer,
  productOffer,
  deleteProductOffer,
};

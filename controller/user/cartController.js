/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
const Product = require('../../models/productModel.js');
const User = require('../../models/userModel.js');
const Coupon = require('../../models/couponModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
// ************************cart page section*************************//
const cartLoading = async (req, res) => {
  try {
    const userdata = req.session.user;
    const products = await Product.find();
    const user = await User.findOne({ _id: userdata._id })
      .populate('cart.product')
      .lean();
    const updatedCart = user.cart.filter((item) => item);
    updatedCart.map(async (item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product._id.toString(),
      );
      if (product && !product.outofstock) {
        item.quantity = Math.min(item.quantity, product.stock);
        const stockes = product.stock;
        await User.findOneAndUpdate(
          {
            _id: userdata._id,
            'cart.product': product._id,
          },
          {
            $set: { 'cart.$.quantity': Math.min(item.quantity, stockes) },
          },
        );
      } else {
        await User.findOneAndUpdate(
          {
            _id: userdata._id,
          },
          {
            $pull: { cart: { product: product._id } },
          },
        );
      }

      return item;
    });
    req.session.mycoupon = null;
    const cart = updatedCart;
    if (cart.length === 0) {
      res.render('user/emptycart', { userdata });
    } else {
      const cartitemCount = cart.length;
      let subTotal = 0;
      cart.forEach((val) => {
        val.total = val.product.price * val.quantity;
        subTotal += val.total;
      });
      const cartCategories = cart.map((item) => item.product.category);
      const avilableCoupon = await Coupon.find({
        userId: { $nin: [userdata._id] },
        status: { $ne: 'Inactive' },
        minimum: { $lte: subTotal },
        $or: [
          { coupontype: 'Common' },
          {
            $and: [
              {
                $or: [
                  { product: { $in: cart.map((item) => item.product.name) } },
                  { category: { $in: cartCategories.map((item) => item) } },
                ],
              },

              { coupontype: 'Special' },
            ],
          },
        ],
      });
      res.render('user/cart', {
        cart,
        subTotal,
        cartitemCount,
        userdata,
        avilableCoupon,
        title: ' Cart',
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************add to cart section*************************//
const addToCart = async (req, res) => {
  try {
    const { proId } = req.body;
    const userId = req.session.user._id;
    const product = await Product.findById(proId);
    const existed = await User.findOne({ _id: userId, 'cart.product': proId });
    if (existed) {
      await User.findOneAndUpdate(
        { _id: userId, 'cart.product': proId },
        { $inc: { 'cart.$.quantity': 1 } },
        { new: true },
      );
      res.json('alreadyAdded');
    } else {
      await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { product: product._id } } },
        { new: true },
      );
      res.json('Added');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************remove cart section*************************//
const removecart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { prodId } = req.body;
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: prodId } } },
    );

    res.json('success');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************quantity  cart section*************************//
const quantityIncrement = async (req, res) => {
  try {
    const { prodId, method, coupon } = req.body;
    const userId = req.session.user._id;
    const productStock = await Product.findById(prodId);
    const CartProductStock = await User.findOne({
      'cart.product': prodId,
      _id: userId,
    });
    const cartlist = CartProductStock.cart;
    // eslint-disable-next-line no-inner-declarations
    function findquantity(prodId) {
      for (const item of cartlist) {
        if (item.product.toString() === prodId.toString()) {
          return item.quantity;
        }
      }
    }
    let cartquantity = findquantity(prodId);
    if (method !== 'increment') {
      cartquantity -= 1;
    }
    if (cartquantity < productStock.stock) {
      if (method === 'increment') {
        await User.findOneAndUpdate(
          { _id: userId, 'cart.product': prodId },
          { $inc: { 'cart.$.quantity': 1 } },
          { new: true },
        );
      } else {
        await User.findOneAndUpdate(
          { _id: userId, 'cart.product': prodId },
          { $inc: { 'cart.$.quantity': -1 } },
          { new: true },
        );
      }
      const quant = await User.findOne(
        { _id: userId, 'cart.product': prodId },
        { 'cart.$': 1 },
      );
      const user = await User.findOne({ _id: userId })
        .populate('cart.product')
        .lean();
      const { cart } = user;
      let subTotal = 0;
      cart.forEach((val) => {
        val.total = val.product.price * val.quantity;
        subTotal += val.total;
      });
      let lastprice;
      let discounamount;
      if (coupon !== '') {
        const coupondata = await Coupon.findOne({ code: coupon });
        if (subTotal > coupondata.maximum) {
          discounamount = Math.ceil(
            coupondata.maximum * (coupondata.percent / 100),
          );
          lastprice = subTotal - discounamount;
        } else {
          req.session.mycoupon = coupondata;
          discounamount = Math.ceil(subTotal * (coupondata.percent / 100));
          lastprice = subTotal - discounamount;
        }
      } else {
        lastprice = subTotal;
        discounamount = 0;
      }
      const totalQuantity = quant.cart[0].quantity;
      if (totalQuantity < 1) {
        await User.updateOne(
          { _id: userId },
          { $pull: { cart: { product: prodId } } },
        );
        res.json('success');
      } else {
        res.json({
          quantity: quant.cart,
          subTotal,
          lastprice,
          discounamount,
        });
      }
    } else {
      res.json({ stocklimit: 'stocklimit' });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************wishlist section*************************//
const wishlist = async (req, res) => {
  try {
    const userdata = req.session.user;
    const user = await User.findById(userdata._id);
    const wishlistProducts = await Product.find({ _id: user.wishlist });
    if (wishlistProducts.length === 0) {
      res.render('user/emptywishlist', { userdata, title: 'Wishlist' });
    }
    res.render('user/wishlist', {
      wishlistProducts,
      userdata,
      title: 'Wishlist',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************ wishlist to cart section*************************//
const wishlistToCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const prodId = req.params.id;
    const { index } = req.params;
    const userDatas = await User.findById(userId);
    userDatas.wishlist.splice(index, 1);
    const existed = await User.findOne({ _id: userId, 'cart.product': prodId });
    if (!existed) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { product: prodId } } },
        { new: true },
      );
    }
    await userDatas.save();
    res.redirect('/wishlist');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************add to wishlist section*************************//
const addwishlist = async (req, res) => {
  try {
    const productId = req.body.data;
    const userId = req.session.user._id;
    const existed = await User.findOne({ _id: userId, wishlist: productId });
    if (existed) {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { wishlist: productId } },
        { new: true },
      );
      res.json('removed');
    } else {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $addToSet: { wishlist: productId } },
        { new: true },
      );
      res.json('Added');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************remove wishlist section*************************//
const removeWishlist = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { index } = req.params;
    const userData = await User.findById(userId);
    userData.wishlist.splice(index, 1);
    await userData.save();
    res.redirect('/wishlist');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
// ************************my coupon section*************************//
const mycoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const userdata = req.session.user;
    const checkcoupon = await Coupon.find({ code: coupon });
    if (checkcoupon.length > 0) {
      const coupondata = await Coupon.findOne({
        code: coupon,
        userId: {
          $nin: [userdata._id],
        },
      });

      if (coupondata) {
        req.session.mycoupon = coupondata;
        const user = await User.findOne({ _id: userdata._id })
          .populate('cart.product')
          .lean();
        const { cart } = user;
        let subTotal = 0;
        cart.forEach((val) => {
          val.total = val.product.price * val.quantity;
          subTotal += val.total;
        });
        let discounamount;
        let lastprice;
        if (subTotal > coupondata.minimum) {
          if (subTotal > coupondata.maximum) {
            discounamount = Math.ceil(
              coupondata.maximum * (coupondata.percent / 100),
            );
            lastprice = subTotal - discounamount;
          } else {
            discounamount = Math.ceil(subTotal * (coupondata.percent / 100));
            lastprice = subTotal - discounamount;
          }
          res.json({
            subTotal,
            lastprice,
            discounamount,
            couponname: coupondata.code,
          });
        } else {
          res.json('nocoupon');
        }
      } else {
        res.json('Useded');
      }
    } else {
      res.json('nocoupon');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const clearCoupon = async (req, res) => {
  try {
    const { coupon, couponSubTotal } = req.body;
    const coupondata = await Coupon.findOne({ code: coupon });
    if (coupondata) {
      req.session.mycoupon = coupondata;
      const subTotal = couponSubTotal;
      const lastprice = subTotal;
      res.json({
        subTotal,
        lastprice,
        couponname: coupondata.code,
      });
    } else {
      res.json('clear');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports = {
  cartLoading,
  addToCart,
  removecart,
  wishlist,
  addwishlist,
  removeWishlist,
  wishlistToCart,
  quantityIncrement,
  mycoupon,
  clearCoupon,
};

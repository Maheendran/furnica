/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const Banner = require('../../models/bannerModel.js');
const Category = require('../../models/categoryModel.js');
const Slider = require('../../models/sliderModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
const cloudinary = require('cloudinary').v2;

const banner = async (req, res) => {
  const bannerdata = await Banner.find();
  res.render('admin/banner', { bannerdata, title: 'Banners' });
};
const newbanner = async (req, res) => {
  try {
    const uploadPromises = req.files.map(
      (file) => new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        });
      }),
    );
    const images = await Promise.all(uploadPromises);
    const BannerData = new Banner({
      imageUrl: images,
      heading: req.body.heading,
      subheading: req.body.subheading,
      link: req.body.link,
    });
    BannerData.save();
    res.redirect('/admin/banner');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const updatebannerload = async (req, res) => {
  const bannerid = req.query.bannerId;
  try {
    const bannerdata = await Banner.findOne({ _id: bannerid });
    res.render('admin/updatebanner', { bannerdata, title: 'Update banner' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const postupdatebanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    const bannerimage = await Banner.findById(bannerId);
    const exImage = bannerimage.imageUrl;
    const { files } = req;
    let updImages = [];
    if (files && files.length > 0) {
      const uploadPromises = req.files.map(
        (file) => new Promise((resolve, reject) => {
          cloudinary.uploader.upload(file.path, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          });
        }),
      );

      const newImages = await Promise.all(uploadPromises);
      updImages = [...newImages];
      bannerimage.imageUrl = updImages;
    } else {
      updImages = exImage;
    }
    await Banner.findByIdAndUpdate(
      bannerId,
      {
        heading: req.body.heading,
        subheading: req.body.subheading,
        link: req.body.link,
        imageUrl: updImages,
      },
      { new: true },
    );
    res.redirect('/admin/banner');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
const deletebanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    await Banner.findByIdAndDelete(bannerId);
    res.redirect('/admin/banner');
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const slider = async (req, res) => {
  try {
    const category = await Category.find();
    const slider = await Slider.find();
    res.render('admin/slider', { category, slider });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const addslider = async (req, res) => {
  try {
    const uploadPromises = req.files.map(
      (file) => new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        });
      }),
    );

    const images = await Promise.all(uploadPromises);
    const sliderdata = new Slider({
      imageUrl: images,
      category: req.body.category,
    });
    sliderdata.save();
    const category = await Category.find();
    const slider = await Slider.find();
    res.render('admin/slider', { category, slider });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const deleteslider = async (req, res) => {
  try {
    const param = req.params.id;
    await Slider.findByIdAndDelete(param);
    res.redirect('/admin/sliders');
  } catch (error) {
    errorHandler(error, req, res);
  }
};
module.exports = {
  banner,
  newbanner,
  postupdatebanner,
  updatebannerload,
  deletebanner,
  slider,
  addslider,
  deleteslider,
};

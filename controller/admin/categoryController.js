/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable linebreak-style */
const Category = require('../../models/categoryModel.js');
const errorHandler = require('../../middleware/errorHandler.js');
const cloudinary = require('cloudinary').v2;
// ************************Category list section*************************//
const categorylist = async (req, res) => {
  try {
    const category = await Category.find();
    res.render('admin/categorylist', { category, title: 'Category' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************add category section*************************//
const addcategory = async (req, res) => {
  const category = await Category.find();
  // const images = req.files.map((file) => file.filename);
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
  if (req.body.category !== '') {
    const exist = await Category.find({
      category: { $regex: new RegExp(req.body.category, 'i') },
    });
    if (exist.length > 0) {
      res.render('admin/categorylist', {
        category,
        errorDetail: 'category already existed',
      });
    } else {
      const categorydata = new Category({
        category: req.body.category,
        imageUrl: images,
      });
      categorydata
        .save()
        .then(() => {
          res.redirect('/admin/addcategory');
        })
        .catch(() => {
          res.render('user/error');
        });
    }
  } else {
    res.render('admin/categorylist', { category });
  }
};

// ************************Update categorypage section*************************//
const updateCategorypage = async (req, res) => {
  const param = req.params.id;
  try {
    const category = await Category.findOne({ _id: param });
    res.render('admin/updatecategory', {
      category,
      param,
      errorDetail: '',
      title: 'Update category',
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// ************************ update Category section*************************//
const updatecategory = async (req, res) => {
  try {
    const proId = req.params.id;
    const categorys = await Category.findById(proId);
    const exImage = categorys.imageUrl;
    const { files } = req;
    let updImages = [];
    const { category } = req.body;
    const exist = await Category.find({
      category: { $regex: new RegExp(category, 'i') },
      _id: { $ne: proId },
    });
    if (exist.length === 0) {
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
        categorys.imageUrl = updImages;
      } else {
        updImages = exImage;
      }
      await Category.findByIdAndUpdate(
        proId,
        {
          category,
          imageUrl: updImages,
        },
        { new: true },
      );
      res.redirect('/admin/addcategory');
    } else {
      res.redirect('/admin/addcategory');
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
};
module.exports = {
  categorylist,
  addcategory,
  updateCategorypage,
  updatecategory,
};

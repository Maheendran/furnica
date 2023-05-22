/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const Product = require('../../models/productModel.js');
const Category = require('../../models/categoryModel.js');

// ************************Products page section*************************//
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const category = await Category.find();
    res.render('admin/newProduct', { products, category, title: 'Add product' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ************************create Products section*************************//
const createProduct = async (req, res) => {
  const images = req.files.map((file) => file.filename);
  const existName = await Product.find({
    name: { $regex: new RegExp(req.body.name, 'i') },
  });
  const products = await Product.find();
  const category = await Category.find();

  if (existName.length === 0) {
    if (
      req.body.name !== ''
      && req.body.price !== ''
      && req.body.description !== ''
      && req.body.stock !== ''
      && req.body.color !== ''
      && req.body.material !== ''
      && req.body.brand !== ''
      && req.body.overview !== ''
      && req.body.category !== ''
    ) {
      const productData = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        imageUrl: images,
        stock: req.body.stock,
        color: req.body.color,
        material: req.body.material,
        brand: req.body.brand,
        overview: req.body.overview,
        'offer.offerpercent': 0,
        'offer.realprice': req.body.price,
      });
      productData
        .save()
        .then(() => {
          res.redirect('/furnica/admin/productlist');
        })
        .catch(() => {
          res.render('user/error');
        });
    } else {
      res.redirect('/furnica/admin/productlist');
    }
  } else {
    res.render('admin/newProduct', {
      products,
      category,
      errorDetail: 'Name already exist',
    });
  }
};
// ************************Products lists section*************************//
const productlist = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.render('admin/productlist', { products, title: 'Product list' });
  } catch (error) {
    res.render('user/error');
  }
};
// ************************ update Products section*************************//
const updateproduct = async (req, res) => {
  try {
    const param = req.params.id;
    // paramid = req.params.id;
    const product = await Product.findOne({ _id: param });

    const { imageUrl } = product;

    const category = await Category.find();

    res.render('admin/updateProduct', {
      param, product, category, imageUrl, title: 'Update product',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ************************post updateProducts section*************************//
const productUpdated = async (req, res) => {
  try {
    const proId = req.params.id;
    const product = await Product.findById(proId);
    const exImage = product.imageUrl;
    const { files } = req;
    let updImages = [];

    if (files && files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updImages = [...exImage, ...newImages];
      product.imageUrl = updImages;
    } else {
      updImages = exImage;
    }

    const {
      name,
      price,
      description,
      category,
      color,
      brand,
      material,
      overview,
      stock,

    } = req.body;
    let outofstock;
    if (Number(stock) > 0) {
      outofstock = false;
    } else {
      outofstock = true;
    }
    await Product.findByIdAndUpdate(
      proId,
      {
        name,
        price,
        description,
        category,
        is_blocked: false,
        imageUrl: updImages,
        color,
        brand,
        material,
        overview,
        stock,
        outofstock,
      },
      { new: true },
    );
    res.redirect('/furnica/admin/productlist');
  } catch (error) {
    res.render('user/error');
  }
};

// ************************delete Products section*************************//
const productdelete = async (req, res) => {
  try {
    const param = req.params.id;
    await Product.findByIdAndDelete(param);
    res.redirect('/furnica/admin/productlist');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ************************delete Products image section*************************//
const prodImageDelete = async (req, res) => {
  try {
    const param = req.body.id;
    const imageindex = req.body.index;

    const productData = await Product.findById(param);

    productData.imageUrl.splice(imageindex, 1);
    await productData.save();

    // const product = await Product.findOne({ _id: param });

    // const { imageUrl } = product;

    // const category = await Category.find();
    res.json('success');
  } catch (error) {
    res.render('user/error');
  }
};

module.exports = {
  getProducts,
  createProduct,
  productlist,
  updateproduct,
  productUpdated,
  prodImageDelete,
  productdelete,
};

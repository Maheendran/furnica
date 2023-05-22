/* eslint-disable linebreak-style */
/* eslint-disable radix */
const { ObjectId } = require('mongodb');
const Product = require('../../models/productModel');

// ************************sortby section*************************//
const sortby = async (req, res) => {
  const categoryId = req.query.category ? new ObjectId(req.query.category) : null;
  const sortValue = req.query.sortBy;
  const searchValue = req.query.search;
  const pageNumber = parseInt(req.query.page || 1);
  const pageSize = 4;

  let sortType = 1;
  if (req.query.sortOrder) {
    if (req.query.sortOrder === 'desc' || req.query.sortOrder === 'ztoa') {
      sortType = -1;
    }
  }

  const pipeline = [];

  if (categoryId) {
    pipeline.push({
      $match: {
        category: categoryId,
      },
    });
  }

  if (sortValue === 'name') {
    pipeline.push({
      $addFields: {
        name_lower: { $toLower: '$name' },
      },
    });
    pipeline.push({
      $sort: {
        name_lower: sortType,
      },
    });
    pipeline.push({
      $project: {
        name_lower: 0,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        [sortValue]: sortType,
      },
    });
  }

  if (searchValue) {
    pipeline.push({
      $match: {
        name: {
          $regex: searchValue,
          $options: 'i',
        },
      },
    });
  }

  const results = await Product.aggregate(pipeline);
  const userdata = req.session.user;

  const totalItems = results.length;

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
  const pageData = results.slice(startIndex, endIndex + 1);

  res.render('user/productlist', {
    productList: pageData,
    userdata,
    totalPages,
    pageNumber,
    title: 'Products',
  });
};

module.exports = {
  sortby,
};

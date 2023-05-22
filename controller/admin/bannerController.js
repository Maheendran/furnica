/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
const Banner = require('../../models/bannerModel.js');

const banner = async (req, res) => {
  const bannerdata = await Banner.find();
  res.render('admin/banner', { bannerdata, title: 'Banners' });
};

const newbanner = async (req, res) => {
  try {
    const images = req.files.map((file) => file.filename);

    const BannerData = new Banner({
      imageUrl: images,
      heading: req.body.heading,
      subheading: req.body.subheading,
      link: req.body.link,
    });
    BannerData.save();
    res.redirect('/furnica/admin/banner');
  } catch {
    res.render('user/error');
  }
};

const updatebannerload = async (req, res) => {
  const bannerid = req.query.bannerId;
  try {
    const bannerdata = await Banner.findOne({ _id: bannerid });
    res.render('admin/updatebanner', { bannerdata, title: 'Update banner' });
  } catch (error) {
    res.render('user/error');
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
      const newImages = req.files.map((file) => file.filename);
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
    res.redirect('/furnica/admin/banner');
  } catch (error) {
    res.render('user/error');
  }
};

const deletebanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    await Banner.findByIdAndDelete(bannerId);
    res.redirect('/furnica/admin/banner');
  } catch (error) {
    res.render('user/error');
  }
};
module.exports = {
  banner,
  newbanner,
  postupdatebanner,
  updatebannerload,
  deletebanner,
};

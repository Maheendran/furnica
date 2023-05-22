/* eslint-disable linebreak-style */
const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin === undefined) {
      res.render('admin/login');
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect('/furnica/admin/dashboard');
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { isLogin, isLogout };

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect("/furnica/home");
    } else {
      next();
    }
  } catch (error) {
    res.render("user/error")
  }
};

const loggedin = async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.redirect("/furnica/login");
    } else {
      next();
    }
  } catch (error) {
    res.render("user/error")
  }
};

const isOtp = async (req, res, next) => {
  try {
    if (req.session.otpsession !== undefined) {
      next();
    } else {
      res.render("user/forgotpassword/mailSubmittion");
    }
  } catch (error) {
    res.render("user/error")
  }
};

const isOtpsignup = async (req, res, next) => {
  try {
    if (req.session.otpsession !== undefined) {
      next();
    } else {
      res.render("user/signup");
    }
  } catch (error) {
    res.render("user/error")
  }
};

module.exports = {
  isLogin,
  isOtp,
  isOtpsignup,
  loggedin,
};

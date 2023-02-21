const Review = require("../models/Review.model");

const isLoggedIn = (req, res, next) => {
  if (!req.session.activeUser) {
    res.redirect("/auth/login");
  } else {
    next();
  }
};

const updateUserActiveLocal = (req, res, next) => {
  if (req.session.activeUser === undefined) {
    res.locals.isUserActive = false;
  } else {
    res.locals.isUserActive = true;
  }
  next();
};

const updateIsOwnerLocal = async (req, res, next) => {
  try {
    const foundReview = await Review.findById(req.params.reviewId);

    console.log("active user", req.session.activeUser._id);
    console.log("author", foundReview.author._id);

    if (foundReview.author === req.session.activeUser._id) {
      res.locals.isUserOwner = true;
    } else {
      res.locals.isUserOwner = false;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isLoggedIn, updateUserActiveLocal, updateIsOwnerLocal };

const Review = require("../models/Review.model");

const updateUserActiveLocal = (req, res, next) => {
  if (req.session.activeUser === undefined) {
    res.locals.isUserActive = false;
  } else {
    res.locals.isUserActive = true;
  }
  next();
};

const updateIsReviewOwnerLocal = async (req, res, next) => {
  try {
    const foundReview = await Review.findById(req.params.reviewId);
    const foundReviewId = foundReview.author.toString();

    if (
      res.locals.isUserActive &&
      foundReviewId === req.session.activeUser._id
    ) {
      res.locals.isReviewOwner = true;
    } else {
      res.locals.isReviewOwner = false;
    }

    next();
  } catch (error) {
    next(error);
  }
};
const updateItsMeLocal = (req, res, next) => {
  if (
    req.session.activeUser &&
    req.session.activeUser._id === req.params.profileId
  ) {
    res.locals.itsMe = true;
  } else {
    res.locals.itsMe = false;
  }
  next();
};

module.exports = {
  updateUserActiveLocal,
  updateIsReviewOwnerLocal,
  updateItsMeLocal,
};

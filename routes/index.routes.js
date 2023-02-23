const express = require("express");
const router = express.Router();
const { updateUserActiveLocal } = require("../middleware/auth");

const Review = require("../models/Review.model");

router.use(updateUserActiveLocal);

/* GET home page */
router.get("/", async (req, res, next) => {
  // TODO => DRY to util or middleware
  const getUserId = () => {
    if (req.session.activeUser) {
      return req.session.activeUser._id;
    }
  };

  try {
    const latestEntries = await Review.find()
      .populate("author", "_id username")
      .select({
        author: 1,
        albumImg: 1,
        albumName: 1,
        artistNames: 1,
        spotifyId: 1,
      })
      .sort({ updatedAt: -1 })
      .limit(3);

    res.render("index.hbs", { latestEntries, userActiveId: getUserId() });
  } catch (error) {
    next(error);
  }
});

const authRoutes = require("./auth.routes");
router.use("/auth", authRoutes);

const profileRoutes = require("./profile.routes.js");
router.use("/profile", profileRoutes);

const reviewRoutes = require("./review.routes");
router.use("/review", reviewRoutes);

module.exports = router;

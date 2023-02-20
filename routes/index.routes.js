const express = require("express");
const router = express.Router();
const { updateLocals } = require("../middleware/auth");

const Review = require("../models/Review.model");

router.use(updateLocals);

/* GET home page */
router.get("/", async (req, res, next) => {
  try {
    const latestEntries = await Review.find()
      .select({ albumName: 1, albumImg: 1, subheading: 1 })
      .sort({ updatedAt: 1 })
      .limit(3);

    res.render("index.hbs", { latestEntries });
  } catch (error) {
    next(error);
  }
  res.render("index");
});

const authRoutes = require("./auth.routes");
router.use("/auth", authRoutes);

const profileRoutes = require("./profile.routes.js");
router.use("/profile", profileRoutes);

const reviewRoutes = require("./review.routes");
router.use("/review", reviewRoutes);

module.exports = router;

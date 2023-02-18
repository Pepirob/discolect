const express = require("express");
const router = express.Router();
const { updateLocals } = require("../middleware/auth");

router.use(updateLocals);

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

const authRoutes = require("./auth.routes");
router.use("/auth", authRoutes);

const profileRoutes = require("./profile.routes.js");
router.use("/profile", profileRoutes);

const reviewRoutes = require("./review.routes");
router.use("/review", reviewRoutes);

module.exports = router;

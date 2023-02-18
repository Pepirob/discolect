const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, async (req, res, next) => {
  res.render("profile/my-profile.hbs");
});

module.exports = router;

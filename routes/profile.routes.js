const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/auth");
const User = require("../models/User.model");

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userData = await User.findById(req.session.activeUser._id);
    const date = new Date(userData.createdAt);
    const registerDate = date.toLocaleDateString();

    res.render("profile/my-profile.hbs", {
      registerDate,
      userData,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/edit", isLoggedIn, (req, res, next) => {
  const { username, email, image } = req.session.activeUser;

  res.render("profile/form-edit.hbs", {
    username,
    email,
    image,
  });
});

module.exports = router;

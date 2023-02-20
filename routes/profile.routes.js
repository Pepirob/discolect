const express = require("express");
const router = express.Router();

const fileUploader = require("../config/cloudinary.config");

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

router.get("/edit", isLoggedIn, async (req, res, next) => {
  const { _id } = req.session.activeUser;
  try {
    const foundUser = await User.findById(_id);

    res.render("profile/form-edit.hbs", {
      username: foundUser.username,
      email: foundUser.email,
      image: foundUser.image,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/edit", fileUploader.single("avatar"), async (req, res, next) => {
  const { username, email, existingAvatar } = req.body;

  let imageUrl;
  if (req.file) {
    imageUrl = req.file.path;
  } else {
    imageUrl = existingAvatar;
  }
  try {
    await User.findByIdAndUpdate(
      req.session.activeUser._id,
      {
        username,
        email,
        image: imageUrl,
      },
      { new: true }
    );

    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.session.activeUser._id);
    req.session.destroy((error) => {
      if (error) {
        next(error);
      }
      res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

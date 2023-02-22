const express = require("express");
const router = express.Router();

const fileUploader = require("../config/cloudinary.config");

const { isLoggedIn } = require("../middleware/auth");
const Review = require("../models/Review.model");
const User = require("../models/User.model");

router.get("/", isLoggedIn, async (req, res, next) => {
  const userId = req.session.activeUser._id;

  try {
    const userData = await User.findById(userId);

    const userReviews = await Review.find(
      { author: userId },
      { spotifyId: 1, albumName: 1, albumImg: 1, artistNames: 1 }
    );

    const date = new Date(userData.createdAt);
    const registerDate = date.toLocaleDateString();

    res.render("profile/my-profile.hbs", {
      registerDate,
      userData,
      userReviews,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/edit", isLoggedIn, async (req, res, next) => {
  const { _id } = req.session.activeUser;
  const { errorMessage } = req.query;

  try {
    const foundUser = await User.findById(_id);

    res.render("profile/form-edit.hbs", {
      username: foundUser.username,
      email: foundUser.email,
      image: foundUser.image,
      errorMessage,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/edit", fileUploader.single("avatar"), async (req, res, next) => {
  const { username, email, existingAvatar } = req.body;

  if (!username || !email) {
    res.render("profile/form-edit.hbs", {
      errorMessage: "All fields must be filled",
    });
    return;
  }

  let imageUrl;

  if (req.file) {
    imageUrl = req.file.path;
  } else {
    imageUrl = existingAvatar;
  }

  try {
    const currentUser = await User.findById(req.session.activeUser._id, {
      username: 1,
      email: 1,
    });

    if (username !== currentUser.username) {
      const foundUserByName = await User.findOne({ username: username });

      if (foundUserByName) {
        const errorMessage = "User with username already exists";

        res.redirect(`/profile/edit?errorMessage=${errorMessage}`);

        return;
      }
    }

    if (email !== currentUser.email) {
      const foundUserByEmail = await User.findOne({ email: email });

      if (foundUserByEmail) {
        const errorMessage = "User with email already exists";

        res.redirect(`/profile/edit?errorMessage=${errorMessage}`);

        return;
      }
    }

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

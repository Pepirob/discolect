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
      name: 1,
    });

    console.log(currentUser.username);

    console.log(currentUser.username);

    if (username !== currentUser.username) {
      const foundUserByName = await User.findOne({ username: username });

      if (foundUserByName) {
        res.render("profile/form-edit.hbs", {
          errorMessage: "User with username already exists",
        });
        return;
      }
    }

    if (email !== currentUser.email) {
      const foundUserByEmail = await User.findOne({ email: email });

      if (foundUserByEmail) {
        res.render("profile/form-edit.hbs", {
          errorMessage: "User with email already exists",
        });
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

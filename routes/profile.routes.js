const express = require("express");
const router = express.Router();

const fileUploader = require("../config/cloudinary.config");

const { updateItsMeLocal } = require("../middleware/auth");
const Review = require("../models/Review.model");
const User = require("../models/User.model");

router.get("/:profileId", updateItsMeLocal, async (req, res, next) => {
  const { profileId } = req.params;

  // TODO => DRY to util or middleware...or use profileId
  const getUserId = () => {
    if (req.session.activeUser) {
      return req.session.activeUser._id;
    }
  };

  try {
    const userData = await User.findById(profileId);

    const userReviews = await Review.find(
      { author: profileId },
      { spotifyId: 1, albumName: 1, albumImg: 1, artistNames: 1 }
    );

    const date = new Date(userData.createdAt);
    const registerDate = date.toLocaleDateString();

    res.render("profile/my-profile.hbs", {
      registerDate,
      userData,
      userReviews,
      userActiveId: getUserId(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:profileId/edit", async (req, res, next) => {
  const { profileId } = req.params;
  const { errorMessage } = req.query;

  try {
    const foundUser = await User.findById(profileId);

    res.render("profile/form-edit.hbs", {
      username: foundUser.username,
      userId: profileId,
      email: foundUser.email,
      image: foundUser.image,
      errorMessage,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:profileId/edit",
  fileUploader.single("avatar"),
  async (req, res, next) => {
    const { profileId } = req.params;
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
      const currentUser = await User.findById(profileId, {
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
        profileId,
        {
          username,
          email,
          image: imageUrl,
        },
        { new: true }
      );

      res.redirect(`/profile/${profileId}`);
    } catch (error) {
      next(error);
    }
  }
);

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

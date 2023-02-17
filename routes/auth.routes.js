const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const capitalize = require("../utils/capitalize");

router.get("/signup", (req, res) => {
  res.render("auth/form-signup.hbs");
});

router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    await User.create({
      email,
      password: hashPassword,
      username,
      blogName: capitalize(username),
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res) => {
  res.render("auth/form-login.hbs");
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      res.render("auth/form-login.hbs", {
        errorMesage: "User with username doesn't exists",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      res.render("auth/form-login.hbs", {
        errorMesage: "Invalid password",
      });
      return;
    }

    req.session.activeUser = foundUser;

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    next(err);
  }
});

module.exports = router;

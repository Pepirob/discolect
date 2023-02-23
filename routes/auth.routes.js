const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const { capitalize } = require("../utils");

router.get("/signup", (req, res) => {
  res.render("auth/form-signup.hbs");
});

router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  if (!username || !email || !password) {
    res.render("auth/form-signup.hbs", {
      errorMessage: "All fields must be filled",
    });
    return;
  }

  if (password.length < 9 || password.length > 15) {
    res.render("auth/form-signup.hbs", {
      errorMessage:
        "password must containt at least 9 characters and no more than 15",
    });
    return;
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{9,}$/;

  if (!passwordRegex.test(password)) {
    res.render("auth/form-signup.hbs", {
      errorMessage:
        "must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
    });
    return;
  }

  try {
    const foundUserByName = await User.findOne({ username: username });

    if (foundUserByName) {
      res.render("auth/form-signup.hbs", {
        errorMessage: "User with username already exists",
      });
      return;
    }

    const foundUserByEmail = await User.findOne({ email: email });

    if (foundUserByEmail) {
      res.render("auth/form-signup.hbs", {
        errorMessage: "User with email already exists",
      });
      return;
    }

    await User.create({
      email,
      password: hashPassword,
      username,
      blogName: capitalize(username),
    });

    res.redirect("/auth/login");
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
        errorMessage: "User with username doesn't exists",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      res.render("auth/form-login.hbs", {
        errorMessage: "Invalid password",
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

router.get("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    }

    res.redirect("/auth/login");
  });
});

module.exports = router;

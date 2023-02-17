const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const capitalize = require("../utils/capitalize");

router.get("/signup", (req, res) => {
  res.render("auth/form-signup.hbs");
});

router.post("/signup", async (req, res, next) => {
  const { email, password, username } = req.body;

  try {
    await User.create({
      email,
      password,
      username,
      blogName: capitalize(username),
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

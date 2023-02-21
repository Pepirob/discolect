const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    blogName: {
      type: String,
      trim: true,
      unique: true,
    },
    favourites: [String],
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/33/33724.png",
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;

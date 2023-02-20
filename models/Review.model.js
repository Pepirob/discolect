const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      // TODO apply minLength: 500,
      maxLength: 5500,
    },
    subheading: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    rating: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    albumName: {
      type: String,
      required: true,
      unique: true,
    },
    albumImg: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/33/33724.png",
    },
  },
  {
    timestamps: true,
  }
);

const Review = model("Review", reviewSchema);

module.exports = Review;

const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
  author: {},
  content: {
    type: String,
    required: true,
    minLength: 500,
    maxLength: 5500,
  },
  subheading: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
});

const Review = model("Post", reviewSchema);

module.exports = Review;
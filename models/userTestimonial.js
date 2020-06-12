
const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [false],
    },
    testimonial: {
      type: String,
      trim: true,
      required: [false],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model("usertestimonial", Schema);

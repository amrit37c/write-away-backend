
const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [false],
    },
    info: {
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


module.exports = mongoose.model("usercontact", Schema);

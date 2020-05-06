
const mongoose = require("mongoose");
// const bcrypt = require('bcryptjs');
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    guardian: {
      type: String,
      trim: true,
      required: [false],
    },
    guardianFirstName: {
      type: String,
      trim: true,
      required: [false],
    },
    guardianLastName: {
      type: String,
      trim: true,
      required: [false],
    },
    guardianEmail: {
      type: String,
      trim: true,
      required: [false],
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "A user must have firstname"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "A user must have lastname"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please provide a valid email"],
      unique: [true, "Email Already Registered"],
    },
    dob: {
      type: String,
      required: [true, "Please provide the dob"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model("User", userSchema);

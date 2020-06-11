
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
    guardianDob: {
      type: String,
      trim: true,
      required: [false],
    },
    guardianMobile: {
      type: String,
      trim: true,
      required: [false],
    },
    guardianLandline: {
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
    displayName: {
      type: String,
      trim: true,
      required: [false],
    },
    selectDisplayName: {
      type: Boolean,
      default: false,
    },
    aboutInfo: {
      type: String,
      trim: true,
      required: [false],
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
      trim: true,
      // required: [true, "Please provide the dob"],
    },
    gender: {
      type: String,
      trim: true,
      enum: ["male", "female"],
    },
    status: {
      type: String,
      enum: [0, 1, 2], // 0 - block, 1- active, 2-delete
      default: 1,
    },
    mobile: {
      type: String,
      trim: true,
      required: [false],
    },
    landline: {
      type: String,
      trim: true,
      required: [false],
    },
    school: {
      type: String,
      trim: true,
      required: [false],
    },
    class: {
      type: String,
      trim: true,
      required: [false],
    },
    section: {
      type: String,
      trim: true,
      required: [false],
    },
    address: {
      type: String,
      trim: true,
      required: [false],
    },
    address2: {
      type: String,
      trim: true,
      required: [false],
    },
    country: {
      type: String,
      trim: true,
      required: [false],
    },
    state: {
      type: String,
      trim: true,
      required: [false],
    },
    city: {
      type: String,
      trim: true,
      required: [false],
    },
    zipCode: {
      type: String,
      trim: true,
      required: [false],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      trim: true,
      required: [false],
    },
    acceptOffer: {
      type: String,
      default: true,
    },
    verified: {
      type: String,
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

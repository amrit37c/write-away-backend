
const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    verifyCode: {
      type: String,
      trim: true,
      required: [false],
    },
    verifyStatus: {
      type: String,
      enum: [0, 1], // 0 - unverify , 1 - verify,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model("VerifyUserSchema", verifySchema);

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  likeStatus: {
    type: "String",
    enum: [0, 1], // 0 - false , 1 - true
    default: 1,
  },
  publicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "publication",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


module.exports = mongoose.model("publicationlike", schema);

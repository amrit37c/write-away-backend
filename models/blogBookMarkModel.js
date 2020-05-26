const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  bookMarkStatus: {
    type: "String",
    enum: [0, 1], // 0 - unlike , 1 - unlike
    default: 1,
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogs",
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


module.exports = mongoose.model("blogbookmark", schema);

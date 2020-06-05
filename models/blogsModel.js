const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({

  title: {
    type: String,
    trim: true,
    required: [true, "Blog Title is required"],
  },
  content: {
    type: String,
    trim: true,
    required: [true, "Blog Title is required"],
  },
  media: {
    type: String,
    trim: true,
    required: [true, "Blog Image is required"],
  },
  readCount: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users",
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users",
  },
  copiesCount: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  activeBlog: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },


}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("blog", blogSchema);

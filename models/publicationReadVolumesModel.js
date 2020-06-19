const mongoose = require("mongoose");


const schema = mongoose.Schema({
  volumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "publicationreadvolumes",
  },
  topicTitle: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
  },
  topicDescription: {
    type: String,
    trim: true,
    required: [true, "Description is required"],
  },
  topicGenreImg: {
    type: [String],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  readCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: String,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("publicationReadVolume", schema);

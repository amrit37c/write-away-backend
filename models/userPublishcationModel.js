const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  topic: {
    type: String,
    trim: true,
    required: [false],
  },

  mediaAvailable: {
    type: [String],
    ref: "genre",
  },
  genre: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "genre",
  },
  publicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "publication",
  },
  content: {
    type: String,
    trim: true,
    required: [false],
  },
  isActive: {
    type: Boolean,
    default: false, // true - content sent for publish , false - draft mode
  },
  isPublished: {
    type: Boolean,
    default: false, // true - if published, false - not published
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },

  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  publicationType: {
    type: String,
    enum: ["bookmark", "writing"],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("userpublication", schema);

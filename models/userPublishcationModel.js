const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  topic: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
  },
  mediaAvailable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'genre'
  },
  publicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'publication'
  },
  content: {
    type: String,
    trim: true,
    required: [true,"Content is required"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false, // true - if published, false - not published
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
  publishedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("userpublication", schema);

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
  },
  mediaCover: {
    type: String,
    trim: true,
    required: [true, "Media Image is required"],
  },
  brief: {
    type: String,
    trim: true,
    required: [true, "Media Image is required"],
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  genres: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'genres'
  },
  genreDescription: {
    type: String,
    trim: true,
    required: [true, "Description is required"],
  },
  closingDate: {
    type: Date,
  },
  ageGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agegroups'
  },
  kickstarter:{
    type: String,
    trim: true,
    required:[false]
  },
  kickbookDesc:{
    type: String,
    trim: true,
    required:[false]
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  publicationRights: {
    type: String,
    enum: [1,2,3] // 1 - open for all, 2 - open for self, 3 - open for invitees only
  },
  wordCount:{
    type: String,
    trim: true,
    required:[false],
    length: { min: 0, max: 32 }
  },
  commercials:{
    type: String,
    enum: [1,2,3,4] //1 free writing-reading, 2 paid writing- free reading, 3 free writing- paid reading, 4  paid writing- paid reading
  },
  language: {
    type: String,
  },
  category: {
    type: String,
    enum: [1,2,3,4] // 1 - text, 2 - Image, 3 - Video, 4 - Audio 
  },
  categoryContent: {
    type: String,
  }
});

module.exports = mongoose.model("publication", schema);

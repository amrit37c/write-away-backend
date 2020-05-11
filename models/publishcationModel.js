const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
  },
  media: {
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
    type: String,
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

  },
  publicationRights: {
    type: String,
    //   enum: [1,2,3] // 1 - open for all, 2 - open for self, 3 - open for invitees only
  },
});

module.exports = mongoose.model("", schema);

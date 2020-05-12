const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
  },
  topicMedia: {
    type: Array,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("genre", schema);

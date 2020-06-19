const mongoose = require("mongoose");


const schema = mongoose.Schema({
  publicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "publications",
  },
  name: {
    type: String,
    trim: true,
    required: [true, "Title is required"],
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


module.exports = mongoose.model("publicationVolume", schema);

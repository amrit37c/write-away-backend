
const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
  {
    publicationId: {
      type: mongoose.Schema.ObjectId,
      ref: "publications",
    },
    platform: {
      type: String,
      enum: ["facebook", "twitter", "linkedin", "google+", "youtube", "instagram", "site"],
      default: "site",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);


module.exports = mongoose.model("Socialsharepublication", shareSchema);

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  ageRange: {
    type: Array,
    trim: true,
    validate: [arrayLimit, 'Age range exceeds the limit of 2']
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  }
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


function arrayLimit(val) {
    return val.length <= 2;
  }

module.exports = mongoose.model("agegroup", schema);

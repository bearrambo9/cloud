const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  usageCount: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: "#3b82f6",
    validate: {
      validator: function (v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: "Color must be a valid hex color (e.g., #3b82f6)",
    },
  },
});

const Tag = mongoose.model("Tag", TagSchema, "Tags");
module.exports = Tag;

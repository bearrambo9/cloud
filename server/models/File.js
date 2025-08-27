const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  targetPath: {
    type: String,
    required: true,
  },
  files: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "inProgress", "failed"],
    default: "inProgress",
  },
  creator: {
    type: String,
    required: true,
  },
});

const File = mongoose.model("File", FileSchema, "Files");
module.exports = File;

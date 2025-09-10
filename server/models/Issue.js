const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
  },
  files: [
    {
      name: { type: String, required: true },
      data: { type: Buffer, required: true },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  issueNumber: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const Issue = mongoose.model("Issue", IssueSchema, "Issues");
module.exports = Issue;

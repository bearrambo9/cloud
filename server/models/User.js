const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema, "Users");
module.exports = User;

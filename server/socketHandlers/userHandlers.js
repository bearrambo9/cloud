const User = require("../models/User");
const jwt = require("jsonwebtoken");

const userHandlers = (socket, io) => {
  socket.on("getUserData", async (data, callback) => {
    const { token } = data;

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) callback({ error: "Invalid token" });

      const { email } = user;

      const result = await User.findOne({ email });

      if (result && result._id) {
        callback(result);
      } else {
        callback({ error: "No user found" });
      }
    });
  });
};

module.exports = userHandlers;

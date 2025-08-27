const User = require("../models/User");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
    if (err) if (err) return res.json({ error: "Invalid token" });

    if (user.role == 0) {
      return res.json({ error: "Only admins can create new accounts" });
    } else if (user.role == 1) {
      try {
        const { email, password, name, role } = req.body;

        const exist = await User.findOne({ email });

        if (!email) {
          return res.json({
            error: "Email is required",
          });
        }

        if (!name) {
          return res.json({
            error: "Name is required",
          });
        }

        if (!password || password.length < 8) {
          return res.json({
            error:
              "Password is required and must be at least 8 characters longx ",
          });
        }

        if (exist) {
          return res.json({
            error: "Email already in use",
          });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
          email: email,
          password: hashedPassword,
          role: role,
          name: name,
        });

        return res.json(user);
      } catch (error) {
        console.log(error);
        return res.json({
          error: "Something went wrong",
        });
      }
    }
  });
};

const validateToken = async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
    if (err) return res.json({ error: "Invalid token" });

    return res.json({ user });
  });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ error: "No user found" });
    }

    const match = await comparePassword(password, user.password);

    if (match) {
      jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;

          return res.cookie("token", token).json({ token: token });
        }
      );
    } else {
      res.json({ error: "Incorrect password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: "Something went wrong" });
  }
};

module.exports = { registerUser, loginUser, validateToken };

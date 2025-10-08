const User = require("../models/User");
const readline = require("node:readline/promises");
const { hashPassword } = require("./auth");

const checkUsers = async () => {
  const users = await User.find();

  if (users.length < 1) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      "There are no current admins in the database. Please create one now.\n"
    );

    const email = await rl.question("Enter email: ");
    const password = await rl.question("Enter password: ");
    var role = await rl.question(
      "Enter user role (viewer, helper, user, admin): "
    );
    const name = await rl.question("Enter user's name: ");

    if (!email) {
      console.log("Email is required");
    }

    if (!name) {
      console.log("Name is required");
    }

    if (!role) {
      role = "admin";
      console.log("No role was provided, defaulting to admin");
    }

    if (!password || password.length < 8) {
      console.log("Password is required and must be atleast 8 characters long");
    }

    const hashedPassword = await hashPassword(password);

    try {
      const user = await User.create({
        email: email,
        password: hashedPassword,
        role: role,
        name: name,
      });

      if (user && user._id) {
        console.log("Created user successfully");
        rl.close();
      } else {
        console.log("User failed to create");
        process.exit(1);
      }
    } catch (error) {
      console.log(`User failed to create. Error: ${error}`);
      process.exit(1);
    }
  }
};

module.exports = checkUsers;

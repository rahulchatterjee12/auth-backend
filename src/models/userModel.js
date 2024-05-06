const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please provide First Name"],
  },
  lastname: {
    type: String,
    required: [true, "Please provide Last Name"],
  },
  username: {
    type: String,
    required: [true, "Please provide a Username"],
    unique: [true, "Username already exists"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

module.exports = User;

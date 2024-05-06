const express = require("express");
const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// User Signup
router.post("/signup", async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, username } = req.body;

    //Check If the User is already exist
    const user_email = await User.findOne({ email });
    if (user_email) {
      res.status(400).json({ error: "Email already exist" });
    }
    const user_name = await User.findOne({ username });
    if (user_name) {
      res.status(400).json({ error: "User name is already exist" });
    }

    const slt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, slt);

    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return res.json({
      message: "User created successfully",
      success: true,
      data: savedUser,
    });
  } catch (error) {
    next(error);
  }
});

// User Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if user exist
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // check if password is correct

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return res.json({ error: "Wrong Password" }, { status: 400 });
    }

    // Create Token data
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    // create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token);

    res.json({
      message: "Login Successful",
      success: true,
    });

    return res;
  } catch (error) {
    next(error);
  }
});

// Logout User
router.get("/logout", async (req, res, next) => {
  try {
    res.cookie("token", "");

    res.json({
      message: "logout Successful",
      success: true,
    });

    return res;
  } catch (error) {
    next(error);
  }
});

// get User
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();

    const token = req.cookies;

    if (token.token) {
      const { exp } = jwt.decode(token.token);

      if (Date.now() <= exp * 1000) {
        res.json({
          message: "logout Successful",
          success: true,
          data: users,
        });
      }
    } else {
      res.status(400).json({
        message: "user is not logged in",
        success: false,
      });
    }

    return res;
  } catch (error) {
    next(error);
  }
});

module.exports = router;

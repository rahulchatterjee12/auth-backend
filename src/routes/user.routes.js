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
      return res.status(400).json({ error: "Email already exist" });
    }
    const user_name = await User.findOne({ username });
    if (user_name) {
      return res.status(400).json({ error: "User name is already exist" });
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

    // Create Token data
    const tokenData = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
    // create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
    });

    return res.json({
      message: "User created successfully",
      success: true,
      data: savedUser,
      token,
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
      return res.status(404).json({ error: "Wrong password" });
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

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
    });

    res.json({
      message: "Logged in Successfully",
      success: true,
      token,
      user,
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

// get Users
router.get("/", async (req, res, next) => {
  try {
    const token = req.cookies;

    if (token.token) {
      const { exp } = jwt.decode(token.token);
      const users = await User.find();

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

// get current user
router.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies;

    jwt.verify(token.token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(404).json({ message: "user is not logged in" });
      } else {
        // Extract the user ID from the decoded token
        const email = decoded.email;
        const user = await User.findOne({ email });
        res.status(200).json({
          success: true,
          user,
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

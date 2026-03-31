const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
const Submission = require("../models/submission");


const register = async (req, res) => {
  try {

    validate(req.body);

    const { firstName, emailID, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      emailID,
      password: hashedPassword,
      role: "user"
    });

    const token = jwt.sign(
      { _id: user._id, emailID: user.emailID, role: "user" },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const reply = {
      firstName: user.firstName,
      emailID: user.emailID,
      _id: user._id
    };

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true only in HTTPS
      maxAge: 60 * 60 * 1000
    });

    res.status(201).json({
      user: reply,
      message: "Registered successfully"
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



const login = async (req, res) => {
  try {

    const { emailID, password } = req.body;

    if (!emailID || !password) {
      throw new Error("Invalid Credentials");
    }

    const user = await User.findOne({ emailID });

    if (!user) {
      throw new Error("User not found");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error("Invalid Credentials");
    }

    const reply = {
      firstName: user.firstName,
      emailID: user.emailID,
      _id: user._id
    };

    const token = jwt.sign(
      { _id: user._id, emailID: user.emailID, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      user: reply,
      message: "Logged in successfully"
    });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};


const logout = async (req, res) => {
  try {

    const { token } = req.cookies;

    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, "blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.clearCookie("token");

    res.status(200).send("Logged out successfully");

  } catch (err) {
    res.status(503).json({ message: err.message });
  }
};


const adminRegister = async (req, res) => {
  try {

    validate(req.body);

    const { firstName, emailID, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      emailID,
      password: hashedPassword,
      role: "admin"
    });

    const token = jwt.sign(
      { _id: user._id, emailID: user.emailID, role: "admin" },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).json({
      message: "Admin registered successfully"
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const deleteProfile = async (req, res) => {
  try {

    const userID = req.result._id;

    await User.findByIdAndDelete(userID);

    await Submission.deleteMany({ userID });

    res.status(200).send("Deleted successfully");

  } catch (err) {
    res.status(500).send("Server error");
  }
};


const checkAuth = async (req, res) => {
  try {

    const user = req.result;

    res.status(200).json({ user });

  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};


module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  checkAuth
};
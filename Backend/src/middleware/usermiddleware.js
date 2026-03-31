const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const usermiddleware = async (req, res, next) => {
  try {
    // get token from cookies safely
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Token not present" });
    }

    // verify jwt token
    const payload = jwt.verify(token, process.env.JWT_KEY);

    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // check redis blocklist
    const isBlocked = await redisClient.exists(`token:${token}`);

    if (isBlocked) {
      return res.status(401).json({ message: "Token blocked" });
    }

    // attach user to request
    req.result = user;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
      error: err.message
    });
  }
};

module.exports = usermiddleware;
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const mongoose = require("mongoose");
const db = mongoose.connection;
const Users = require("../models/api/userModel");

module.exports.isAuthorized = (req, res, next) => {
  try {
    if (req.headers) {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, tokenSecret);
      const email = decodedToken.data.email;

      Users.findOne({ token: token, email: email }).then((user) => {
        // console.log(user._id.toString());
        if (!user) {
          res.status(401).json({
            status: "0",
            message: "Token mismatch!",
            respdata: {},
          });
          // throw "Invalid user ID";
        } else {
          next();
        }
      });
    }
  } catch {
    res.status(401).json({
      status: "0",
      message: "Invalid token!",
      respdata: {},
    });
  }
};

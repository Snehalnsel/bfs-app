var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/api/userModel");
const Userproduct = require("../../models/api/userproductModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
var ObjectId = require("mongodb").ObjectId;
const url = require("url");
var ObjectId = require("mongodb").ObjectId;


exports.getData = async function (req, res) {
  if (req.session.user) {
    try {
      var pageTitle = req.app.locals.siteName + " - Dashboard";

      const totalProducts = await Userproduct.countDocuments();
      const totalUsers = await Users.countDocuments();
      const totalSoldProduct = await Userproduct.countDocuments({ flag: 1 });

      res.render("pages/dashboard", {
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        respdata: {
          product: totalProducts,
          users: totalUsers,
          sold: totalSoldProduct
        },
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/");
  }
};



  
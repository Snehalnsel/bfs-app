var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Iptrnsaction = require("../../models/api/ipTransactionModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
// var { getAllActiveSessions } = require("../../middlewares/redis");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
const upload = multer({ dest: 'public/images/' }); 

//methods
exports.getList = async function (req, res, next) {
  var pageName = "IP List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  try {
    const ipTransactions = await Iptrnsaction.find().populate('user_id').sort({ _id: -1 });

    ipTransactions.forEach(transaction => {
      transaction.created_dtime = moment(transaction.created_dtime).format("YYYY-MM-DD HH:mm:ss");
    });
    
    res.render("pages/ip/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.admin.name,
      userImage: req.session.admin.image_url,
      userEmail: req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: ipTransactions,
      },
      isAdminLoggedIn: isAdminLoggedIn
    });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};



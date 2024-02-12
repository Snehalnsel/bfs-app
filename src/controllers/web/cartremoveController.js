var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Cartremove = require("../../models/api/cartremoveModel");
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
exports.getData = async function (req, res, next) {

  var pageName = "Cart Remove Time";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Cartremove.find().sort({ _id: -1 }).then((size) => {
    res.render("pages/cartitime/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName:  req.session.admin.name,
      userImage:  req.session.admin.image_url,
      userEmail:  req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: size,
      },
    });
  });
};

exports.addData = async function (req, res, next) {

  var pageName = "Cart Remove";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  res.render("pages/cartitime/create", {
    status: 1,
    siteName: req.app.locals.siteName,
    pageName: pageName,
    pageTitle: pageTitle,
    userFullName:  req.session.admin.name,
    userImage:  req.session.admin.image_url,
    userEmail:  req.session.admin.email,
    year: moment().format("YYYY"),
    requrl: req.app.locals.requrl,
    message: "",
    respdata: {},
  });
 
};

exports.createData = async function (req, res, next) {
  var pageName = "Cart Remove";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  Cartremove.findOne({ name: req.body.time }).then((size) => {
    if (size) {
      res.render("pages/cartitime/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        pageName: pageName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "Already exists!",
        requrl: req.app.locals.requrl,
        respdata: {},
      });
    } else {
    
      const newSize = Cartremove({
        name: req.body.time,
        added_dtime: dateTime,
      });
      newSize
        .save()
        .then((size) => {
          res.render("pages/cartitime/create", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            year: moment().format("YYYY"),
            message: "Added!",
            requrl: req.app.locals.requrl,
            respdata: size,
          });
        })
        .catch((error) => {
          res.render("pages/cartitime/create", {
            status: 0,
            pageName: pageName,
            siteName: req.app.locals.siteName,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            pageTitle: pageTitle,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            message: "Error!",
            respdata: error,
          });
        });
    }
  });
};


exports.editData = async function (req, res, next) {
  
  
  var pageName = "Cart Remove";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const id = mongoose.Types.ObjectId(req.params.id);

  Cartremove.findOne({ _id: id }).then((details) => {
    res.render("pages/cartitime/edit", {
      status: 1,
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName:  req.session.admin.name,
      userImage:  req.session.admin.image_url,
      userEmail:  req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      message: "",
      respdata: details,
    });
  });
};


exports.updateData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Cartremove.findOne({ _id: req.body.id }).then((details) => {
    if (!details) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      const requrl = req.app.locals.requrl;

      var updData = {
        name: req.body.name
      };

      Cartremove.findOneAndUpdate(
        { _id: req.body.id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            res.redirect("/carttime");
          }
        }
      );
    }
  });
};
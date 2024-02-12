var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Gender = require("../../models/api/genderModel");
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
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Gender";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  Gender.find().sort({ _id: -1 }).then((size) => {
    res.render("pages/gender/list", {
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
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};
exports.addData = async function (req, res, next) {
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Gender List";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  res.render("pages/gender/create", {
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
    isAdminLoggedIn:isAdminLoggedIn
  });
};
exports.createData = async function (req, res, next) {
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Gender";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  Gender.findOne({ name: req.body.size_name }).then((size) => {
    if (size) {
      res.render("pages/gender/create", {
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
        isAdminLoggedIn:isAdminLoggedIn
      });
    } else {
      const newGender = Gender({
        name: req.body.gender_name,
        short_code: req.body.gender_shrt_code,
        status: req.body.gender_status,
        added_dtime: dateTime,
      });
      newGender
        .save()
        .then((gender) => {
          res.render("pages/gender/create", {
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
            respdata: gender,
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((error) => {
          res.render("pages/gender/create", {
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
            isAdminLoggedIn:isAdminLoggedIn
          });
        });
    }
  });
};

exports.updateStatusData = async function (req, res, next) {
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const sizeId = req.params.id;
  Size.findById(sizeId)
    .then((size) => {
      if (!size) {
        return res.status(404).json({
          status: "0",
          message: "Size not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      size.status = size.status === 0 ? 1 : 0;
      size.save()
        .then((updatedSize) => {
          if (!updatedSize) {
            return res.status(404).json({
              status: "0",
              message: "Size status not updated!",
              respdata: {},
              isAdminLoggedIn:isAdminLoggedIn
            });
          }
          res.redirect("/genderlist"); 
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the size status.",
            respdata: {},
            isAdminLoggedIn:isAdminLoggedIn
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the size.",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
};
exports.deleteData = async function (req, res, next) {
  try {
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    const size = await Gender.findOne({ _id: req.params.id });
    if (!size) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    await Gender.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );
    res.redirect("/genderlist");
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

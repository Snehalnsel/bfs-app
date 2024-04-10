var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Color = require("../../models/api/colorModel");
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
  var pageName = "Color";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  Color.find().sort({ _id: -1 }).then((size) => {
    res.render("pages/color/list", {
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
  var pageName = "Color List";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  res.render("pages/color/create", {
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
  var pageName = "Color";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  Color.findOne({ name: req.body.size_name }).then((size) => {
    if (size) {
      res.render("pages/Color/create", {
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
      const newColor = Color({
        name: req.body.gender_name,
        short_code: req.body.gender_shrt_code,
        status: req.body.gender_status,
        added_dtime: dateTime,
      });
      newColor
        .save()
        .then((Color) => {
          res.redirect("/admin/colorlist");
        })
        .catch((error) => {
          res.render("pages/color/create", {
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
          res.redirect("/admin/colorlist"); 
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

exports.editData = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Product Condition";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
  const id = mongoose.Types.ObjectId(req.params.id);
  Color.findOne({ _id: id }).then((color) => {
    res.render("pages/color/edit", {
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
      respdata: color,
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};

exports.updateData = async function (req, res, next) {
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
    const color = await Color.findById(req.body.color_id);
    if (!color) {
      return res.status(404).json({
        status: "0",
        message: "color not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    const updData = {
      name: req.body.name || color.name,
      short_code: req.body.short_code || color.short_code,
      status: req.body.status || color.status,
    };
    const updatedColor = await Color.findByIdAndUpdate(
      req.body.color_id,
      updData,
      { new: true, runValidators: true }
    );
    if (!updatedColor) {
      return res.status(404).json({
        status: "0",
        message: "Colort data not  updated!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    res.redirect("/admin/colorlist");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while updating the brand.",
      respdata: {},
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
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
    const size = await Color.findOne({ _id: req.params.id });
    if (!size) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    await Color.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );
    res.redirect("/admin/colorlist");
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

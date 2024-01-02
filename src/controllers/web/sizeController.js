var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Size = require("../../models/api/sizeModel");
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

  var pageName = "Size";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Size.find().sort({ _id: -1 }).then((size) => {
    res.render("pages/size/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
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

  var pageName = "Size List";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  res.render("pages/size/create", {
    status: 1,
    siteName: req.app.locals.siteName,
    pageName: pageName,
    pageTitle: pageTitle,
    userFullName: req.session.user.name,
    userImage: req.session.user.image_url,
    userEmail: req.session.user.email,
    year: moment().format("YYYY"),
    requrl: req.app.locals.requrl,
    message: "",
    respdata: {},
  });
 
};

exports.createData = async function (req, res, next) {
  var pageName = "Size";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  Size.findOne({ name: req.body.size_name }).then((size) => {
    if (size) {
      res.render("pages/size/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        pageName: pageName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "Already exists!",
        requrl: req.app.locals.requrl,
        respdata: {},
      });
    } else {
    
      const newSize = Size({
        name: req.body.size_name,
        added_dtime: dateTime,
      });

      console.log(newSize);

      newSize
        .save()
        .then((size) => {
          res.render("pages/size/create", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName: req.session.user.name,
            userImage: req.session.user.image_url,
            userEmail: req.session.user.email,
            year: moment().format("YYYY"),
            message: "Added!",
            requrl: req.app.locals.requrl,
            respdata: size,
          });
        })
        .catch((error) => {
          res.render("pages/size/create", {
            status: 0,
            pageName: pageName,
            siteName: req.app.locals.siteName,
            userFullName: req.session.user.name,
            userImage: req.session.user.image_url,
            userEmail: req.session.user.email,
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

exports.updateStatusData = async function (req, res, next) {
  const sizeId = req.params.id;

  Size.findById(sizeId)
    .then((size) => {
      if (!size) {
        return res.status(404).json({
          status: "0",
          message: "Size not found!",
          respdata: {},
        });
      }

      // Toggle the status between 0 and 1
      size.status = size.status === 0 ? 1 : 0;

      // Save the updated size
      size.save()
        .then((updatedSize) => {
          if (!updatedSize) {
            return res.status(404).json({
              status: "0",
              message: "Size status not updated!",
              respdata: {},
            });
          }

          // Redirect to the list page or any other appropriate page
          res.redirect("/size"); // You can change this URL as needed
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the size status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the size.",
        respdata: {},
      });
    });
};



exports.deleteData = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const size = await Size.findOne({ _id: req.params.id });
    if (!size) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }

    await Size.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    // Redirect after successful deletion
    res.redirect("/size");
  } catch (error) {
    // Handle any errors that occur during the deletion process
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message, // Include the error message for debugging purposes
    });
  }
};

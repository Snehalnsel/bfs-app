var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Productcondition = require("../../models/api/productconditionModel");
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
  var pageName = "Product Condition";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Productcondition.find().sort({ _id: -1 }).then((productcondition) => {
    res.render("pages/productcondition/list", {
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
        list: productcondition,
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};

exports.addData = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Product Condition";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  res.render("pages/productcondition/create", {
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
  var pageName = "Product Condition";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  Productcondition.findOne({ name: req.body.condition_name }).then((productcondition) => {
    if (productcondition) {
      res.render("pages/productcondition/create", {
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
    
      const newProductcondition = Productcondition({
        name: req.body.condition_name,
        added_dtime: dateTime,
      });
      newProductcondition
        .save()
        .then((productcondition) => {
          res.render("pages/productcondition/create", {
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
            respdata: productcondition,
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((error) => {
          res.render("pages/productcondition/create", {
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
  const productconditioneId = req.params.id;
  Productcondition.findById(productconditioneId)
    .then((productcondition) => {
      if (!productcondition) {
        return res.status(404).json({
          status: "0",
          message: "Size not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      productcondition.status = productcondition.status === 0 ? 1 : 0;

      productcondition.save()
        .then((updatedProductcondition) => {
          if (!updatedProductcondition) {
            return res.status(404).json({
              status: "0",
              message: "Size status not updated!",
              respdata: {},
              isAdminLoggedIn:isAdminLoggedIn
            });
          }

         
          res.redirect("/productcondition"); 
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
  Productcondition.findOne({ _id: id }).then((productcondition) => {
    res.render("pages/productcondition/edit", {
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
      respdata: productcondition,
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
    const productcondition = await Productcondition.findById(req.body.condition_id);

    if (!productcondition) {
      return res.status(404).json({
        status: "0",
        message: "Product Condition not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const updData = {
      name: req.body.condition_name || productcondition.name,
    };


    const updatedProductcondition = await Productcondition.findByIdAndUpdate(
      req.body.condition_id,
      updData,
      { new: true, runValidators: true }
    );

    if (!updatedProductcondition) {
      return res.status(404).json({
        status: "0",
        message: "Product Condition not updated!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    res.redirect("/productcondition");
  } catch (error) {
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

    const productcondition = await Productcondition.findOne({ _id: req.params.id });
    if (!productcondition) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    await Productcondition.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    res.redirect("/productcondition");
  } catch (error) {
   
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the productcondition!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn 
    });
  }
};
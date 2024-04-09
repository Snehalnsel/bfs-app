var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
//const Size = require("../../models/api/sizeModel");
const Bestdeal = require("../../models/api/bestdealModel");
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


exports.getData = async function (req, res, next) {
    var pageName = "Best Deal";
    var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    Bestdeal.find().sort({ _id: -1 }).then((bestdeal) => {
      res.render("pages/bestdeal/list", {
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
          list: bestdeal,
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
    
  };

  exports.addData = async function (req, res, next) {

    var pageName = "Best Deal";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    res.render("pages/bestdeal/create", {
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
    var pageName = "Best Deal";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    Bestdeal.findOne({ name: req.body.deal_name }).then((bestdeal) => {
      if (bestdeal) {
        res.render("pages/bestdeal/create", {
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
      
        const newDeal = Bestdeal({
          name: req.body.deal_name,
          added_dtime: dateTime,
        });
    
        newDeal
          .save()
          .then((bestdeal) => {
            res.render("pages/bestdeal/list", {
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
              respdata: bestdeal,
              isAdminLoggedIn:isAdminLoggedIn
            });
          })
          .catch((error) => {
            res.render("pages/bestdeal/create", {
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

  exports.deleteData = async function (req, res, next) {
    try {
      const errors = validationResult(req);
      let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "0",
          message: "Validation error!",
          respdata: errors.array(),
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      const bestdeal = await Bestdeal.findOne({ _id: req.params.id });
      if (!bestdeal) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      await Brand.deleteOne(
        { _id: req.params.id },
        { w: "majority", wtimeout: 100 }
      );
      res.redirect("/admin/bestdeal");
    } catch (error) {
      return res.status(500).json({
        status: "0",
        message: "Error occurred while deleting the category!",
        respdata: error.message,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  };
  
  
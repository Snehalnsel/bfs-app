var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Appsettings = require("../../models/api/appSettingsModel");
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


exports.getData = async function (req, res, next) {
    // Validate request parameters, queries using express-validator
  
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    Appsettings.find().then((details) => {
      res.render("pages/app-settings/list", {
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
          list: details,
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  };


  exports.addData = async function (req, res, next) {
    
  
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    res.render("pages/app-settings/create", {
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
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("pages/app-settings/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        pageName: pageName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "Validation error!",
        requrl: req.app.locals.requrl,
        respdata: errors.array(),
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  
    Appsettings.findOne({ email: req.body.app_name }).then((users) => {
      if (users) {
        res.render("pages/app-settings/create", {
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
        const newSettings = Appsettings({
          app_ver: req.body.app_ver,
          app_name: req.body.app_name,
          app_privacy: req.body.app_privacy,
          app_about: req.body.app_about,
          best_deal: req.body.best_deal,
          created_dtime: dateTime,
        });

        newSettings
          .save()
          .then((settings) => {
    
            res.render("pages/app-settings/create", {
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
              respdata: settings,
              isAdminLoggedIn:isAdminLoggedIn
            });
          })
          .catch((error) => {
            res.render("pages/app-settings/create", {
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

  exports.editData = async function (req, res, next) {
  
  
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const user_id = mongoose.Types.ObjectId(req.params.id);
  
    Appsettings.findOne({ _id: user_id }).then((details) => {
      res.render("pages/app-settings/edit", {
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
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  };


  exports.updateData = async function (req, res, next) {
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
  
    Appsettings.findOne({ _id: req.body.app_id }).then((details) => {
      if (!details) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      } else {
        const requrl = req.app.locals.requrl;
  
        var updData = {
          app_ver: req.body.app_ver,
          app_name: req.body.app_name,
          app_privacy: req.body.app_privacy,
          best_deal: req.body.best_deal,
          app_about: req.body.app_about,
        };
  
        Appsettings.findOneAndUpdate(
          { _id: req.body.app_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              res.redirect("/admin/app-settings");
            }
          }
        );
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
  
      const appsettings = await Appsettings.findOne({ _id: req.params.id });
      if (!appsettings) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
  
      await Appsettings.deleteOne(
        { _id: req.params.id },
        { w: "majority", wtimeout: 100 }
      );
  
     
      res.redirect("/admin/app-settings");
    } catch (error) {
     
      return res.status(500).json({
        status: "0",
        message: "Error occurred while deleting the category!",
        respdata: error.message,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  };


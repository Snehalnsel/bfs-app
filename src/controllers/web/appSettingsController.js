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
  
    Appsettings.find().then((details) => {
      res.render("pages/app-settings/list", {
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
          list: details,
        },
      });
    });
  };


  exports.addData = async function (req, res, next) {
    
  
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
   
    res.render("pages/app-settings/create", {
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
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("pages/app-settings/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        pageName: pageName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "Validation error!",
        requrl: req.app.locals.requrl,
        respdata: errors.array(),
      });
    }
  
    Appsettings.findOne({ email: req.body.app_name }).then((users) => {
      if (users) {
        res.render("pages/app-settings/create", {
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
              userFullName: req.session.user.name,
              userImage: req.session.user.image_url,
              userEmail: req.session.user.email,
              year: moment().format("YYYY"),
              message: "Added!",
              requrl: req.app.locals.requrl,
              respdata: settings,
            });
          })
          .catch((error) => {
            res.render("pages/app-settings/create", {
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

  exports.editData = async function (req, res, next) {
  
  
    var pageName = "App Settings";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
  
    const user_id = mongoose.Types.ObjectId(req.params.id);
  
    Appsettings.findOne({ _id: user_id }).then((details) => {
      res.render("pages/app-settings/edit", {
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
  
    Appsettings.findOne({ _id: req.body.app_id }).then((details) => {
      if (!details) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
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
              res.redirect("/app-settings");
            }
          }
        );
      }
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
  
      const appsettings = await Appsettings.findOne({ _id: req.params.id });
      if (!appsettings) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      }
  
      await Appsettings.deleteOne(
        { _id: req.params.id },
        { w: "majority", wtimeout: 100 }
      );
  
     
      res.redirect("/app-settings");
    } catch (error) {
     
      return res.status(500).json({
        status: "0",
        message: "Error occurred while deleting the category!",
        respdata: error.message,
      });
    }
  };


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
//const Bestdeal = require("../../models/api/bestdealModel");
const Shippingchrgs = require("../../models/api/shippingchrgsModel");
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



exports.addData = async function (req, res, next) {

    var pageName = "Shipping Charges";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    res.render("pages/shippingcharges/create", {
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
    var pageName = "Shipping Details";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    Shippingchrgs.findOne({ name: req.body.shipping_name }).then((shippingchrgs) => {
      if (shippingchrgs) {
        res.render("pages/shippingcharges/create", {
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
      
        const newShippingchrgs = Shippingchrgs({
          name: req.body.shipping_name,
          added_dtime: dateTime,
        });
  
        console.log(newShippingchrgs);
  
        newShippingchrgs
          .save()
          .then((shippingchrgs) => {
            res.render("pages/shippingcharges/create", {
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
              respdata: shippingchrgs,
            });
          })
          .catch((error) => {
            res.render("pages/shippingcharges/create", {
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

  exports.getData = async function (req, res, next) {

    var pageName = "Shipping Charges";
    var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  
    Shippingchrgs.find().sort({ _id: -1 }).then((shippingchrgs) => {
      res.render("pages/shippingcharges/list", {
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
          list: shippingchrgs,
        },
      });
    });
  };

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

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    var pageName = "Shipping Charges";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    res.render("pages/shippingcharges/create", {
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
    var pageName = "Shipping Details";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    Shippingchrgs.findOne({ name: req.body.shipping_name }).then((shippingchrgs) => {
      if (shippingchrgs) {
        res.render("pages/shippingcharges/create", {
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
      
        const newShippingchrgs = Shippingchrgs({
          name: req.body.shipping_name,
          height: req.body.shipping_height,
          width: req.body.shipping_width,
          amount: req.body.shipping_amount,
          added_dtime: dateTime,
        });

        newShippingchrgs.save()
          .then((updatedSize) => {
            res.redirect("/admin/shippingchrgs"); 
          })
          .catch((error) => {
            console.log(error);
            res.render("pages/shippingcharges/create", {
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

  exports.getData = async function (req, res, next) {

    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    var pageName = "Shipping Boxes";
    var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  
    Shippingchrgs.find().sort({ _id: -1 }).then((shippingchrgs) => {
      res.render("pages/shippingcharges/list", {
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
          list: shippingchrgs,
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  };


  exports.editData = async function (req, res, next) {

    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    var pageName = "Product Condition";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
    const id = mongoose.Types.ObjectId(req.params.id);
    Shippingchrgs.findOne({ _id: id }).then((shippingchrgs) => {
      res.render("pages/shippingcharges/edit", {
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
        respdata: shippingchrgs,
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
      const shippingchrgs = await Shippingchrgs.findById(req.body.shipping_id);
      if (!shippingchrgs) {
        return res.status(404).json({
          status: "0",
          message: "color not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      const updData = {
        name: req.body.shipping_name,
        height: req.body.shipping_height,
        width: req.body.shipping_width,
        amount: req.body.shipping_amount,
        updated_dtime: dateTime,
      };
      const updatedColor = await Shippingchrgs.findByIdAndUpdate(
        req.body.shipping_id,
        updData,
        { new: true, runValidators: true }
      );
      // if (!updatedColor) {
      //   return res.status(404).json({
      //     status: "0",
      //     message: "Colort data not  updated!",
      //     respdata: {},
      //     isAdminLoggedIn:isAdminLoggedIn
      //   });
      // }
      res.redirect("/admin/shippingchrgs");
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
      const shippingchrgs = await Shippingchrgs.findOne({ _id: req.params.id });
      if (!shippingchrgs) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      await Shippingchrgs.deleteOne(
        { _id: req.params.id },
        { w: "majority", wtimeout: 100 }
      );
      res.redirect("/admin/shippingchrgs");
    } catch (error) {
      return res.status(500).json({
        status: "0",
        message: "Error occurred while deleting the category!",
        respdata: error.message,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  };
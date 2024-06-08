var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Notifications = require("../../models/api/notificationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
const upload = multer({ dest: 'public/images/' }); 

//methods
exports.getData = async function (req, res, next) {
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Notifications";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Notifications.find({ for_admin: 1 }).sort({ _id: -1 }).then((notification) => {
    res.render("pages/notification/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.admin.name,
      userImage: req.session.admin.image_url,
      userEmail: req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: notification,
      },
      isAdminLoggedIn: isAdminLoggedIn
    });
  }).catch(next); // Ensure errors are properly handled
};


exports.getHeaderData = async function (req, res, next) {
  try {
       //const requrl = req.protocol + '://' + req.get('host');
       let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
       let notificationCount = 0;
         notificationCount = await Notifications.countDocuments({
           $and: [
             { for_admin: 1 },
             { is_read_admin: 0 }
           ]
         }); 
         console.log("notificationCount",notificationCount); 
         res.status(200).json({
             status: 1,
             message: "Notification Data Count",
             notification:notificationCount,
             isAdminLoggedIn: isAdminLoggedIn
         });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

exports.markNotificationAsRead = async function (req, res, next) {
  const notificationId = req.body.notificationId;
  try {
      const notification = await Notifications.findById(notificationId);
      if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
      }
      notification.is_read_admin = 1;
      await notification.save();
      res.status(200).json({
        message: 'Notification marked as read',
        notification : true
      });
  } catch (error) {
    return {
      message: 'Notification not marked as read',
      notification : false
    };
  }
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
          res.redirect("/admin/genderlist"); 
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
    res.redirect("/admin/genderlist");
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

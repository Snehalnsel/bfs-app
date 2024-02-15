var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/api/userModel");
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

//functions
function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
}

exports.getData = async function (req, res, next) {
    // Validate request parameters, queries using express-validator
  
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    Users.find().then((users) => {
      res.render("pages/app-users/list", {
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
          list: users,
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  };


  exports.addData = async function (req, res, next) {
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    res.render("pages/app-users/create", {
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
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("pages/app-users/create", {
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
  
    Users.findOne({ email: req.body.email }).then((users) => {
      if (users) {
        res.render("pages/app-users/create", {
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
        var image_url = req.app.locals.requrl + "/public/images/no-image.jpg";
      
  
        const newUsers = Users({
          name: req.body.name,
          title: req.body.title,
          email: req.body.email,
          country: req.body.country,
          country_code: req.body.country_code,
          password: req.body.password,
          image: image_url,
          created_dtime: dateTime,
        });

        newUsers
          .save()
          .then((users) => {
    
            res.render("pages/app-users/create", {
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
              respdata: users,
              isAdminLoggedIn:isAdminLoggedIn
            });
          })
          .catch((error) => {
            res.render("pages/app-users/create", {
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
  
  
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const user_id = mongoose.Types.ObjectId(req.params.id);
  
    Users.findOne({ _id: user_id }).then((users) => {
      res.render("pages/app-users/edit", {
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
        respdata: users,
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  };


  exports.updateData = async function (req, res, next) {
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
      const user = await Users.findOne({ _id: req.params.user_id });
      if (!user) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
  
      const requrl = req.app.locals.requrl;
      const image_url = requrl + "/public/images/no-image.jpg";
  
      const updData = {
        name: req.body.name,
        title: req.body.title,
        email: req.body.email,
        phone_no: req.body.phone_no,
        image: image_url,
        created_dtime: dateTime,
      };
  
      const updatedUser = await Users.findOneAndUpdate(
        { _id: req.params.user_id },
        { $set: updData },
        { upsert: true, new: true } // Use new: true to get the updated document
      );
  
      if (!updatedUser) {
        return res.status(500).json({
          status: "0",
          message: "Failed to update user!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
  
      res.status(200).json({
        status: "1",
        message: "Successfully updated!",
        respdata: updatedUser,
        isAdminLoggedIn:isAdminLoggedIn
      });

      res.redirect("/admin/app-users"); 
    } catch (error) {
      res.status(500).json({
        status: "0",
        message: "An error occurred while updating the user!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
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

        const user = await Users.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).json({
                status: "0",
                message: "User not found!",
                respdata: {},
                isAdminLoggedIn:isAdminLoggedIn
            });
        }

        await Users.deleteOne({ _id: req.params.id }, { w: "majority", wtimeout: 100 });

        // Redirect after successful deletion
        res.redirect("/admin/app-users");
    } catch (error) {
        // Handle any errors that occur during the deletion process
        return res.status(500).json({
            status: "0",
            message: "Error occurred while deleting the user!",
            respdata: error.message, // Include the error message for debugging purposes
            isAdminLoggedIn:isAdminLoggedIn
        });
    }
};



  
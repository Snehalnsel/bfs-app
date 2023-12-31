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
  
    Users.find().then((users) => {
      res.render("pages/app-users/list", {
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
          list: users,
        },
      });
    });
  };


  exports.addData = async function (req, res, next) {
    
  
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
   
    res.render("pages/app-users/create", {
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
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("pages/app-users/create", {
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
  
    Users.findOne({ email: req.body.email }).then((users) => {
      if (users) {
        res.render("pages/app-users/create", {
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
              userFullName: req.session.user.name,
              userImage: req.session.user.image_url,
              userEmail: req.session.user.email,
              year: moment().format("YYYY"),
              message: "Added!",
              requrl: req.app.locals.requrl,
              respdata: users,
            });
          })
          .catch((error) => {
            console.log(error);
            res.render("pages/app-users/create", {
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
  
  
    var pageName = "App Users";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
  
    const user_id = mongoose.Types.ObjectId(req.params.id);
  
    Users.findOne({ _id: user_id }).then((users) => {
      res.render("pages/app-users/edit", {
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
        respdata: users,
      });
    });
  };


  exports.updateData = async function (req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "0",
          message: "Validation error!",
          respdata: errors.array(),
        });
      }
  
      console.log(req.body);
      console.log(req.params.user_id);
  
      const user = await Users.findOne({ _id: req.params.user_id });
  
      console.log(user);
  
      if (!user) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
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
        });
      }
  
      res.status(200).json({
        status: "1",
        message: "Successfully updated!",
        respdata: updatedUser,
      });

      res.redirect("/app-users"); 
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "0",
        message: "An error occurred while updating the user!",
        respdata: {},
      });
    }
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

        const user = await Users.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).json({
                status: "0",
                message: "User not found!",
                respdata: {},
            });
        }

        await Users.deleteOne({ _id: req.params.id }, { w: "majority", wtimeout: 100 });

        // Redirect after successful deletion
        res.redirect("/app-users");
    } catch (error) {
        // Handle any errors that occur during the deletion process
        return res.status(500).json({
            status: "0",
            message: "Error occurred while deleting the user!",
            respdata: error.message, // Include the error message for debugging purposes
        });
    }
};



  
var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/web/usersModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const saltRounds = 10;
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
    try {
      
      const pageName = "Admin Users";
      const pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  
      const users = await Users.find();
    
  
      res.render("pages/admin-users/list", {
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
    } catch (error) {
      next(error); 
    }
  };

  exports.addData = async function (req, res, next) {
   
  
    var pageName = "Admin Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    res.render("pages/admin-users/create", {
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
    var pageName = "Admin Users";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("pages/admin-users/create", {
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
        res.render("pages/admin-users/create", {
          status: 0,
          siteName: req.app.locals.siteName,
          userFullName: req.session.user.name,
          userImage: req.session.user.image_url,
          userEmail: req.session.user.email,
          pageName: pageName,
          pageTitle: pageTitle,
          year: moment().format("YYYY"),
          message: "Already email exists!",
          requrl: req.app.locals.requrl,
          respdata: {},
        });
      } else {
        var image_url = req.app.locals.requrl + "/public/images/no-image.jpg";
      
        bcrypt.hash(req.body.pwd, saltRounds, (error, hash) => {

          const newUsr = Users({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            image: image_url,
            created_dtime: dateTime,
            status: req.body.status
          });

          if (error) {
            res.status(400).json({
              status: "0",
              message: "Error!",
              respdata: error,
            });
          } else 
          {
            newUsr
            .save()
            .then((users) => {
              res.render("pages/admin-users/list", {
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
              res.render("pages/admin-users/create", {
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
    
      }
    });
  };

  exports.editData = async function (req, res, next) {
    
  
    var pageName = "Admin Users";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
  
    const user_id = mongoose.Types.ObjectId(req.params.id);
  
    Users.findOne({ _id: user_id }).then((users) => {
      res.render("pages/admin-users/edit", {
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
  
    Users.findOne({ _id: req.params.user_id }).then((category) => {
      if (!category) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      } else {
        
        const requrl = req.app.locals.requrl
        var image_url = requrl + "/public/images/no-image.jpg";
  
        var updData = {
          name: req.body.name,
          image: image_url,
          status: req.body.status
        };
        
        Users.findOneAndUpdate(
          { _id: req.params.user_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              Users.findOne({ _id: req.params.user_id }).then((users) => {
                res.status(200).json({
                  status: "1",
                  message: "Successfully updated!",
                  respdata: category,
                });
              });
            }
          }
        );
      }
    });
  };
  
  exports.deleteData = async function (req, res, next) {
    var pageName = "Admin Users";
    var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
  
    try {
      const user = await Users.findOne({ _id: req.params.user_id });
      if (!user) {
        return res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      }
  
      const deleteuser = await Users.deleteOne({ _id: req.params.user_id });
  
     
      if(deleteuser)
      {
        res.redirect("/admin-users");
      }
     
      

      // res.render("pages/admin-users/list", {
      //   status: 200,
      //   pageName: pageName,
      //   siteName: req.app.locals.siteName,
      //   userFullName: req.session.user.name,
      //   userImage: req.session.user.image_url,
      //   userEmail: req.session.user.email,
      //   pageTitle: pageTitle,
      //   year: moment().format("YYYY"),
      //   requrl: req.app.locals.requrl,
      //   message: "User deleted!"
      // });
  
    } catch (error) {
     
      res.status(500).json({
        status: "0",
        message: "Internal server error!",
        respdata: {},
      });
    }
  };
  
  
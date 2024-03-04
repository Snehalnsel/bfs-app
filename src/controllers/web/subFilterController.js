var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const SubCategory = require("../../models/api/subCategoryModel");
const Category = require("../../models/api/categoryModel");
const ProductimageModel = require("../../models/api/productimageModel");
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
  var pageName = "Product";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  SubCategory.find().sort({ _id: -1 }).then((subcat) => {
    res.render("pages/sub-filter/list", {
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
        list: subcat,
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
    
  });
};

exports.addData = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Product";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  Category.find().then((category) => {
    res.render("pages/sub-filter/create", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName:  req.session.admin.name,
      userImage:  req.session.admin.image_url,
      userEmail:  req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 1,
      message: "found!",
      respdata: {
        category: category,
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};


exports.createData = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Product";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  const requrl = req.protocol + '://' + req.get('host');
  const imagePath = requrl + '/public/images/' + req.file.filename;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/sub-filter/create", {
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

  ProductimageModel.findone({})

  SubCategory.findOne({ name: req.body.sub_filter }).then((subCategory) => {
    if (subCategory) {
      res.render("pages/sub-filter/create", {
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
     
      const newCat = SubCategory({
        category_id: req.body.body_focus,
        name: req.body.sub_filter,
        description: req.body.description,
        brand_id: '1',
        condition: 1,
        size: req.body.size,
        price: req.body.price,
        image: imagePath,
        added_dtime: dateTime,
      });

      newCat
        .save()
        .then((subCategory) => {
          res.render("pages/sub-filter/create", {
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
            respdata: subCategory,
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((error) => {
          res.render("pages/sub-filter/create", {
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

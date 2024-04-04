var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Brand = require("../../models/api/brandModel");
const Category = require("../../models/api/categoryModel");
const Size = require("../../models/api/sizeModel");
const Productsize = require("../../models/api/catsizeModel");
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


exports.getData = function (req, res, next) {
  var pageName = "Product Size List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  Productsize.aggregate([
    {
      $lookup: {
        from: 'mt_categories', 
        localField: 'category_id', 
        foreignField: '_id',  
        as: 'category',     
      },
    },
    {
      $lookup: {
        from: 'mt_brands',       
        localField: 'brand_id',
        foreignField: '_id',  
        as: 'brand',      
      },
    },
    {
      $lookup: {
        from: 'mt_sizes',       
        localField: 'size_id',
        foreignField: '_id',  
        as: 'size',      
      },
    }
  ]).exec(function (error, productList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
    
      res.render("pages/catbrand/list", {
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
          list: productList
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  });
};



exports.addData = async function (req, res, next) {
  
  var pageName = "Product Size";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  try {
    const [category, brand, size] = await Promise.all([
      Category.find(),
      Brand.find(), 
      Size.find()   
    ]);

    
    res.render("pages/catbrand/create", {
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
        brand: brand,
        size: size
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  } catch (error) {
    next(error);
  }
};

exports.createData = async function (req, res, next) {
  var pageName = "Add Category Size";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
      const newSize = Productsize({
        category_id : req.body.category_id,
        brand_id : req.body.brand_id,
        size_id : req.body.size_id,
        added_dtime: dateTime,
      });

      newSize
        .save()
        .then((size) => {
          res.render("pages/catbrand/create", {
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
            respdata: size,
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((error) => {
          res.render("pages/catbrand/create", {
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
  
};

exports.editData = async function (req, res, next) {
  
  var pageName = "Brand";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  try {
    const [category, brand, size] = await Promise.all([
      Category.find(),
      Brand.find(), 
      Size.find()   
    ]);
  const productsize_id = mongoose.Types.ObjectId(req.params.id);
  Productsize.findOne({ _id: productsize_id }).then((productsize) => {
    res.render("pages/catbrand/edit", {
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
      respdata: {
        productsize: productsize,
        brand : brand,
        category : category,
        size : size
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
} catch (error) {
  next(error);
}
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

  Productsize.findOne({ _id: req.body.productsize_id })
    .then((productsize) => {
      if (!productsize) {
        return res.status(404).json({
          status: "0",
          message: "Product Size not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      }

      const updData = {
        category_id: req.body.category_id || productsize.category_id,
        brand_id: req.body.brand_id || productsize.brand_id,
        size_id: req.body.size_id || productsize.size_id,
      };

      Productsize.findByIdAndUpdate(
        req.body.productsize_id,
        updData,
        { new: true, runValidators: true }
      )
        .then((updatedValue) => {
          if (!updatedValue) {
            return res.status(404).json({
              status: "0",
              message: "Product Size not updated!",
              respdata: {},
              isAdminLoggedIn:isAdminLoggedIn
            });
          }

          res.redirect("/admin/catbrand");
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the Product Size.",
            respdata: {},
            isAdminLoggedIn:isAdminLoggedIn
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the Product Size.",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
};


exports.updateStatusData = async function (req, res, next) {
  const Id = req.params.id;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  Productsize.findById(Id)
    .then((size) => {
      if (!size) {
        return res.status(404).json({
          status: "0",
          message: "Brand not found!",
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
              message: "Product Size status not updated!",
              respdata: {},
              isAdminLoggedIn:isAdminLoggedIn
            });
          }
          res.redirect("/admin/catbrand"); 
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the brand status.",
            respdata: {},
            isAdminLoggedIn:isAdminLoggedIn
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the Product Size.",
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

    const category = await Productsize.findOne({ _id: req.params.id });
    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    await Productsize.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    
    res.redirect("/admin/catbrand");
  } catch (error) {
    
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};
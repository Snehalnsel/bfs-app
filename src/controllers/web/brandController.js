var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Brand = require("../../models/api/brandModel");
const Category = require("../../models/api/categoryModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
var ObjectId = require("mongodb").ObjectId;
const url = require("url");
var ObjectId = require("mongodb").ObjectId;

exports.getData = function (req, res, next) {
  var pageName = "Brand List";
  var pageTitle = req.app.locals.siteName + " - " + pageName;

  Brand.aggregate([
    {
      $lookup: {
        from: 'mt_categories', 
        localField: 'category_id', 
        foreignField: '_id',  
        as: 'category',     
      },
    }
  ]).exec(function (error, brandList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      Category.find({}, function (err, categories) {
        if (err) {
          res.status(500).json({ error: 'An error occurred' });
        } else {
          res.render("pages/brand/list", {
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
              list: brandList
            },
            // categories: categories // Passing categories to the template
          });
        }
      });
    }
  });
};


exports.addData = async function (req, res, next) {
  try {
    
    const categories = await Category.find(); 

    var pageName = "Brand";
    var pageTitle = req.app.locals.siteName + " - Add " + pageName;

    res.render("pages/brand/create", {
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
      categories: categories, 
    });
  } catch (error) {
    next(error);
  }
};


exports.createData = async function (req, res, next) {
  var pageName = "Brand";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  if (!req.file) {
    
    return res.status(400).json({
      status: "0",
      message: "Image is required!",
      respdata: []
    });
  }

  const requrl = req.protocol + '://' + req.get('host');
  const imagePath = requrl + '/public/images/' + req.file.filename;

  Brand.findOne({ name: req.body.focus_name }).then((brand) => {
    if (brand) {
      res.render("pages/body-focus/create", {
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
      });
    } else {
    

      const newBrand = Brand({
        name: req.body.focus_name,
        description: req.body.description,
        image: imagePath,
        //category_id : req.body.category_id,
        status : '1',
        added_dtime: dateTime,
      });

      newBrand
        .save()
        .then((brand) => {
          res.render("pages/brand/create", {
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
            respdata: brand,
          });
        })
        .catch((error) => {
          res.render("pages/body-focus/create", {
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
          });
        });
    }
  });
};

exports.editData = async function (req, res, next) {
  
  var pageName = "Brand";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const brand_id = mongoose.Types.ObjectId(req.params.id);

  const category = await Category.find(); 

  Brand.findOne({ _id: brand_id }).then((brand) => {
    res.render("pages/brand/edit", {
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
        brand : brand,
        category : category,

      },
    });
  });
};


exports.updateData = async function (req, res, next) {
  var pageName = "Brand";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Brand.findOne({ _id: req.body.brand_id })
    .then((brand) => {
      if (!brand) {
        return res.status(404).json({
          status: "0",
          message: "Brand not found!",
          respdata: {},
        });
      }

      const updData = {
        name: req.body.name || brand.name,
        description: req.body.description || brand.description,
        //category_id : req.body.category_id || brand.category_id,
        status: req.body.status || brand.status,
      };

      if (req.file) {
        const requrl = req.protocol + '://' + req.get('host');
        const imagePath = requrl + '/public/images/' + req.file.filename;
        updData.image = imagePath;
      }
      Brand.findByIdAndUpdate(
        req.body.brand_id,
        updData,
        { new: true, runValidators: true }
      )
        .then((updatedBrand) => {
          if (!updatedBrand) {
            return res.status(404).json({
              status: "0",
              message: "Brand not updated!",
              respdata: {},
            });
          }
          res.redirect("/brand");
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the brand.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the brand.",
        respdata: {},
      });
    });
};


exports.updateStatusData = async function (req, res, next) {
  const brandId = req.params.id;

  Brand.findById(brandId)
    .then((brand) => {
      if (!brand) {
        return res.status(404).json({
          status: "0",
          message: "Brand not found!",
          respdata: {},
        });
      }

      brand.status = brand.status === 1 ? 2 : 1;

      brand.save()
        .then((updatedBrand) => {
          if (!updatedBrand) {
            return res.status(404).json({
              status: "0",
              message: "Brand status not updated!",
              respdata: {},
            });
          }
          res.redirect("/brand"); 
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the brand status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the brand.",
        respdata: {},
      });
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

    const brand = await Brand.findOne({ _id: req.params.id });
    if (!brand) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }

    await Brand.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    res.redirect("/brand");
  } catch (error) {
    
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
    });
  }
};

// <!-- <td><%= value.category.length ? value.category[0].name : 'N/A' %></td> -->

// <!-- <div class="col-sm-6 mb-3 mb-sm-0">
// <select class="form-control" name="category_id" id="category_id" required>
//     <option value="" selected>Select Category</option>
//     <% if (categories) { %>
//         <% categories.forEach(function(value) { %> 
//             <option value="<%= value._id %>"><%= value.name %></option>
//         <% }); %>
//     <% } %> 
// </select>
// </div> -->

// <!-- <div class="col-sm-6 mb-3 mb-sm-0">
// <select class="form-control" name="category_id" id="category_id" required>
//     <option value="" selected>Select Category</option>
//     <% if (respdata.category) { %>
//       <% respdata.category.forEach(function(value) { %> 
//         <option value="<%= value._id %>"  
//           <% if (respdata.brand && respdata.brand.category_id && respdata.brand.category_id.equals(value._id)) { %>
//             selected
//           <% } %>
//         ><%= value.name %></option>
//       <% }); %>
//     <% } %> 
//   </select>
  
// </div> -->
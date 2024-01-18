var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Category = require("../../models/api/categoryModel");
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
var ObjectId = require("mongodb").ObjectId;
const { exit } = require("process");

//methods
exports.getData = async function (req, res, next) {
  

  var pageName = "Category";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Category.find().sort({ _id: -1 }).then((category) => {
    res.render("pages/body-focus/list", {
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
        list: category,
      },
    });
  });
};


exports.getSubcatData = async function (req, res, next) {
  var pageName = "Sub Category";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  try {

    const item_per_page = 150;

    await Category.ensureIndexes({ parent_id: 1 }); 
    const currentPage = req.params.page || 1;
    const skip = (currentPage - 1) * item_per_page;

    //const subcategories = await Category.find({ parent_id: { $ne: '650444488501422c8bf24bdb' } }).exec();
    const subcategories = await Category.find({ parent_id: { $ne: '650444488501422c8bf24bdb' } })
    .skip(skip)
    .limit(item_per_page)
    .exec();
    const subcategoryList = [];

    for (const subcategory of subcategories) {
      const parentCategory = await Category.findOne({ _id: subcategory.parent_id }).exec();
      const parentCategoryName = parentCategory ? parentCategory.name : '';

      subcategoryList.push({
        subcategory: subcategory,
        parentCategoryName: parentCategoryName,
      });
    }


    res.render("pages/body-focus/subcatlist", {
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
        list: subcategoryList,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the Sub Category data.",
      respdata: {},
    });
  }
};


exports.addData = async function (req, res, next) {
 

  var pageName = "Category";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;


  Category.find().sort({ _id: -1 }).then((category) => {
    
  res.render("pages/body-focus/create", {
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
    respdata: {
      category: category,
    },
  });
});
 
};

exports.createData = async function (req, res, next) {
  var pageName = "Category";
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
  console.log(req.body);


  Category.findOne({ name: req.body.focus_name }).then((category) => {
    if (category) {
      res.render("pages/body-focus/create", {
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
    
      const parent1 = '650444488501422c8bf24bdb';
      
      const parent =  req.body.parent_id !== '0' ? req.body.parent_id : parent1;
      const newCat = Category({
        name: req.body.focus_name,
        description: req.body.description,
        image: imagePath,
        parent_id: parent,
        added_dtime: dateTime,
      });
      

      newCat
        .save()
        .then((category) => {
          res.render("pages/body-focus/create", {
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
            respdata: category,
          });
        })
        .catch((error) => {
          res.render("pages/body-focus/create", {
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

  var pageName = "Category";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const user_id = mongoose.Types.ObjectId(req.params.id);
  console.log(user_id);

  Category.findOne({ _id: user_id }).then((category) => {
    console.log(category);
    res.render("pages/body-focus/edit", {
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
      respdata: category,
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

    const category = await Category.findOne({ _id: req.body.id });

    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Category not found!",
        respdata: {},
      });
    }

    const updData = {
      name: req.body.focus_name || category.name,
      description: req.body.description || category.description,
      status: req.body.status || category.status,
    };

    console.log(req.file);

    if (req.file) {
      const requrl = req.protocol + "://" + req.get("host");
      const imagePath = requrl + "/public/images/" + req.file.filename;
      updData.image = imagePath;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.body.id,
      updData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: "0",
        message: "Brand not updated!",
        respdata: {},
      });
    }
    res.redirect("/body-focus");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while updating the brand.",
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

    const referer = req.headers.referer; // Extracting the Referer header
    const category = await Category.findOne({ _id: req.params.id });
    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }

    await Category.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    if (referer && referer.includes("/body-focus")) {
      res.redirect("/body-focus");
    } else if (referer && referer.includes("/body-focus-subcat")) {
      res.redirect("/body-focus-subcat");
    } else {
      
      res.redirect("/body-focus");
    }
  } catch (error) {
    // Handle any errors that occur during the deletion process
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message, // Include the error message for debugging purposes
    });
  }
};

exports.editSubCatData = async function (req, res, next) {
  var pageName = "Sub Category";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const user_id = mongoose.Types.ObjectId(req.params.id);

  console.log(user_id);

  try {
    const category = await Category.findOne({ _id: user_id }).exec();

    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Sub Category not found!",
        respdata: {},
      });
    }

    const parentCategories = await Category.find({ parent_id: '650444488501422c8bf24bdb' }).exec();

    res.render("pages/body-focus/subcat-edit", {
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
      respdata: {
        list: category,
        parentCategories: parentCategories,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the Sub Category data.",
      respdata: {},
    });
  }
};



exports.updateSubCatData = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const category = await Category.findOne({ _id: req.body.id });

    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Sub Category not found!",
        respdata: {},
      });
    }

    const updData = {
      name: req.body.name || category.name,
      description: req.body.description || category.description,
      parent_id: req.body.parent_id || category.parent_id,
      status: req.body.status || category.status,
    };

    if (req.file) {
      const requrl = req.protocol + '://' + req.get('host');
      const imagePath = requrl + '/public/images/' + req.file.filename;
      updData.image = imagePath;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.body.id,
      updData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: "0",
        message: "Sub Category not updated!",
        respdata: {},
      });
    }

    res.redirect("/body-focus-subcat");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while updating the Sub Category.",
      respdata: {},
    });
  }
};


exports.updateStatusData = async function (req, res, next) {
  const Id = req.params.id;

  Category.findById(Id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          status: "0",
          message: "Brand not found!",
          respdata: {},
        });
      }

      category.priority_status = category.priority_status === 0 ? 1 : 0;

      category.save()
        .then((updatedCategory) => {
          if (!updatedCategory) {
            return res.status(404).json({
              status: "0",
              message: "Category status not updated!",
              respdata: {},
            });
          }
          res.redirect("/body-focus"); 
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the brand status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the brand.",
        respdata: {},
      });
    });
};


exports.statusData = async function (req, res, next) {
  const Id = req.params.id;
  const referer = req.headers.referer; // Extracting the Referer header

  Category.findById(Id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          status: "0",
          message: "Category not found!",
          respdata: {},
        });
      }

      category.status = category.status === 0 ? 1 : 0;

      category
        .save()
        .then((updatedCategory) => {
          if (!updatedCategory) {
            return res.status(404).json({
              status: "0",
              message: "Category status not updated!",
              respdata: {},
            });
          }
         
          if (referer && referer.includes("/body-focus")) {
            res.redirect("/body-focus");
          } else if (referer && referer.includes("/body-focus-subcat")) {
            res.redirect("/body-focus-subcat");
          } else {
            
            res.redirect("/body-focus");
          }
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the brand status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the brand.",
        respdata: {},
      });
    });
};

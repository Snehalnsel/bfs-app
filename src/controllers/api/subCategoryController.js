var express = require("express");
const app = express();
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const multer = require('multer');
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const SubCategory = require("../../models/api/subCategoryModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
const url = require("url");
var ObjectId = require("mongodb").ObjectId;

// module.exports = router;


//methods
exports.getData = async function (req, res, next) {
  

  SubCategory.find().then((subcategory) => {
    if (!subcategory) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      res.status(200).json({
        status: "1",
        message: "Found!",
        respdata: subcategory,
      });
    }
  });
};

exports.viewData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  SubCategory.findOne({ _id: req.body.sub_category_id }).then((subcategory) => {
    if (!subcategory) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      res.status(200).json({
        status: "1",
        message: "Found!",
        respdata: subcategory,
      });
    }
  });
};

exports.getSubCatData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  SubCategory.find({ category_id: req.body.category_id }).then(
    (subcategory) => {
      if (!subcategory) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      } else {
        res.status(200).json({
          status: "1",
          message: "Found!",
          respdata: subcategory,
        });
      }
    }
  );
};


exports.addData = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  } 


    SubCategory.findOne({ name: req.body.sub_category_name }).then((subcategory) => {
      if (subcategory) {
        res.status(404).json({
          status: "0",
          message: "Already exists!",
          respdata: {},
        });
      } else {
        const requrl = req.protocol + '://' + req.get('host');
        const imagePath = requrl + '/public/images/' + req.file.filename;

        const newCat = SubCategory({
          category_id: req.body.category_id,
          name: req.body.sub_category_name,
          description: req.body.description,
          condition: req.body.condition,
          brand_id: req.body.brand_id,
          size: req.body.size,
          price: req.body.price,
          image: imagePath,
          added_dtime: new Date(), 
        });

        newCat
          .save()
          .then((subcategory) => {
            res.status(200).json({
              status: "1",
              message: "Added!",
              respdata: subcategory,
            });
          })
          .catch((error) => {
            res.status(400).json({
              status: "0",
              message: "Error!",
              respdata: error,
            });
          });
      }
    });
  };


  exports.editData = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    SubCategory.findOne({ _id: req.body.sub_category_id }).then((subcategory) => {
      if (!subcategory) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      } else {
       
        const requrl = url.format({
          protocol: req.protocol,
          host: req.get("host"),
          
        });
        var image_url = requrl + "/public/images/no-image.jpg";
        var updData = {
          name: req.body.sub_category_name,
          description: req.body.description,
          image: image_url,
         
        };
        SubCategory.findOneAndUpdate(
          { _id: req.body.sub_category_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              SubCategory.findOne({ _id: req.body.sub_category_id }).then(
                (subcategory) => {
                  res.status(200).json({
                    status: "1",
                    message: "Successfully updated!",
                    respdata: subcategory,
                  });
                }
              );
            }
          }
        );
      }
    });
  };

  exports.deleteData = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    SubCategory.findByIdAndDelete({
      _id: ObjectId(req.body.sub_category_id),
    }).then((subcategory) => {
      if (!subcategory) {
        res.status(404).json({
          status: "0",
          message: "Not foundss!",
          respdata: {},
        });
      } else {
        res.status(200).json({
          status: "1",
          message: "Deleted!",
          respdata: subcategory,
        });
      }
    });
  };

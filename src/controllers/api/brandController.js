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



exports.getBrandList = async function (req, res, next) {
  try {
   
    const category_id = req.body.category_id;

    const brands = await Brand.find({ status: 1, category_id: category_id });

    // const brands = await Brand.find({ status: 1 });

    if (!brands || brands.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Brands not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", brand_list: brands });
  } catch (error) {
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};


exports.addData = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const existingBrand = await Brand.findOne({ name: req.body.brand_name });
    if (existingBrand) {
      return res.status(409).json({
        status: "0",
        message: "Brand already exists!",
        respdata: {},
      });
    }
    else{
        
      const requrl = req.protocol + '://' + req.get('host');
      const imagePath = requrl + '/public/images/' + req.file.filename;

          const newBrand = new Brand({
            name: req.body.brand_name,
            description: req.body.description,
            image: imagePath,
            category_id : req.body.category_id,
            status: req.body.status,
            added_dtime: dateTime,
          });
      
          const savedBrand = await newBrand.save();
      
          res.status(201).json({
            status: "1",
            message: "Brand added successfully!",
            respdata: savedBrand,
          });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};



exports.deleteBrand = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
  
    Brand.findByIdAndDelete({ _id: ObjectId(req.body.brand_id) }).then(
      (brand) => {
        if (!brand) {
          res.status(404).json({
            status: "0",
            message: "Not found!",
            respdata: {},
          });
        } else {                               
          res.status(200).json({
            status: "1",
            message: "Deleted!",
            respdata: brand,
          });
        }
      }
    );
  };
  
var express = require("express");
//var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
//const db = mongoose.connection;
//const http = require("http");
//const path = require("path");
//const fs = require("fs");
//const mime = require("mime");
// const helper = require("../helpers/helper");
//const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");
//const tokenSecret = "a2sd#Fs43d4G3524Kh";
//const rounds = 10;
//const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
//const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
//var ObjectId = require("mongodb").ObjectId;
//const url = require("url");
//var ObjectId = require("mongodb").ObjectId;
const BidManagement = require('../../models/api/bidModel');
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
//const Users = require("../../models/api/userModel");



exports.getData = function (req, res, next) {
  var pageName = "Bid Management List";
  var pageTitle = req.app.locals.siteName + " - " + pageName;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  BidManagement.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'buyer_id',
        foreignField: '_id',
        as: 'buyer',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'seller_id',
        foreignField: '_id',
        as: 'seller',
      },
    },
    {
      $lookup: {
        from: 'mt_userproducts',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: '$buyer',
    },
    {
      $unwind: '$seller',
    },
    {
      $unwind: '$product',
    },
    {
      $lookup: {
        from: 'mt_product_images',
        localField: 'product._id',
        foreignField: 'product_id',
        as: 'product.images',
      },
    },
    {
      $addFields: {
        firstImage: {
          $arrayElemAt: ['$product.images.image', 0], // Select the first image URL
        },
      },
    },
    {
      $project: {
        _id: 1, 
        buyerName: '$buyer.name',
        sellerName: '$seller.name',
        productName: '$product.name',
        productImage: '$firstImage', // Store the first image URL in productImage
        original_price: '$original_price', // Include the fields dynamically
        seller_price: '$seller_price',
        final_price: '$final_price',
        status: '$status',
        chat_status: '$chat_status',
      },
    },
  ]).exec(function (error, bidList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.render("pages/bid-management/list", {
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        status: 0,
        message: "Found!",
        respdata: {
          list: bidList,
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  });
};

exports.detailsData = function (req, res, next) {
  var pageName = "Bid Details";
  var pageTitle = req.app.locals.siteName + " - " + pageName;
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const bidId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    return res.status(400).json({ error: 'Invalid bid ID' });
  }

  BidManagement.findOne({ _id: bidId })
    .populate('buyer_id', 'name') 
    .populate('seller_id', 'name') 
    .then((bidDetails) => {
      if (!bidDetails) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      Userproduct.findOne({ _id: bidDetails.product_id })
        .then((productDetails) => {
          if (!productDetails) {
            return res.status(404).json({ error: 'Product not found' });
          }
          Productimage.findOne({ product_id: productDetails._id })
            .then((productImage) => {
              res.render("pages/bid-management/edit", {
                status: 1,
                siteName: req.app.locals.siteName,
                pageName: pageName,
                pageTitle: pageTitle,
                userFullName:  req.session.admin.name,
                userImage:  req.session.admin.image_url,
                userEmail:  req.session.admin.email,
                year: moment().format("YYYY"),
                requrl:  req.app.locals.requrl,
                message: "",
                respdata: {
                  bidDetails: bidDetails,
                  productDetails: productDetails,
                  productImage: productImage, 
                },
                isAdminLoggedIn:isAdminLoggedIn
              });
            })
            .catch((error) => {
              res.status(500).json({ error: 'An error occurred while fetching the product image' });
            });
        })
        .catch((error) => {;
          res.status(500).json({ error: 'An error occurred while fetching product details' });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: 'An error occurred while fetching bid details' });
    });
};

exports.updatedetailsData = async function (req, res, next) {
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

  try {
    const bid = await BidManagement.findById(req.body.bid_id);

    if (!bid) {
      return res.status(404).json({
        status: "0",
        message: "Bid not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const updData = {
      final_price: req.body.final_price,
      original_price: req.body.original_price,
      seller_price: req.body.seller_price,
      status: req.body.status,
      chat_status: req.body.chat_status,
    };

    const updatedBid = await BidManagement.findByIdAndUpdate(
      req.body.bid_id,
      { $set: updData },
      { new: true }
    );

    if (!updatedBid) {
      return res.status(500).json({
        status: "0",
        message: "Failed to update bid!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    
    res.redirect("/admin/bid-listing");
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating bid!",
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

    const biddata = await BidManagement.findOne({ _id: req.params.id });
    if (!biddata) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    await BidManagement.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

   
    res.redirect("/admin/bid-listing");
  } catch (error) {
 
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn 
    });
  }
};









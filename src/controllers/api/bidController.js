var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
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
const BidManagement = require('../../models/api/bidModel');
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Users = require("../../models/api/userModel");
const nodemailer = require("nodemailer");

const smtpUser = "sneha.lnsel@gmail.com";

const transporter = nodemailer.createTransport({
  port: 465, 
  host: "smtp.gmail.com",
  auth: {
    user: smtpUser,
    pass: "iysxkkaexpkmfagh",
  },
  secure: true,
});




exports.addData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const {
      buyer_id,
      seller_id,
      product_id,
      custom_id,
      price,
      seller_price,
      status,
      chat_status,
    } = req.body;

    const existingBid = await BidManagement.findOne({
      buyer_id,
      seller_id,
      product_id,
    });

    if (existingBid) {
      return res.status(400).json({
        status: "0",
        message: "A bid with the same buyer, seller, and product already exists!",
        respdata: {},
      });
    }

    const product = await Userproduct.findById(product_id);

    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    if (product.user_id != seller_id) {
      return res.status(400).json({
        status: "0",
        message: "The seller_id does not match the user_id of the product!",
        respdata: {},
      });
    }


    const finalSellerPrice = seller_price || 0;
    const finalPrice =  0;
    const productImage = await Productimage.findOne({ product_id });

    const newBid = new BidManagement({
      buyer_id,
      seller_id,
      product_id,
      custom_id,
      original_price: product.offer_price,
      seller_price: finalSellerPrice,
      final_price: finalPrice,
      status,
      chat_status,
      added_dtime: new Date().toISOString(),
    });

    await newBid.save();

    const buyerdeatsils = await Users.findById(buyer_id);
    const sellerdeatsils = await Users.findById(seller_id);
    const productdeatsils = await Userproduct.findById(product_id);

    const mailData = {
      from: smtpUser,
      to: buyerdeatsils.email,
      subject: "BFS - Bid For Sale  - Thank you for Bid",
      text: "Server Email!",
      html:
        "Hey " +
        buyerdeatsils.name +
        ", <br> <p>Thank you for showing intrest in this product and our app.please wait for some times and wait for the seller response.</p>",
    };

    transporter.sendMail(mailData, function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    const mail2Data = {
      from: smtpUser,
      to: sellerdeatsils.email,
      subject: "BFS - Bid For Sale  - Bid on your Product",
      text: "Server Email!",
      html:
        "Hey " +
        sellerdeatsils.name +
        ", <br> <p>Congratulations, You have a bid on your product. Please check the app, something is waiting for you </p>",
    };

    transporter.sendMail(mail2Data, function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    });


    res.status(200).json({
      status: "1",
      message: "Bid added successfully!",
      respdata: {
        bid: newBid,
        product_image: productImage, 
      },
    });
  } catch (error) {
    console.error("Error adding bid:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while adding the bid",
      respdata: {},
    });
  }
};


exports.sellerlistData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const { buyer_id } = req.body;


    const bids = await BidManagement.find({ buyer_id });

    if (!bids || bids.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No bids found for this buyer!",
        respdata: {},
      });
    }

    const sellerInfo = {};

    for (const bid of bids) {
      
      const product = await Userproduct.findById(bid.product_id)
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .exec();

      if (!product) {
        continue; 
      }

      
      const seller = await Users.findById(product.user_id);

    
      if (!sellerInfo[seller._id]) {
        sellerInfo[seller._id] = {
          seller_id: seller._id,
          name: seller.name,
          email: seller.email,
          phone: seller.phone_no,
          deviceId: seller.deviceid,
          deviceName: seller.devicename,
          fcmToken: seller.fcm_token,
          products: [],
        };
      }

      const productImage = await Productimage.findOne({ product_id: bid.product_id });

      const bidDetails = {
        bid_id: bid._id,
        original_price: bid.original_price,
        seller_price: bid.seller_price,
        final_price: bid.final_price,
        status: bid.status,
        chat_status: bid.chat_status,
        started_time: bid.added_dtime,
        product: {
          product_id : product._id,
          name: product.name,
          categoryName: product.category_id.name,
          brandName: product.brand_id.name,
          productImage: productImage ? productImage.image : null, 
        },
      };

      sellerInfo[seller._id].products.push(bidDetails);
    }

    const sellerList = Object.values(sellerInfo);

    res.status(200).json({
      status: "1",
      message: "Seller's bids showing successfully!",
      respdata: {
        sellers: sellerList
      },
    });
  } catch (error) {
    console.error("Error fetching seller's bids:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the seller's bids",
      respdata: {},
    });
  }
};


exports.buyerlistingData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const { seller_id } = req.body;

    const validSellerId = mongoose.Types.ObjectId(seller_id);

    const products = await BidManagement.find({ seller_id: validSellerId });

    const productInfo = {};

    for (const bid of products) {
      const userproduct = await Userproduct.findById(bid.product_id)
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .exec();

      if (!userproduct) {
        continue;
      }

      const buyer = await Users.findById(bid.buyer_id);

      const productImage = await Productimage.findOne({ product_id: bid.product_id });

      const productDetails = {
        product_id : userproduct._id,
        name: userproduct.name,
        categoryName: userproduct.category_id.name,
        brandName: userproduct.brand_id.name,
        productImage: productImage ? productImage.image : null,
      };

      if (!productInfo[userproduct._id]) {
        productInfo[userproduct._id] = {
          ...productDetails,
          buyers: [], 
        };
      }

      const buyerInfo = {
        bid_id: bid._id,
        buyer_id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone_no,
        deviceId: buyer.deviceid,
        deviceName: buyer.devicename,
        fcmToken: buyer.fcm_token,
        original_price: bid.original_price, 
        buyer_price: bid.seller_price, 
        final_price: bid.final_price, 
        status: bid.status,
        chat_status: bid.chat_status,
        started_time: bid.added_dtime,
      };
      

      productInfo[userproduct._id].buyers.push(buyerInfo);
    }

    const productsArray = Object.values(productInfo);

    res.status(200).json({
      status: "1",
      message: "Seller's Listing showing successfully!",
      respdata: {
        products: productsArray,
      },
    });
  } catch (error) {
    console.error("Error fetching seller's listing:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the seller's listing",
      respdata: {},
    });
  }
};



exports.updateBid = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    
    const { custome_id, final_price, status } = req.body;

    
    const bid = await BidManagement.findOne({ custome_id });

    if (!bid) {
      return res.status(404).json({
        status: "0",
        message: "Bid not found!",
        respdata: {},
      });
    }


    bid.final_price = final_price;
    bid.status = status;
    bid.updated_time = new Date().toISOString();

   
    await bid.save();

    res.status(200).json({
      status: "1",
      message: "Bid updated successfully!",
      respdata: {
        bid,
      },
    });
  } catch (error) {
    console.error("Error updating bid:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the bid",
      respdata: {},
    });
  }
};


exports.getbiddetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bid_id = req.body.bid_id; 

    const bid = await BidManagement.findOne({ _id: bid_id });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    const product_id = bid.product_id; 

    const product = await Userproduct.findOne({ _id: product_id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const response = {
      status: "1",
      message: "Bid Details showing successfully!",
      respdata: {
        products: [
          {
            bid: bid.toObject(),
            product: product.toObject(),
          },
        ],
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



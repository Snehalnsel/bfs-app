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
const Wishlist = require('../../models/api/wishlistModel');
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Users = require("../../models/api/userModel");

exports.addToWishlist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const { user_id, product_id, status } = req.body;

    const existingList = await Wishlist.findOne({ user_id, product_id, status: 0 });

    if (existingList) {
      return res.status(200).json({
        message: 'Item already added to your favorite successfully',
        cart: existingList,
      });
    } else {
      const user = await Users.findOne({ _id: user_id });
      const product = await Userproduct.findOne({ _id: product_id }).populate('category_id', 'name');

      console.log(product);

      const newFavList = new Wishlist({
        user_id,
        product_id,
        status,
        added_dtime: new Date(), 
      });

      const savedFavData = await newFavList.save();

      return res.status(200).json({
        message: 'Item added to your wishlist successfully',
        wishlist: {
          user_id: user_id,
          user_name: user.name, 
          product_id: product_id,
          product_name: product.name, 
          category_name: product.category_id.name,
          status: 0,
          added_dtime: savedFavData.added_dtime,
          _id: savedFavData._id,
          __v: savedFavData.__v,
        } 
      });
    }
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'An error occurred while adding to favlist' });
  }
};

exports.getWishlistByUserId = async (req, res) => {
  try {
    const existingList = await Wishlist.find({ user_id: req.body.user_id })
      .populate('user_id', 'name')
      .exec();

    if (existingList.length === 0) {
      return res.status(200).json({
        message: 'Wishlist is empty',
        existingList: [],
      });
    } else {
      const formattedList = await Promise.all(
        existingList.map(async (item) => {
          console.log(item.product_id);
          const product = await Userproduct.findById(item.product_id).populate('category_id', 'name');

          if (product.length === 0) {
            return res.status(200).json({
              message: 'Product is not found',
              existingList: [],
            });
          }  
          
          const productImages = await Productimage.find({ product_id: item.product_id }).limit(1);

          return {
            _id: item._id,
            user_id: item.user_id._id,
            user_name: item.user_id.name,
            product_id: item.product_id,
            product_name: product.name, 
            product_price : product.price,
            category_name: product.category_id.name, 
            images: productImages[0].image, 
            status: item.status,
            added_dtime: item.added_dtime,
            __v: item.__v,
          };
        })
      );

      res.status(200).json({
        message: 'Wishlist details retrieved successfully',
        existingList: formattedList,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching Wishlist' });
  }
};

  exports.deleteProductFromWishlist = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const existingList = await Wishlist.findOne({ user_id, product_id});
  
      if (!existingList) {
        return res.status(404).json({
          message: 'Product are not found in the Wishlist',
        });
      }
      else
      {
        await existingList.remove();

        res.status(200).json({
          message: 'Product removed from Wishlist successfully',
        });
      }
    } catch (error) {
      console.error('Error while deleting product from cart:', error);
      res.status(500).json({
        error: 'An error occurred while deleting product from cart',
      });
    }
  };
  
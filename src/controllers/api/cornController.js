var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const request = require('request');
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
const Cart = require('../../models/api/cartModel');
const CartDetail = require('../../models/api/cartdetailsModel');
const Users = require("../../models/api/userModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Order = require("../../models/api/orderModel");
const Ordertracking = require("../../models/api/ordertrackModel");
const Track = require("../../models/api/trackingModel");
const Shippingkit = require("../../models/api/shippingkitModel");
const Demoshippingkit = require("../../models/api/demoshippingkitModel");
const AddressBook = require("../../models/api/addressbookModel");
const shippingchrgsModel = require("../../models/api/shippingchrgsModel");
const deliveryorderModel = require("../../models/api/orderdelivered");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
const nodemailer = require("nodemailer");
// const axios = require('axios');
// const bodyParser = require('body-parser'); 
const smtpUser = "hello@bidforsale.com";

const transporter = nodemailer.createTransport({
  port: 465,
  host: "bidforsale.com",
  auth: {
    user: smtpUser,
    pass: "India_2023",
  },
  secure: true,
});

const email = 'sneha.lnsel@gmail.com';
const shipPassword = 'Jalan@2451';
const baseUrl='https://apiv2.shiprocket.in/v1/external';


function generateToken(email, password) {
  const options = {
    method: 'POST',
    url: baseUrl+'/auth/login',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody.token;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyawbid(pickup_awb) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track/awb/${pickup_awb}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyaorderid(order_id){
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const channel_id = 12345;
  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track?order_id=${order_id}&channel_id=${channel_id}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyshipmentid(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track/shipment/${shipment_id}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

exports.getTrackByAWB = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);


    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    pickup_awb = existingOrder.pickup_awb;

      const shiprocketResponse = await trackbyawbid(pickup_awb);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getTrackByorderid = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);


    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
     order_id = existingOrder.shiprocket_order_id;

      const shiprocketResponse = await trackbyaorderid(order_id);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getTrackByshipmentid = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);


    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shipment_id = existingOrder.shiprocket_shipment_id;

      const shiprocketResponse = await trackbyshipmentid(shipment_id);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.processOrderTracking = async function (req, res, next) {
  try {
    console.log("hello");
    const tracks = await Track.find({ is_delivered: 0, pickup_awb: { $exists: true } });
    for (const track of tracks) {
      const shiprocketResponse = await trackbyawbid(track.pickup_awb);

      const shipmentActivities = shiprocketResponse.tracking_data.shipment_track_activities;
      const lastActivity = shipmentActivities[shipmentActivities.length - 1];
      
      const isDelivered = shiprocketResponse.tracking_data.shipment_track.some(shipment => shipment.current_status === "Delivered");
      
      if ((lastActivity.status === "DLVD" && lastActivity.activity === "Delivered") || isDelivered) {

        track.is_delivered = 1;
        await track.save();
        let getorderid = await Ordertracking.findOne({ tracking_id: track_id });
        let orderdetails = await Order.findById(getorderid.order_id);
        orderdetails.is_delivered = 1;
        orderdetails.save();

        const newOrderDelivered = new deliveryorderModel({
          order_id: getorderid.order_id,
          tracking_id: track._id,
          awb_no: track.pickup_awb,
          shiprocket_shipment_id: track.shiprocket_shipment_id,
          shiprocket_order_id: track.shiprocket_order_id,
          response_status: lastActivity.status,
          status: 1, 
          added_dtime: new Date().toISOString(), 
        });
        await newOrderDelivered.save();

        if(newOrderDelivered)
        {
          const user = await Users.findById(orderdetails.user_id);
          const product = await Userproduct.findById(orderdetails.product_id);
          let smsData = {
            textId: "test",
            toMobile: "91" +user.phone_no,
            text: "Dear "+user.name+",Your order "+track.shiprocket_shipment_id+" has been delivered successfully.- BFS Team",
          };
          let returnData;
          returnData = await sendSms(smsData);
          const historyData = new ApiCallHistory({
            userId: user._id,
            called_for: "Order Delivered",
            api_link: process.env.SITE_URL,
            api_param: smsData,
            api_response: returnData,
            send_status: 'send',
          });
          await historyData.save();

          const seller = await Users.findById(orderdetails.seller_id);
          let smsDataforseller = {
            textId: "test",
            toMobile: "91" +seller.phone_no,
            text: ": Dear "+seller.name+",Your product "+product.name+" has been delivered and accepted by the buyer.Your payment of Rs."+product.offer_price+" will be initiated within the next 5 business days.- BFS Team",
          };
          let returnDataforSeller;
          returnDataforSeller = await sendSms(smsDataforseller);
          const historyDataforseller = new ApiCallHistory({
            userId: seller._id,
            called_for: "Order Delivered",
            api_link: process.env.SITE_URL,
            api_param: smsData,
            api_response: returnDataforSeller,
            send_status: 'send',
          });
          await historyDataforseller.save();
        }
      } else {
        console.log("Shipment is not delivered.");
        console.log("Shipment ID:", track._id, "is not delivered.");
      }
      
    }
    res.status(200).json({ message: 'Processing completed' });
  } catch (error) {
    console.error('Error processing order tracking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


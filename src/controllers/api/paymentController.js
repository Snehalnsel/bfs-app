var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
// const fs = require("fs");
const fs = require('fs-extra');
const mime = require("mime");
const ejs = require('ejs');
const CompressImage = require("../../models/thirdPartyApi/CompressImage");
const PayementFunction = require("../../models/thirdPartyApi/payment");
const helper = require("../../helpers/helper");
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
const Appsettings = require("../../models/api/appSettingsModel");
const Users = require("../../models/api/userModel");
const Category = require("../../models/api/categoryModel");
//const DemoOrder = require("../../models/api/demoModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
const Banner = require("../../models/api/bannerModel");
const Demoorder = require("../../models/api/demoorderModel");
const Order = require("../../models/api/orderModel");
const Cart = require('../../models/api/cartModel');
const Notifications = require("../../models/api/notificationModel");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
const { create } = require('xmlbuilder2');
const { log } = require("console");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const APP_BE_URL = "https://localhost:3000";

exports.getPaymentData = async function (req, res, next) {
  try {

    const tempOrderId = req.query.temp;
    console.log("demo order id before payment",tempOrderId);
    const temporder = await Demoorder.findById(tempOrderId);
    const amount = temporder.total_price;
    let userId = temporder.user_id;
    let merchantTransactionId = uniqid();
    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100,
      redirectUrl: `${APP_BE_URL}/payment-status?temp=${tempOrderId}`,
      redirectMode: "REDIRECT",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");
    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    axios
      .post(
        `${PHONE_PE_HOST_URL}/pg/v1/pay`,
        { request: base64EncodedPayload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
          },
        }
      )
      .then(async function (response) {

        const updateData = {
          merchant_transactionid:merchantTransactionId,
          pay_response: response.data,
        };

        await Demoorder.findOneAndUpdate(
          { _id: tempOrderId },
          { $set: updateData },
          { new: true }
        );
        res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
      })
      .catch(function (error) {
        res.status(500).json({
          status: "0",
          message: "An error occurred during payment.",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

exports.getStatus = async function (req, res, next) {
  try {
    const tempId = req.query.temp;
    console.log("demo order id", tempId);

    const temporder = await Demoorder.findById(tempId);
    console.log("demo order details", temporder);

    const merchantTransactionId = temporder.merchant_transactionid;

    if (merchantTransactionId) {
      let statusUrl = `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/` +
        merchantTransactionId;

      let string = `/pg/v1/status/${MERCHANT_ID}/` +
        merchantTransactionId +
        SALT_KEY;
      let sha256_val = sha256(string);
      let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

      try {
        const response = await axios.get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": merchantTransactionId,
            accept: "application/json",
          },
        });

        const updateData = {
          checkstatus_response: response.data,
          checkstatus_status: response.data.code === "PAYMENT_SUCCESS" ? "success" : "failure",
        };

        console.log("Updating Demoorder with response data:", response.data);

        const updatedOrder = await Demoorder.findOneAndUpdate(
          { _id: tempId },
          { $set: updateData },
          { new: true }
        );

        console.log('Updated Demoorder:', updatedOrder);

        // Continue with creating the new Order
        const now = new Date();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
        const currentYear = now.getFullYear().toString();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentSecond = now.getSeconds().toString().padStart(2, '0');
        const currentMillisecond = now.getMilliseconds().toString().padStart(3, '0');
        let order_status = '0';
        let delivery_charges = '0';
        let discount = '0';
        let pickup_status = '0';
        let delivery_status = '0';
        let gst ='0';
          
        const lastOrderNumber = getLastOrderNumber();
        const lastIncrementingPart = lastOrderNumber ? parseInt(lastOrderNumber.split('-')[1]) : 0;
        const nextIncrementingPart = lastIncrementingPart + 1;
        const paddedNextIncrementingPart = nextIncrementingPart.toString().padStart(4, '0');
        const orderCode = `BFSORD${currentMonth}${currentYear}-${paddedNextIncrementingPart}`;
        console.log(orderCode);
        //const orderCode = `BFSORD${currentHour}${currentMinute}${currentSecond}${currentMillisecond}`;
        const order = new Order({
          order_code: orderCode,
          user_id: temporder.user_id,
          cart_id: temporder.cart_id,
          seller_id: temporder.seller_id,
          product_id: temporder.product_id,
          billing_address_id: temporder.billing_address_id,
          shipping_address_id: temporder.shipping_address_id,
          total_price: temporder.total_price,
          payment_method: temporder.payment_method,
          order_status: order_status,
          gst: gst || '',
          delivery_charges: delivery_charges,
          discount: discount,
          pickup_status: pickup_status,
          delivery_status: delivery_status,
          pay_now: temporder.pay_now || '', 
          remaining_amount: temporder.remaining_amount || '',
          added_dtime: new Date().toISOString(),
        });

        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder);
        res.redirect('/message?message=success');
      } catch (error) {
        console.error('Error in axios request:', error);
        res.status(500).json({
          status: '0',
          message: 'Error in axios request.',
          error: error.message,
        });
      }
    } else {
      res.send("Sorry!! Error");
    }
  } catch (error) {
    console.error('Error in getStatus function:', error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};


async function getLastOrderNumber() {
  try {
    const lastOrder = await Order.findOne().sort({ _id: -1 }); 
    return lastOrder ? lastOrder.order_code: 0;
  } catch (error) {
    console.error('Error fetching last order number:', error);
    return 0;
  }
}



// exports.getData = async function (req, res, next) {
//   try {
//     //console.log('hello',req.session.user);return false;
//     //return;

//     const amount = 1;
//     let userId =  "64dc6a75cd220b2d1ed0d3db";
//     const productId = "65802a3431a3641cccf59dbe";


//     // const amount = req.query.total_amt;
//     // let userId =  req.query.user_id;
//     // const productId = req.query.product_id;
//     let merchantTransactionId = uniqid();

//     let normalPayLoad = {
//       merchantId: MERCHANT_ID,
//       merchantTransactionId: merchantTransactionId,
//       merchantUserId: userId,
//       amount: amount,
//      //redirectUrl: APP_BE_URL+'/payment-status',
//      redirectUrl: `${APP_BE_URL}/payment-status`,
//       redirectMode: "REDIRECT",
//       mobileNumber: "9999999999",
//       paymentInstrument: {
//         type: "PAY_PAGE",
//       },
//     };
//     //console.log("normalPayLoad",normalPayLoad);
//     let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
//     let base64EncodedPayload = bufferObj.toString("base64");
//     let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
//     let sha256_val = sha256(string);
//     let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

//     axios
//       .post(
//         `${PHONE_PE_HOST_URL}/pg/v1/pay`,
//         { request: base64EncodedPayload },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-VERIFY": xVerifyChecksum,
//             accept: "application/json",
//           },
//         }
//       )
//       .then(function (response) {
//         console.log("response->", response.data);
//         console.log("response instrument->", response.data.data.instrumentResponse.redirectInfo);
      
       
//         const newOrder = new DemoOrder({
//           marchanttransactionId: merchantTransactionId,
//           user_id: userId,
//           total_price: amount,
//           product_id: productId,
//           status: 1, 
//           pay_response: response.data, 
//           added_dtime: new Date().toISOString(),
//         });
      
//         newOrder.save()
//           .then(savedOrder => {
//             console.log("Order saved successfully:", savedOrder);
            
//             const redirectWithTransactionId = `${APP_BE_URL}/payment-status?merchantTransactionId=${merchantTransactionId}`;
//             res.redirect(redirectWithTransactionId);
//           })
//           .catch(saveError => {
//             console.error("Error saving order:", saveError);
//             res.status(500).json({
//               status: "0",
//               message: "An error occurred while saving the order.",
//               error: saveError.message,
//             });
//           });
//       })
      
//   } catch (error) {
//     res.status(500).json({
//       status: "0",
//       message: "An error occurred while rendering the dashboard.",
//       error: error.message,
//     });
//   }
// };

// exports.demoorder = async function (req, res) {

//   try {
//     let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
//     let user_id = req.body.data.user_id;
//     let seller_id = req.body.data.seller_id;
//     let cart_id = req.body.data.cart_id;
//     let product_id = req.body.data.product_id;
//     let total_price = req.body.data.total_amt;
//     let payment_method = req.body.data.payment_method;
//     let gst = req.body.data.gst;
//     let order_status = '0';
//     let delivery_charges = '0';
//     let discount = '0';
//     let pickup_status = '0';
//     let delivery_status = '0';
//     let shipping_address_id = req.body.data.addressBookId;

//     let pay_now = req.body.data.pay_now || null;
//     let remaining_amount = req.body.data.remaining_amount || null;

//     const billingaddress = await addressBook.findOne({ user_id: seller_id });

//     if (!billingaddress) {
//       return res.status(404).json({ message: 'Seller address not found' });
//     }

//     const billing_address_id = billingaddress._id;

//     const order = new DemoOrder({
//       user_id,
//       cart_id,
//       seller_id,
//       product_id,
//       billing_address_id,
//       shipping_address_id,
//       total_price,
//       payment_method,
//       order_status,
//       pay_now,
//       remaining_amount,
//       status: 1,
//       added_dtime: new Date().toISOString(),
//     });
//     const savedOrder = await order.save();

//     if (savedOrder) {
//       res.status(200).json({
//         status: "1",
//         is_orderPlaced: 1,
//         message: 'Order placed successfully',
//         order: savedOrder
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };




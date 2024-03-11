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
const DemoOrder = require("../../models/api/demoModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
const Banner = require("../../models/api/bannerModel");
const Cart = require('../../models/api/cartModel');
const Notifications = require("../../models/api/notificationModel");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
// const Demo = require("../../models/api/demoModel");
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
    console.log("hello");
    const amount = req.body.total_amt;
    let userId = "MUID123";
    let merchantTransactionId = uniqid();

    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: 1234,
      amount: amount * 100,
      redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
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
      .then(function (response) {
        console.log("response->", response.data);
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

exports.getData = async function (req, res, next) {
  try {
    console.log('hello',req.body);
    //return;
    const amount = req.body.total_amt;
    let userId =  req.body.user_id;
    const productId = req.body.product_id;
    let merchantTransactionId = uniqid();

    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount,
     //redirectUrl: APP_BE_URL+'/payment-status',
     redirectUrl: `${APP_BE_URL}/payment-status`,
      redirectMode: "REDIRECT",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    console.log("normalPayLoad",normalPayLoad);
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
      .then(function (response) {
        console.log("response->", response.data);
        console.log("response instrument->", response.data.data.instrumentResponse.redirectInfo);
      
        // Save data to MongoDB
        const newOrder = new DemoOrder({
          marchanttransactionId: merchantTransactionId,
          user_id: userId,
          total_price: amount,
          product_id: productId,
          status: 1, // Assuming 1 represents a successful payment status
          pay_response: response.data, // Save the entire payment response for reference
          added_dtime: new Date().toISOString(),
        });
      
        newOrder.save()
          .then(savedOrder => {
            console.log("Order saved successfully:", savedOrder);
            
            // Redirect the user to the payment status page with the merchantTransactionId
            const redirectWithTransactionId = `${APP_BE_URL}/payment-status?merchantTransactionId=${merchantTransactionId}`;
            res.redirect(redirectWithTransactionId);
          })
          .catch(saveError => {
            console.error("Error saving order:", saveError);
            res.status(500).json({
              status: "0",
              message: "An error occurred while saving the order.",
              error: saveError.message,
            });
          });
      })
      
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
    const { merchantTransactionId } = req.query;
    if (merchantTransactionId) {
      let statusUrl =
        `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/` +
        merchantTransactionId;

      let string =
        `/pg/v1/status/${MERCHANT_ID}/` +
        merchantTransactionId +
        SALT_KEY;
      let sha256_val = sha256(string);
      let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

      axios
        .get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": merchantTransactionId,
            accept: "application/json",
          },
        })
        .then(async function (response) {
          console.log('response->', response.data);

          // Update the document in the MongoDB collection
          const updateData = {
            checkstatus_response: response.data,
            checkstatus_status: response.data.code === "PAYMENT_SUCCESS" ? "success" : "failure",
          };

          await DemoOrder.findOneAndUpdate(
            { marchanttransactionId: merchantTransactionId },
            { $set: updateData },
            { new: true }
          );

          if (response.data && response.data.code === "PAYMENT_SUCCESS") {
            res.send(response.data);
          } else {
            res.send(response.data);
          }
        })
        .catch(function (error) {
          res.send(error);
        });
    } else {
      res.send("Sorry!! Error");
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};










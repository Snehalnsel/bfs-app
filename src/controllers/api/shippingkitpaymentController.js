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
const CartDetail = require('../../models/api/cartdetailsModel');
const Notifications = require("../../models/api/notificationModel");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
const AddressBook = require("../../models/api/addressbookModel");
const shippingchrgsModel = require("../../models/api/shippingchrgsModel");
const Shippingkit = require("../../models/api/shippingkitModel");
const Demoshippingkit = require("../../models/api/demoshippingkitModel");
const Track = require("../../models/api/trackingModel");
const { create } = require('xmlbuilder2');
const { log } = require("console");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");
const smtpUser = "welcome@bidforsale.com";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  port: 465,
  host: "mail.bidforsale.com",
  auth: {
    user: smtpUser,
    pass: "A6K9JAQD%m!s",
  },
  secure: true,
});

/*
//TEST Phone Pay Key
const MERCHANT_ID = "PGTESTPAYUAT";
//const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/hermes";
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
*/

//Live Phone Pay Key
const MERCHANT_ID = "M22EUQY70KVBB";
const PHONE_PE_HOST_URL = "https://api.phonepe.com/apis/hermes";
const SALT_KEY = "6e2f6cdb-392f-4a06-b2e2-a9af19a1207c";

const SALT_INDEX = 1;
const APP_BE_URL = process.env.SITE_URL;

//6e2f6cdb-392f-4a06-b2e2-a9af19a1207c
exports.getPaymentDataforshippingkit = async function (req, res, next) {
  try {
    const tempOrderId = req.query.temp;
    const temporder = await Demoshippingkit.findById(tempOrderId);
    let amount = parseFloat(temporder.total_price);
    let userId = temporder.buyer_id;
    let merchantTransactionId = uniqid();
    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100,
      redirectUrl: `${APP_BE_URL}/payment-shippingkit-status?temp=${tempOrderId}`,
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
          data:{
            merchantId: MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: userId,
            amount: amount * 100,
            redirectUrl: `${APP_BE_URL}/payment-shippingkit-status?temp=${tempOrderId}`,
            redirectMode: "REDIRECT",
            mobileNumber: "9999999999",
            paymentInstrument: {
              type: "PAY_PAGE",
            },
          },
        },
      )
      .then(async function (response) {
        const updateData = {
          merchant_transactionid:merchantTransactionId,
          pay_response: response.data,
        };

        await Demoshippingkit.findOneAndUpdate(
          { _id: tempOrderId },
          { $set: updateData },
          { new: true }
        );
        res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
      })
      .catch(function (error) {
        console.log("Error for payment:",error);
        //return false;
        res.status(500).json({
          status: "0",
          message: "An error occurred during payment.",
          error: error.message,
        });
      });
  } catch (error) {
    console.log("Error for payment error:");
    //return false;
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

exports.getShippingKitStatus = async function (req, res, next) {
  try {
    const tempId = req.query.temp;
    const temporder = await Demoshippingkit.findById(tempId);
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
        /*const response = await axios.get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": merchantTransactionId,
            accept: "application/json",
          },
        }).then(async (res)=>{
          if(typeof res.data.code != "undefined") {
            return {
              code:res.data.code,
              data:res.data
            };
          } else {
            return {
              code:"failure",
              data:res.data
            };
          }
        });
        let updateData = {
          checkstatus_response: response.data,
        };
        if(typeof response.data.code != "undefined" && response.data.code == "PAYMENT_SUCCESS") {
          updateData.checkstatus_status = "success";
        } else {
          updateData.checkstatus_status = "failure";
        }
        */
        // let updateData = {};
        // if(typeof temporder.pay_response.code != "undefined" && temporder.pay_response.code == "PAYMENT_INITIATED") {
        //   updateData.checkstatus_status = "success";
        // } else {
        //   updateData.checkstatus_status = "failure";
        // }

        const response = await axios.get(statusUrl, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            "X-MERCHANT-ID": MERCHANT_ID,
            accept: "application/json",
          },
        }).then(async (res)=>{
          if(typeof res.data.code != "undefined") {
            return {
              code:res.data.code,
              data:res.data
            };
          } else {
            return {
              code:"failure",
              data:res.data
            };
          }
        });
        let updateData = {};
        if (response.data.success) {
            if (response.data.code === "PAYMENT_SUCCESS") {
              updateData.checkstatus_status = "success";
            } else {
              updateData.checkstatus_status = "failure";
            }
        } else {
          updateData.checkstatus_status = "failure";
        }

        await Demoshippingkit.findOneAndUpdate(
          { _id: tempId },
          { $set: updateData },
          { new: true }
        );
        if(updateData.checkstatus_status == "success") {
          const now = new Date();
          const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); 
          const currentYear = now.getFullYear().toString();
     
          const lastOrderIndex = await getLastOrderIndex();
          const nextIncrementingPart = lastOrderIndex + 1;
          const orderCode = `SHIPPINGKIT${currentMonth}${currentYear}-${nextIncrementingPart}`;
          const shippingkit = new Shippingkit({
            track_code: orderCode,
            buyer_id: temporder.buyer_id,
            product_id: temporder.product_id,
            shipping_address_id: temporder.shipping_address_id,
            order_id: temporder.order_id,
            track_id: temporder.track_id,
            price: temporder.price,
            gst: temporder.gst,
            total_price: temporder.total_price,
            payment_method: 1,
            added_dtime: new Date().toISOString(),
          });
          const savedOrder = await shippingkit.save();
          if(savedOrder)
          {
            const updatedTrack = await Track.findOneAndUpdate(
              { _id: temporder.track_id },
              { $set: { shippingkit_status: 1 } },
              { new: true }
            );
          }
          res.redirect('/message?message=success');
        } else {
          res.redirect('/message?message=failure');
        }
      } catch (error) {
        res.redirect('/message?message=failure');
      }
    } else {
      res.redirect('/message?message=failure');
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

async function getLastOrderIndex() {
  try {
    const getCount = await Shippingkit.find().count();
    return `000${getCount}`
  } catch (error) {
    return 0;
  }
}


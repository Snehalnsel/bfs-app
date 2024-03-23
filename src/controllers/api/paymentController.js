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
const { create } = require('xmlbuilder2');
const { log } = require("console");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const APP_BE_URL = process.env.SITE_URL;

exports.getPaymentData = async function (req, res, next) {
  try {
    const tempOrderId = req.query.temp;
    const temporder = await Demoorder.findById(tempOrderId);
   
    let amount;
    if(temporder.booking_amount == 0) {
      amount= parseInt(temporder.total_price);
    }
    else
    {
      amount = parseInt(temporder.booking_amount);
    }

   // amount = temporder.booking_amount !== 0 ? temporder.booking_amount : temporder.total_price;

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

    const temporder = await Demoorder.findById(tempId);

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
          //checkstatus_status: response.data.code === "PAYMENT_SUCCESS" ? "success" : "failure",
        };
        if(typeof response.data.code != "undefined" && response.data.code == "PAYMENT_SUCCESS") {
          updateData.checkstatus_status = "success";
        } else {
          updateData.checkstatus_status = "failure";
        }

        await Demoorder.findOneAndUpdate(
          { _id: tempId },
          { $set: updateData },
          { new: true }
        );

        if(updateData.checkstatus_status == "success") {
          // Continue with creating the new Order
          const now = new Date();
          const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); 
          const currentYear = now.getFullYear().toString();
          let order_status = '0';
          let delivery_charges = '0';
          let discount = '0';
          let pickup_status = '0';
          let delivery_status = '0';          
          
          const lastOrderIndex = await getLastOrderIndex();
          const nextIncrementingPart = lastOrderIndex + 1;
          const orderCode = `BFSORD${currentMonth}${currentYear}-${nextIncrementingPart}`;
          const order = new Order({
            order_code: orderCode,
            order_index: nextIncrementingPart,
            user_id: temporder.user_id,
            cart_id: temporder.cart_id,
            seller_id: temporder.seller_id,
            product_id: temporder.product_id,
            billing_address_id: temporder.billing_address_id,
            shipping_address_id: temporder.shipping_address_id,
            total_price: temporder.total_price,
            booking_amount : temporder.booking_amount || 0,
            packing_handling_charge : temporder.packing_handling_charge || 0, 
            payment_method: temporder.payment_method,
            order_status: order_status,
            gst: temporder.gst || '',
            taxable_value : temporder.taxable_value || '',
            delivery_charges: delivery_charges,
            discount: discount,
            pickup_status: pickup_status,
            delivery_status: delivery_status,
            pay_now: temporder.pay_now || '', 
            remaining_amount: temporder.remaining_amount || '',
            added_dtime: new Date().toISOString(),
          });

          const savedOrder = await order.save();

          if(savedOrder)
          {
            const updatedProduct = await Userproduct.findOneAndUpdate(
              { _id: temporder.product_id }, 
              { $set: { flag: 1 } }, 
              { new: true }
            );
            if(updatedProduct)
            {
              const cleanedCartId =  mongoose.Types.ObjectId(temporder.cart_id); 
              const cartDetail = await CartDetail.findOne({ cart_id: cleanedCartId });
              if (cartDetail) {
                await cartDetail.remove();
              }
              const cartDetailsCount = await CartDetail.countDocuments({ cart_id: savedOrder.cart_id });
              const existingCart = await Cart.findById(temporder.cart_id);
              if (cartDetailsCount === 0) {
                await existingCart.remove();
              }
            } 
          }
          res.redirect('/message?message=success');
        } else {
          res.redirect('/message?message=failure');
        }
      } catch (error) {
        res.redirect('/message?message=failure');
        /*res.status(500).json({
          status: '0',
          message: 'Error in axios request.',
          error: error.message,
        });*/
      }
    } else {
      //res.send("Sorry!! Error");
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


async function getLastOrderNumber() {
  try {
    const lastOrder = await Order.findOne().sort({ _id: -1 }); 
    return lastOrder ? lastOrder.order_code: 0;
  } catch (error) {
    return 0;
  }
}


async function getLastOrderIndex() {
  try {
    const result = await Order.findOne({}, {}, { sort: { order_index: -1 } });
    return result ? result.order_index : '000';
  } catch (error) {
    return 0; // Return 0 in case of an error
  }
}

// exports.getData = async function (req, res, next) {
//   try {
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
            
//             const redirectWithTransactionId = `${APP_BE_URL}/payment-status?merchantTransactionId=${merchantTransactionId}`;
//             res.redirect(redirectWithTransactionId);
//           })
//           .catch(saveError => {
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




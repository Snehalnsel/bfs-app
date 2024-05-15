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
const rp = require('request-promise-native');
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
// const MERCHANT_ID = "PGTESTPAYUAT";
// const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
*/
//Live Phone Pay Key
const MERCHANT_ID = "M22EUQY70KVBB";
const PHONE_PE_HOST_URL = "https://api.phonepe.com/apis/hermes";
const SALT_KEY = "6e2f6cdb-392f-4a06-b2e2-a9af19a1207c";
const SALT_INDEX = 1;
const APP_BE_URL = process.env.SITE_URL;
//6e2f6cdb-392f-4a06-b2e2-a9af19a1207c
exports.getPaymentData = async function (req, res, next) {
  try {
    const tempOrderId = req.query.temp;
    const temporder = await Demoorder.findById(tempOrderId);
    let amount;
    if(temporder.booking_amount == 0) {
      amount= parseFloat(temporder.total_price);
    } else
    {
      amount = parseFloat(temporder.booking_amount);
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
          data:{
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
          },
        },
      )
      .then(async function (response) {
        //console.log("Response for paymenteeeee:", response.data);return false;
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
        //console.log("Error for payment:",error);return false;
        res.status(500).json({
          status: "0",
          message: "An error occurred during payment.",
          error: error.message,
        });
      });
  } catch (error) {
    //console.log("Error for payment error:");return false;
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};
exports.getStatus_back = async function (req, res, next) {
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
      const user = await Users.findById(savedOrder.user_id);
      const product = await Userproduct.findById(savedOrder.product_id);
      const address = await AddressBook.findById(savedOrder.billing_address_id);
      const billingaddress = address.street_name + ', ' + address.address1 + ', ' + address.landmark + ', ' + address.city_name + ', ' + address.state_name + ', ' + address.pin_code;
      const loginHtmlPath = 'views/webpages/order-confirmed.html';
      let loginHtmlContent = fs.readFileSync(loginHtmlPath, 'utf-8');
      loginHtmlContent = loginHtmlContent.replace('{{username}}', user.name);
      loginHtmlContent = loginHtmlContent.replace('{{ordernumber}}', orderCode);
      loginHtmlContent = loginHtmlContent.replace('{{productname}}', product.name);
      loginHtmlContent = loginHtmlContent.replace('{{productimages}}', orderCode);
      loginHtmlContent = loginHtmlContent.replace('{{totalprice}}', savedOrder.total_price);
      loginHtmlContent = loginHtmlContent.replace('{{productprice}}', product.price);
      loginHtmlContent = loginHtmlContent.replace('{{shippingaddress}}', billingaddress);
      const mailData = {
        from: "Bid For Sale! <" + smtpUser + ">",
        to: user.email,
        subject: "Order Placed - Bid For Sale!",
        name: "Bid For Sale!",
        text: "order placed",
        html: loginHtmlContent
      };
      transporter.sendMail(mailData, function (err, info) {
        // if (err) console.log("err", err);
        // else console.log("info", info);
      });
         let smsData = {
          textId: "test",
          toMobile: "91" +user.phone_no,
          text: "Order placed successfully! Thank you for shopping with Bid For Sale. Your "+ product.name +" having Order ID "+ orderCode +"  is on its way to you. For any inquiries, feel free to reach out to us. Happy shopping!-BFS RETAIL SERVICES PRIVATE LIMITED",
        };
        let returnData;
        returnData = await sendSms(smsData);
        const historyData = new ApiCallHistory({
          userId: user._id,
          called_for: "Order Placed",
          api_link: process.env.SITE_URL,
          api_param: smsData,
          api_response: returnData,
          send_status: 'send',
        });
        await historyData.save();
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
        console.log("Error for payment error status:",error);
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
    console.log("Error for payment error status console:",error);
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
       // console.log("response-56565--",response)
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
        // if(typeof temporder.pay_response.code != "undefined" && temporder.pay_response.code == "PAYMENT_INITIATED") {
        //   updateData.checkstatus_status = "success";
        // } else {
        //   updateData.checkstatus_status = "failure";
        // }
        await Demoorder.findOneAndUpdate(
          { _id: tempId },
          { $set: updateData },
          { new: true }
        );
         if(updateData.checkstatus_status == "success") {
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
            bid_price: (typeof temporder.bid_price != "undefined") ? temporder.bid_price:0 ,
            original_product_price: (typeof temporder.original_product_price != "undefined") ? temporder.original_product_price:0 ,
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
      const product = await Userproduct.findById(savedOrder.product_id);
      const productimage = await Productimage.findOne({ product_id: savedOrder.product_id });      
      const user = await Users.findById(savedOrder.user_id);
      if(user)
        {
            let smsData = {
              textId: "test",
                toMobile: "91" +user.phone_no,
                text: "Dear [Buyer Name],Your order [Order ID] has been placed successfully. Sit back and relax. We'll notify you once it's shipped.- BFS Team",
              };
            let returnData;
              returnData = await sendSms(smsData);
              const historyData = new ApiCallHistory({
                userId: user._id,
                called_for: "reset password",
                api_link: process.env.SITE_URL,
                api_param: smsData,
                api_response: returnData,
                send_status: 'send',
              });
              await historyData.save();

          let message = "Dear "+user.name+", Your order "+orderCode+" has been placed successfully. Sit back and relax. We'll notify you once it's shipped.- BFS Team";
          let to_number = "91" + user.phone_no;
          let response = await send_message({ type: 'text', message, to_number });

          //SEND WHATSAPP
          let receiverMobileNo = "91" + user.phone_no;
          let root = create({ version: '1.0', encoding: "ISO-8859-1" })
            .ele('MESSAGE', { VER: '1.2' })
            .ele('USER', { USERNAME: process.env.WP_SMS_USER_NAME, PASSWORD: process.env.WP_PASSWORD })
            .ele('SMS', { UDH: "0", CODING: "1", TEXT: "Hi", PROPERTY: "0", ID: "1", TEMPLATE: "bfstest" })
            .ele('ADDRESS', { FROM: process.env.WP_SMS_SENDER_MOBILE, TO: receiverMobileNo, SEQ: "1" })
          //.up()
          //.up();

            // convert the XML tree to string
            let xml = root.end({ prettyPrint: true });
            await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
              if (err) {
                // return {
                //   status:false,
                //   data:err
                // };
              }
              let smsData = xml;
              let returnData;
              returnData = await sendWhatsapp(smsData);
          });
        }
      const seller = await Users.findById(savedOrder.seller_id);
      if(seller)
      {
        let smsData = {
          textId: "test",
          toMobile: "91" +seller.phone_no,
          text: "Dear "+seller.name+" ,Congratulations! Your product "+ product.name +" has been sold successfully.The order will be picked up within the next 2 business days. Please have the product packed and ready for shipment.- BFS Team",
        };
        let returnData;
        returnData = await sendSms(smsData);
        const historyDataforseller = new ApiCallHistory({
          userId: seller._id,
          called_for: "Order Placed of Seller Product",
          api_link: process.env.SITE_URL,
          api_param: smsData,
          api_response: returnData,
          send_status: 'send',
        });
        await historyDataforseller.save();

        let message = "Dear "+seller.name+",Congratulations! Your product "+ product.name +" has been sold successfully.The order will be picked up within the next 2 business days. Please have the product packed and ready for shipment.- BFS Team";
        let to_number = "91" + seller.phone_no;
        let response = await send_message({ type: 'text', message, to_number });

        //SEND WHATSAPP
        const receiverMobileNo = "91" + seller.phone_no;
        const root = create({ version: '1.0', encoding: "ISO-8859-1" })
          .ele('MESSAGE', { VER: '1.2' })
          .ele('USER', { USERNAME: process.env.WP_SMS_USER_NAME, PASSWORD: process.env.WP_PASSWORD })
          .ele('SMS', { UDH: "0", CODING: "1", TEXT: "Hi", PROPERTY: "0", ID: "1", TEMPLATE: "bfstest" })
          .ele('ADDRESS', { FROM: process.env.WP_SMS_SENDER_MOBILE, TO: receiverMobileNo, SEQ: "1" })
        //.up()
        //.up();

        // convert the XML tree to string
        const xml = root.end({ prettyPrint: true });
        await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
          if (err) {
            // return {
            //   status:false,
            //   data:err
            // };
          }
          //let obj = JSON.parse(data);
          //let randNumber = Math.floor((Math.random() * 1000000) + 1);
          let smsData = xml;
          let returnData;
          returnData = await sendWhatsapp(smsData);
          const historyData = await new ApiCallHistory({
            userId: mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"),
            called_for: "whatsapp",
            api_link: process.env.SITE_URL,
            api_param: smsData,
            api_response: returnData,
            send_status: 'send',
          });
          await historyData.save();
        });
      }
    
      const address = await AddressBook.findById(savedOrder.billing_address_id);

      const billingaddress = address.street_name + ', ' + address.address1 + ', ' + address.landmark + ', ' + address.city_name + ', ' + address.state_name + ', ' + address.pin_code;

      //buyer mail,sms,whatsapp
      const loginHtmlPath = 'views/webpages/order-confirmed.html';
      let loginHtmlContent = fs.readFileSync(loginHtmlPath, 'utf-8');

      loginHtmlContent = loginHtmlContent.replace('{{username}}', user.name);
      loginHtmlContent = loginHtmlContent.replace('{{ordernumber}}', orderCode);
      loginHtmlContent = loginHtmlContent.replace('{{productname}}', product.name);
      loginHtmlContent = loginHtmlContent.replace('{{productimages}}', productimage.image);
      loginHtmlContent = loginHtmlContent.replace('{{productprice}}', product.offer_price);
      loginHtmlContent = loginHtmlContent.replace('{{totalprice}}', savedOrder.total_price);
      loginHtmlContent = loginHtmlContent.replace('{{shippingaddress}}', billingaddress);
      const mailDataforbuyer = {
        from: "Bid For Sale! <" + smtpUser + ">",
        to: user.email,
        subject: "Order Placed - Bid For Sale!",
        name: "Bid For Sale!",
        text: "order placed",
        html: loginHtmlContent
      };

      transporter.sendMail(mailDataforbuyer, function (err, info) {});
      //buyer mail,sms,whatsapp
      //seller mail,sms,whatsapp
      const loginHtmlPathforSeller = 'views/webpages/seller-email.html';
      let loginHtmlContentforseller = fs.readFileSync(loginHtmlPathforSeller, 'utf-8');

      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{sellername}}', seller.name);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{ordernumber}}', orderCode);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{productname}}', product.name);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{productimages}}', productimage.image);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{productprice}}', product.offer_price);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{totalprice}}', product.offer_price);
      loginHtmlContentforseller = loginHtmlContentforseller.replace('{{buyername}}', user.name);
      savedOrder
      const mailDataforseller = {
        from: "Bid For Sale! <" + smtpUser + ">",
        to: seller.email,
        subject: "Order Confirmation - Bid For Sale!",
        name: "Bid For Sale!",
        text: "order placed",
        html: loginHtmlContentforseller
      };

      transporter.sendMail(mailDataforseller, function (err, info) {});
        //seller mail,sms,whatsapp
            if(updatedProduct)
            {
              const cleanedCartId =  mongoose.Types.ObjectId(temporder.cart_id);
              const cartDetail = await CartDetail.findOne({ cart_id: cleanedCartId });
              if (cartDetail) {
                await cartDetail.remove();
              }
              const cartDetailsCount = await CartDetail.countDocuments({ cart_id: savedOrder.cart_id });
              const existingCart = await Cart.findById(temporder.cart_id);
              if (existingCart) {
                await existingCart.remove();
              }
            } 
          }
         res.redirect('/message?message=success');
        } else {
          res.redirect('/message?message=failure');
        }
      } catch (error) {
        console.log("Error for payment error status:",error);
        res.redirect('/message?message=failure');

        // res.status(500).json({
        //   status: '0',
        //   message: 'Error in axios request.',
        //   error: error.message,
        // });

      }
    } else {
      //res.send("Sorry!! Error");
      res.redirect('/message?message=failure');
    }
  } catch (error) {
    console.log("Error for payment error status console:",error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};




exports.checkPaymentData = async function (req, res, next) {
  try {
    const tempId = req.body.temp;
    const status = req.body.status;
    const temporder = await Demoorder.findById(tempId);

    if (status === "success") {
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
        booking_amount: temporder.booking_amount || 0,
        packing_handling_charge: temporder.packing_handling_charge || 0,
        payment_method: temporder.payment_method,
        order_status: order_status,
        gst: temporder.gst || '',
        taxable_value: temporder.taxable_value || '',
        delivery_charges: delivery_charges,
        discount: discount,
        pickup_status: pickup_status,
        delivery_status: delivery_status,
        pay_now: temporder.pay_now || '',
        remaining_amount: temporder.remaining_amount || '',
        added_dtime: new Date().toISOString(),
      });

      const savedOrder = await order.save();

      if (savedOrder) {
        const updatedProduct = await Userproduct.findOneAndUpdate(
          { _id: temporder.product_id },
          { $set: { flag: 1 } },
          { new: true }
        );

        const user = await Users.findById(savedOrder.user_id);
        const seller = await Users.findById(savedOrder.seller_id);

        const product = await Userproduct.findById(savedOrder.product_id);
  
        const address = await AddressBook.findById(savedOrder.billing_address_id);
  
        const billingaddress = address.street_name + ', ' + address.address1 + ', ' + address.landmark + ', ' + address.city_name + ', ' + address.state_name + ', ' + address.pin_code;
  
        const loginHtmlPath = 'views/webpages/order-confirmed.html';
        let loginHtmlContent = fs.readFileSync(loginHtmlPath, 'utf-8');
  
        loginHtmlContent = loginHtmlContent.replace('{{username}}', user.name);
        loginHtmlContent = loginHtmlContent.replace('{{ordernumber}}', orderCode);
        loginHtmlContent = loginHtmlContent.replace('{{productname}}', product.name);
        loginHtmlContent = loginHtmlContent.replace('{{productimages}}', product.image);
        loginHtmlContent = loginHtmlContent.replace('{{totalprice}}', savedOrder.total_price);
        loginHtmlContent = loginHtmlContent.replace('{{productprice}}', product.price);
        loginHtmlContent = loginHtmlContent.replace('{{shippingaddress}}', billingaddress);
      
        const mailData = {
          from: "Bid For Sale! <" + smtpUser + ">",
          to: user.email,
          subject: "Order Placed - Bid For Sale!",
          name: "Bid For Sale!",
          text: "order placed",
          html: loginHtmlContent
        };
  
        transporter.sendMail(mailData, function (err, info) {
          // if (err) console.log("err", err);
          // else console.log("info", info);
        });

        let loginHtmlPath1 = 'views/webpages/seller.html';
        let loginHtmlContent1 = fs.readFileSync(loginHtmlPath, 'utf-8');
  
        loginHtmlContent1 = loginHtmlContent.replace('{{username}}', user.name);
        loginHtmlContent1 = loginHtmlContent.replace('{{sellername}}', seller.name);
        loginHtmlContent1 = loginHtmlContent.replace('{{ordernumber}}', orderCode);
        loginHtmlContent1 = loginHtmlContent.replace('{{productname}}', product.name);
        loginHtmlContent1 = loginHtmlContent.replace('{{productimages}}', orderCode);
        loginHtmlContent1 = loginHtmlContent.replace('{{totalprice}}', savedOrder.total_price);
        loginHtmlContent1 = loginHtmlContent.replace('{{productprice}}', product.price);
        loginHtmlContent1 = loginHtmlContent.replace('{{shippingaddress}}', billingaddress);
      
        const mailData1 = {
          from: "Bid For Sale! <" + smtpUser + ">",
          to: user.email,
          subject: "Order Placed - Bid For Sale!",
          name: "Bid For Sale!",
          text: "order placed",
          html: loginHtmlContent1
        };
        transporter.sendMail(mailData1, function (err, info) {
          // if (err) console.log("err", err);
          // else console.log("info", info);
        });
           let smsData = {
            textId: "test",
            toMobile: "91" +user.phone_no,
            text: "Order placed successfully! Congratulations! Your product  Your "+ product.name +" having Order ID "+ orderCode +"  is on its way to you. For any inquiries, feel free to reach out to us. Happy shopping!-BFS RETAIL SERVICES PRIVATE LIMITED",
          };
          let returnData;
          returnData = await sendSms(smsData);
          const historyData = new ApiCallHistory({
            userId: user._id,
            called_for: "Order Placed",
            api_link: process.env.SITE_URL,
            api_param: smsData,
            api_response: returnData,
            send_status: 'send',
          });
          await historyData.save();
          
          let sellersmsData = {
            textId: "test",
            toMobile: "91" +seller.phone_no,
            text: "Dear "+ seller.name +" , Congratulations! Your product "+ product.name +" has been sold successfully. The order will be picked up within the next 2 business days. Please have the product packed and ready for shipment.-BFS RETAIL SERVICES PRIVATE LIMITED",
          };
          let returnDataforseller;
          returnDataforseller = await sendSms(sellersmsData);

          const historyData1 = new ApiCallHistory({
            userId: user._id,
            called_for: "Order Placed for Seller Product",
            api_link: process.env.SITE_URL,
            api_param: smsData,
            api_response: returnDataforseller,
            send_status: 'send',
          });
          await historyData1.save();
          
        if (updatedProduct) {
          const cleanedCartId = mongoose.Types.ObjectId(temporder.cart_id);
          const cartDetail = await CartDetail.findOne({ cart_id: cleanedCartId });
          if (cartDetail) {
            await cartDetail.remove();
          }
          const cartDetailsCount = await CartDetail.countDocuments({ cart_id: savedOrder.cart_id });
          const existingCart = await Cart.findById(temporder.cart_id);
          if (cartDetailsCount === 0 && existingCart) {
            await existingCart.remove();
          }
        }
      }
      res.status(200).json({
        status: "1",
        is_orderPlaced: 1,
        message: 'Order placed successfully',
        order: savedOrder
      });
    } else {
      res.status(400).json({
        status: "0",
        is_orderPlaced: 0,
        message: 'Their is a an error in your oder',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

async function getLastOrderIndex() {
  try {
    
    const getCount = await Order.find().count();
    return `000${getCount}`
    
  } catch (error) {
    return 0; 
  }
}


async function send_message(body) {
  let url = process.env.WP_SMS_API_URL + "/" + process.env.WP_SMS_PRODUCT_ID + "/" + process.env.WP_SMS_PHONE_ID + "/" + "sendMessage";
  let response = await rp(url, {
    method: 'post',
    json: true,
    body,
    headers: {
      'Content-Type': 'application/json',
      'x-maytapi-key': process.env.WP_SMS_API_TOKEN,
    },
  });
  return response;
}


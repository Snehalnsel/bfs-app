var express = require("express");
const session = require('express-session');
var router = express.Router();
var moment = require("moment");
var moment = require('moment-timezone');
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const request = require('request');
const twilio = require('twilio');
const crypto = require('crypto');
const path = require("path");
const ejs = require('ejs');
const helper = require("../../helpers/helper");
const fs = require("fs");
const mime = require("mime");
const cors = require('cors');
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
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
const webUserRegistration = require("../../models/api/webUserRegistrationModel");
const Wishlist = require('../../models/api/wishlistModel');
const addressBook = require("../../models/api/addressbookModel");
const Category = require("../../models/api/categoryModel");
const Cartremove = require("../../models/api/cartremoveModel");
const Cart = require('../../models/api/cartModel');
const CartDetail = require('../../models/api/cartdetailsModel');
const Order = require("../../models/api/orderModel");
const Banner = require("../../models/api/bannerModel");
const Brand = require("../../models/api/brandModel");
const Size = require("../../models/api/sizeModel");
const Gender = require("../../models/api/genderModel");
const ReturnOrder = require("../../models/api/returnorderModel");
const Reasonlist = require("../../models/api/reasonlistModel");
const Iptrnsaction = require("../../models/api/ipTransactionModel");
const insertNotification = require("../../models/api/insertNotification");
const Demoorder = require("../../models/api/demoorderModel");
const smtpUser = "welcome@bidforsale.com";
//const smtpUser = "hello@bidforsale.com";
const nodemailer = require("nodemailer");
const app = express();
const generateTokens = require("../../utils/generateTokens");
const verifyRefreshToken = require("../../utils/verifyRefreshToken");
const tokenDecode = require("../../utils/tokenDecode");
const brandModel = require("../../models/api/brandModel");
const sizeModel = require("../../models/api/sizeModel");
const productconditionModel = require("../../models/api/productconditionModel");
const Ordertracking = require("../../models/api/ordertrackModel");
const Shippingkit = require("../../models/api/shippingkitModel");
//const Ordertracking = require("../../models/api/ordertrackModel");
const Track = require("../../models/api/trackingModel");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
const CompressImage = require("../../models/thirdPartyApi/CompressImage");
const { log, Console } = require("console");
const { create } = require('xmlbuilder2');

// const transporter = nodemailer.createTransport({
//   port: 465,
//   host: "mail.bidforsale.com",
//   auth: {
//     user: smtpUser,
//     pass: "aI)q#z@xJQ+u",
//   },
//   secure: true,
// });

const transporter = nodemailer.createTransport({
    port: 465,
    host: "mail.bidforsale.com",
    auth: {
      user: smtpUser,
      pass: "A6K9JAQD%m!s",
    },
    secure: true,
});
function randNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// app.use(session({
//   secret: yourSecretKey,
//   resave: false,
//   saveUninitialized: false
// }));


const accountSid = 'ACa1b71e8226f3a243196beeee233311a9';
const authToken = 'ea9a24bf2a9ca43a95b991c9c471ba93';
const twilioClient = new twilio(accountSid, authToken);

async function generateToken(user) {

  return jwt.sign({ data: user }, tokenSecret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
}
const refreshToken = (user) => {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
};
const email = 'sneha.lnsel@gmail.com';
// const shipPassword = 'Sweetu@2501';
const shipPassword = 'Jalan@2451';
const baseUrl = 'https://apiv2.shiprocket.in/v1/external';

function generateToken1(email, password) {
  const options = {
    method: 'POST',
    url: baseUrl + '/auth/login',
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
async function generateSellerPickup(data) {
  token = await generateToken1(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
    return Promise.reject('Token not available. Call generateToken first.');
  }
  const options = {
    method: 'POST',
    url: baseUrl + '/settings/company/addpickup',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
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
exports.productData = async function (req, res, next) {
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const productId = req.params.id;
    let query = {};

    query._id = productId;

    let isProductInWishlist = "";
    if (isLoggedIn) {
      isProductInWishlist = await Wishlist.findOne({
        user_id: isLoggedIn,
        product_id: productId,
      });
    }
    const categoydetails = await Userproduct.findById(query)
      .populate('category_id', 'name')
      .exec();

    const userproducts = await Userproduct.findOne({
      _id: productId,
      approval_status: 1
    })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .populate('user_id', 'name')
      .populate('size_id', 'name')
      .exec();
    const userproducts1 = await Userproduct.find({
      category_id: categoydetails.category_id,
      approval_status: 1
    })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .populate('user_id', 'name')
      .populate('size_id', 'name')
      .exec();

    let formattedUserProducts1 = [];

    if (userproducts1) {

      for (const userproduct1 of userproducts1) {
        const productImages1 = await Productimage.find({ product_id: userproduct1._id });

        const formattedUserProduct1 = {
          _id: userproduct1._id,
          name: userproduct1.name,
          description: userproduct1.description,
          price: userproduct1.price,
          offer_price: userproduct1.offer_price,
          percentage: userproduct1.percentage,
          status: userproduct1.status,
          flag: userproduct1.flag,
          approval_status: userproduct1.approval_status,
          added_dtime: userproduct1.added_dtime,
          __v: userproduct1.__v,
          product_images: typeof productImages1 != "undefined" ? productImages1 : [],
        };

        formattedUserProducts1.push(formattedUserProduct1);
      }
    }
    if (!userproducts) {
      return res.render("webpages/productdetails", {
        title: "Not Found",
        message: "The requested product was not found.",
        websiteUrl: process.env.SITE_URL,
        isLoggedIn: isLoggedIn,
        respdata: {},
        category: categoydetails.category_id,
        relatedProducts: formattedUserProducts1,
        isWhislist: isProductInWishlist != null && Object.keys(isProductInWishlist).length ? true : false
      });
    }
    userproducts.hitCount = (userproducts.hitCount || 0) + 1;
    await userproducts.save();
    const productImages = await Productimage.find({ product_id: userproducts._id });
    const productCondition = await Productcondition.findById(userproducts.status);
    const formattedUserProduct = {
      _id: userproducts._id,
      name: userproducts.name,
      description: userproducts.description,
      category_id: userproducts.category_id._id,
      category: userproducts.category_id ? userproducts.category_id.name : '',
      brand: userproducts.brand_id ? userproducts.brand_id.name : '',
      user_id: userproducts.user_id ? userproducts.user_id._id : '',
      user_name: userproducts.user_id ? userproducts.user_id.name : '',
      size_id: userproducts.size_id ? userproducts.size_id.name : '',
      price: userproducts.price,
      offer_price: userproducts.offer_price,
      percentage: userproducts.percentage,
      status: userproducts.status,
      original_invoice: userproducts.original_invoice,
      flag: userproducts.flag,
      original_packaging: userproducts.original_packaging,
      approval_status: userproducts.approval_status,
      satus_name: productCondition ? productCondition.name : '',
      added_dtime: userproducts.added_dtime,
      hitCount: userproducts.hitCount || 0,
      __v: userproducts.__v,
      product_images: typeof productImages != "undefined" ? productImages : [],
    };
    res.render("webpages/productdetails", {
      title: "Product Details",
      message: "Welcome to the Product page!",
      respdata: formattedUserProduct,
      relatedProducts: formattedUserProducts1,
      category: categoydetails.category_id,
      websiteUrl: process.env.SITE_URL,
      isLoggedIn: isLoggedIn,
      isWhislist: isProductInWishlist != null && Object.keys(isProductInWishlist).length ? true : false
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};

exports.privacypolicyData = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/privacypolicy", {
      title: "Privacy Policy",
      message: "Welcome to the privacy policy page!",
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};


exports.tremsandconditionData = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/trems", {
      title: "Trems and Condition",
      message: "Welcome to the privacy policy page!",
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};


exports.registration = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    if (isLoggedIn == "") {
      res.render("webpages/registration", {
        title: "Registration",
        message: "Welcome to the privacy policy page!",
        isLoggedIn: isLoggedIn,
      });
    } else {
      res.redirect('/my-account');
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};

// exports.signin = async function (req, res, next) {
//   let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   bcrypt.hash(req.body.password, rounds, (error, hash) => {
//     if (error) {
//       res.status(400).json({
//         status: "0",
//         message: "Error!",
//         respdata: error,
//       });
//     }
//     else {

//       Users.findOne({ email: req.body.email }).then((user) => {
//         if (!user) {
//           const newUser = Users({
//             email: req.body.email,
//             password: hash,
//             token: "na",
//             //title: req.body.title,
//             name: req.body.name,
//             phone_no: req.body.phone_no,
//             deviceid: "na",
//             devicename: "na",
//             fcm_token: "na",
//             country: "na",
//             country_code: "na",
//             country: "na",
//             last_login: "na",
//             last_logout: "na",
//             created_dtime: dateTime,
//             app_user_id: "na",
//             trial_end_date: "na",
//             image: "na",
//           });

//           newUser.save();
//           //res.redirect('/');
//           await exports.ajaxGetUserLogin(req, res, next, req.body.email, req.body.password);
//         }
//         else {
//           // res.status(400).json({
//           //   status: "0",
//           //   message: "User already exists!",
//           //   respdata: {},
//           // });

//           res.redirect('/registration?userExists=true');
//         }
//       });
//     }
//   });
// };

exports.signin = async function (req, res, next) {
  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    bcrypt.hash(req.body.password, rounds, async (error, hash) => {
      if (error) {
        res.status(400).json({
          status: "0",
          message: "Error!",
          respdata: error,
        });
      } else {
        const user = await Users.findOne({ email: req.body.email });
        const userIpAddress = req.connection.remoteAddress;

        if (!user) {
          const newUser = Users({
            email: req.body.email,
            password: hash,
            token: "na",
            name: req.body.name,
            phone_no: req.body.phone_no,
            deviceid: "na",
            devicename: "na",
            fcm_token: "na",
            country: "na",
            country_code: "na",
            country: "na",
            last_login: "na",
            last_logout: "na",
            created_dtime: dateTime,
            app_user_id: "na",
            trial_end_date: "na",
            image: "na",
            ip_address: userIpAddress,
          });
          await newUser.save();
          const ipTransaction = new Iptrnsaction({
            user_id: newUser._id, // Use newUser._id instead of user._id
            Purpose: "Web User Registration",
            ip_address: userIpAddress,
            created_dtime: dateTime,
          });
          await ipTransaction.save();

          //SEND SMS
          await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
            if (err) {
              // return {
              //   status:false,
              //   data:err
              // };
            }
            //let obj = JSON.parse(data);
            let randNumber = Math.floor((Math.random() * 1000000) + 1);
            let smsData = {
              textId: "test",
              toMobile: "91" + req.body.phone_no,
              text: "You have been tagged with an invoice " + randNumber + ". Please use OTP " + randNumber + " for approving the invoice. Do not share your OTP with anyone. RJSSLT",
            };
            let returnData;
            returnData = await sendSms(smsData);
            const historyData = new ApiCallHistory({
              userId: mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"),
              called_for: "sms",
              api_link: process.env.SITE_URL,
              api_param: smsData,
              api_response: returnData,
              send_status: 'send',
            });
            await historyData.save();
          });
          //SEND SMS
          //SEND WHATSAPP
          const receiverMobileNo = "91" + req.body.phone_no;
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
          //SEND WHATSAPP

          const user = await Users.findOne({ email: req.body.email });
          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
            title: user.title,
            name: user.name,
            age: user.age,
            image: user.image ? user.image : '',
            phone_no: user.phone_no,
            weight: user.weight,
            height: user.height,
            country: user.country,
            country_code: user.country_code,
            country: user.country,
            goal: user.goal,
            hear_from: user.hear_from,
          };
          const { accessToken, refreshToken } = await generateTokens(userToken, "");
          return res.status(200).json({
            status: "success",
            message: "Successfully Registered!",
            respdata: {
              accessToken: accessToken,
              accessTokenExpires: process.env.COOCKIE_ACCESS_TOKEN_EXPIRES_IN,
              refreshToken: refreshToken,
              refreshTokenExpires: process.env.COOCKIE_REFRESH_TOKEN_EXPIRES_IN,
              refreshReset: true,
            },
          });
        } else {
          res.redirect('/registration?userExists=true');
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal Server Error",
      respdata: error.message || "Unknown error",
    });
  }
};
exports.ajaxGetUserLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  const { email, password, cookieAccessToken, cookieRefreshToken } = req.body;
  //Token generate
  let accessTokenGlobal = "";
  let refreshTokenGlobal = "";
  Users.findOne({
    $or: [
      { email: email },
      { phone_no: email }
    ]
  }).then(async (user) => {
    if (!user)
      res.status(404).json({
        status: "error",
        message: "User not found!",
        respdata: {},
      });
    else {
      const requrl = url.format({
        protocol: req.protocol,
        host: req.get("host"),
      });
      req.app.locals.requrl = requrl;

      bcrypt.compare(password, user.password, async (error, match) => {
        if (error) {
          res.status(400).json({
            status: "error",
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
          // user.deviceid = deviceid;
          // user.devicename = devicename;
          // user.fcm_token = fcm_token;

          const loginHtmlPath = 'views/webpages/mailbody.html';
          const loginHtmlContent = fs.readFileSync(loginHtmlPath, 'utf-8');

          user.save(async (err) => {
            if (err) {
              res.status(400).json({
                status: "0",
                message: "Error updating user device information!",
                respdata: err,
              });
            } else {
              const mailData = {
                from: "Bid For Sale! <" + smtpUser + ">",
                to: user.email,
                subject: "Welcome to Bid For Sale!",
                name: "Bid For Sale!",
                text: "welocome",
                html: loginHtmlContent
              };

              transporter.sendMail(mailData, function (err, info) {
                if (err) console.log(err);
                else console.log(info);
              });

              //html:
              // "Hey " +
              // user.name +
              // ", <br> <p>Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items </p>",
              // const msg = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";

              // const whatsappMessage = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";
              // const userPhoneNo = "+917044289770";

              // twilioClient.messages.create({
              //   body: whatsappMessage,
              //   // From: 'whatsapp:+12565734549',
              //   // to: 'whatsapp:+918116730275'
              //   from: 'whatsapp:+14155238886',
              //   to: 'whatsapp:+917044289770'
              // })
              //   .then((message) => {
              //     console.log(`WhatsApp message sent with SID: ${message.sid}`);
              //   })
              //   .catch((error) => {
              //     console.error(`Error sending WhatsApp message: ${error.message}`);
              //   });
              const userToken = {
                userId: user._id,
                email: user.email,
                password: user.password,
                title: user.title,
                name: user.name,
                age: user.age,
                image: user.image ? user.image : '',
                //usertoken:user.token,
                phone_no: user.phone_no,
                weight: user.weight,
                height: user.height,
                country: user.country,
                country_code: user.country_code,
                country: user.country,
                goal: user.goal,
                hear_from: user.hear_from,
              };
              //let userData = req.session.user;
              //const { accessToken, refreshToken } = await generateTokens(userToken, cookieRefreshToken);
              //Generate Token Required By Condition
              if (cookieRefreshToken != "") {
                let getAccessTokenData = await tokenDecode(cookieAccessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
                if (!getAccessTokenData.error) {
                  if ((typeof req.session.user != "undefined") && (req.session.user.userId.toString() == getAccessTokenData.tokenDetails.userId.toString())) {
                    res.status(200).json({
                      status: "success",
                      refreshReset: false,
                      message: "Already logged In!!"
                    });
                  } else {
                    let getRefreshTokenData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
                    if (!getRefreshTokenData.error) {
                      if (getRefreshTokenData.tokenDetails.exp > (Date.now() / 1000)) {
                        const { accessToken, refreshToken } = await generateTokens(userToken, cookieRefreshToken);
                        accessTokenGlobal = accessToken;
                        refreshTokenGlobal = refreshToken;
                      } else {
                        const { accessToken, refreshToken } = await generateTokens(userToken, "");
                        accessTokenGlobal = accessToken;
                        refreshTokenGlobal = refreshToken;
                      }
                    } else {
                      res.status(200).json({
                        status: "error",
                        refreshReset: false,
                        message: "Error while generating your token!"
                      });
                    }
                  }
                } else {
                  res.status(200).json({
                    status: "error",
                    refreshReset: false,
                    message: "Error while generating your token!"
                  });
                }
              } else {
                const { accessToken, refreshToken } = await generateTokens(userToken, "");
                accessTokenGlobal = accessToken;
                refreshTokenGlobal = refreshToken;
              }
              let myquery = { _id: user._id };
              let newvalues = { $set: { token: accessTokenGlobal, last_login: dateTime } };
              Users.updateOne(myquery, newvalues, function (err, response) {
                if (err) {
                  res.status(400).json({
                    status: "error",
                    message: "can not updated your token",
                    respdata: {},
                  });
                } else {
                  req.session.user = userToken;
                  res.status(200).json({
                    status: "success",
                    message: "Successfully logged in!",
                    respdata: {
                      accessToken: accessTokenGlobal,
                      accessTokenExpires: process.env.COOCKIE_ACCESS_TOKEN_EXPIRES_IN,
                      refreshToken: refreshTokenGlobal,
                      refreshTokenExpires: process.env.COOCKIE_REFRESH_TOKEN_EXPIRES_IN,
                      refreshReset: true,
                    },
                  });
                }
              });
            }
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Password does not match!",
            respdata: {},
          });
        }
      });
    }
  });
};

exports.userRelogin = async function (req, res, next) {
  const { cookieRefreshToken } = req.body;
  let accessTokenGlobal = "";
  let refreshTokenGlobal = "";
  if (cookieRefreshToken != "") {
    let tokenDetailsData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
    if (!tokenDetailsData.error) {
      const email = tokenDetailsData.tokenDetails.email;
      if ((typeof req.session.user != "undefined") && (req.session.user.userId.toString() == tokenDetailsData.tokenDetails.userId.toString())) {
        res.status(200).json({
          status: "error",
          message: "Already logged In!!"
        });
      } else {
        Users.findOne({ email }).then(async (user) => {
          //user.save(async (err) => {
          /*if (err) {
            res.status(400).json({
              status: "error",
              message: "Error updating user device information!",
              respdata: err,
            });
          } else {*/
          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
            title: user.title,
            name: user.name,
            image: user.image ? user.image : '',
            age: user.age,
            phone_no: user.phone_no,
            weight: user.weight,
            height: user.height,
            country: user.country,
            country_code: user.country_code,
            country: user.country,
            goal: user.goal,
            hear_from: user.hear_from,
          };
          //user data stored in session
          req.session.user = userToken;
          if (tokenDetailsData.tokenDetails.exp > (Date.now() / 1000)) {
            //generate access token only
            const { accessToken, refreshToken } = await generateTokens(userToken, cookieRefreshToken);
            accessTokenGlobal = accessToken;
            refreshTokenGlobal = refreshToken;
          } else {
            //generate refresh token
            const { accessToken, refreshToken } = await generateTokens(userToken, "");
            accessTokenGlobal = accessToken;
            refreshTokenGlobal = refreshToken;
          }
          Users.findOneAndUpdate(
            { _id: user._id },
            { $set: { token: accessTokenGlobal, last_login: dateTime } },
            { upsert: true },
            function (err, doc) {
              if (err) {
                res.status(500).json({
                  status: "error",
                  message: "Token update error!",
                });
              } else {
                Users.findOne({ _id: user._id }).then((updatedUser) => {
                  res.status(200).json({
                    status: "success",
                    message: "Successful!",
                    accessToken: accessTokenGlobal,
                    refreshToken: refreshTokenGlobal,
                    accessTokenExpires: process.env.COOCKIE_ACCESS_TOKEN_EXPIRES_IN,
                    refreshTokenExpires: process.env.COOCKIE_REFRESH_TOKEN_EXPIRES_IN,
                  });
                });
              }
            }
          );
          //}
          //});
        });
      }
    } else {
      res.status(200).json({
        status: "error",
        message: "Invalid Token!!",
      });
    }
  }

};

exports.userFilter = async function (req, res, next) {
  let { brandList, sizeList, conditionList, priceList, genderList, optionId, productcategoryId, pageNo } = req.body;
  if (typeof optionId != "undefined") {
    if ((optionId == 0)) {
      optionId = 1;
    } else {
      optionId = -1;
    }
  } else {
    optionId = 1;
  }
  const page = pageNo || 1;
  const pageSize = 8;
  const skip = (page - 1) * pageSize;
  let concatVar = {};
  let objConditionList = [];
  if ((typeof conditionList != "undefined") && (conditionList.length > 0)) {
    conditionList.forEach(function (item) {
      objConditionList.push(mongoose.Types.ObjectId(item));
    });
  }
  if (typeof brandList != "undefined") {
    concatVar["brand_id"] = { "$in": brandList };
  }
  if (typeof sizeList != "undefined") {
    concatVar["size_id"] = { "$in": sizeList };
  }
  if (typeof productcategoryId != "undefined") {
    concatVar["category_id"] = { "$in": mongoose.Types.ObjectId(productcategoryId) };
  }
  if ((typeof conditionList != "undefined") && (objConditionList.length > 0)) {
    concatVar["status"] = { "$in": objConditionList };
  }
  if ((typeof genderList != "undefined")) {
    concatVar["gender_id"] = { "$in": genderList };
  }
  // if (priceList && typeof priceList !== "undefined" && priceList !='') {
  //   let [min, max] = priceList.split('-').map(Number);
  //   const priceConditions= {
  //     offer_price: {
  //       $gt: parseFloat(min),
  //       $lte: parseFloat(max)
  //     }
  //   };
  //     // Check if concatVar already has an $and array
  //     if (concatVar.$and) {
  //       concatVar.$and.push(priceConditions);
  //   } else {
  //       // Create a new $and array
  //       concatVar.$and = [priceConditions];
  //   }
  //   concatVar['$and'] = priceConditions;
  // }
  // let allProductData = await Userproduct.find({ $and: concatVar}).sort({ offer_price: optionId });
  if (priceList && typeof priceList !== "undefined" && priceList !== '') {
    let [min, max] = priceList.split('-').map(Number);
    const priceConditions = {
      offer_price: {
        $gte: parseFloat(min),
        $lte: parseFloat(max)
      }
    };

    if (concatVar.$and) {
      concatVar.$and.push(priceConditions);
    } else {
      concatVar.$and = [priceConditions];
    }
  }
  // let totalProduct = await Userproduct.find(concatVar).sort({ offer_price: optionId });
  const query = {
    ...concatVar,
    approval_status: 1,
    flag: 0
  };
  let totalProduct = await Userproduct.countDocuments(query);
  let allProductData = await Userproduct.find(query)
    .sort({ offer_price: optionId })
    .skip(skip)
    .limit(pageSize);
  const formattedUserProducts = [];
  for (const userproduct of allProductData) {
    const productImages = await Productimage.find({ product_id: userproduct._id });
    const productCondition = await Productcondition.findById(userproduct.status);
    const formattedUserProduct = {
      _id: userproduct._id,
      name: userproduct.name,
      description: userproduct.description,
      category: (typeof userproduct.category_id != "undefined") ? userproduct.category_id.name : "",
      brand: (typeof userproduct.brand_id != "undefined") ? userproduct.brand_id.name : "",
      user_id: (typeof userproduct.user_id != "undefined") ? userproduct.user_id._id : "",
      user_name: (typeof userproduct.user_id != "undefined") ? userproduct.user_id.name : "",
      size_id: (typeof userproduct.size_id != "undefined") ? userproduct.size_id.name : "",
      price: (typeof userproduct.price != "undefined") ? userproduct.price : "",
      offer_price: (typeof userproduct.offer_price != "undefined") ? userproduct.offer_price : "",
      percentage: (typeof userproduct.percentage != "undefined") ? userproduct.percentage : "",
      status: (typeof userproduct.status != "undefined") ? userproduct.status : "",
      flag: (typeof userproduct.flag != "undefined") ? userproduct.flag : "",
      approval_status: (typeof userproduct.approval_status != "undefined") ? userproduct.approval_status : "",
      added_dtime: (typeof userproduct.added_dtime != "undefined") ? userproduct.added_dtime : "",
      __v: (typeof userproduct.__v != "undefined") ? userproduct.__v : "",
      product_images: productImages,
      status_name: productCondition.name
    };
    formattedUserProducts.push(formattedUserProduct);
  }
  const totalPages = Math.ceil(totalProduct / pageSize);
  const userProductsCount = formattedUserProducts.length;
  if (formattedUserProducts.length > 0) {
    return res.json({
      status: 'success',
      message: 'Success search result',
      respdata: formattedUserProducts,
      productCount: userProductsCount,
      totalPages: totalPages,
      currentPage: page,
      pageSize: pageSize,
      webUrl: 'user-filter',
      websiteUrl: process.env.SITE_URL,
      totalProduct: totalProduct
    });
  } else {
    res.status(200).json({
      status: "error",
      message: "No Reccords Found for this search..",
    });
  }
};

exports.getUserLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  const { email, password } = req.body;
  Users.findOne({ email }).then(async (user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      const requrl = url.format({
        protocol: req.protocol,
        host: req.get("host"),
      });
      req.app.locals.requrl = requrl;
      bcrypt.compare(password, user.password, async (error, match) => {
        if (error) {
          res.status(400).json({
            status: "0",
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
          // user.deviceid = deviceid;
          // user.devicename = devicename;
          // user.fcm_token = fcm_token;
          user.save(async (err) => {
            if (err) {
              res.status(400).json({
                status: "0",
                message: "Error updating user device information!",
                respdata: err,
              });
            } else {
              const mailData = {
                from: "Bid For Sale! <" + smtpUser + ">",
                to: user.email,
                subject: "BFS - Bid For Sale  - Welcome Email",
                text: "Server Email!",
                html:
                  "Hey " +
                  user.name +
                  ", <br> <p>Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items </p>",
              };
              transporter.sendMail(mailData, function (err, info) {
                if (err) console.log(err);
                else console.log(info);
              });
              // const msg = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";
              const whatsappMessage = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";
              const userPhoneNo = "+917044289770";
              twilioClient.messages.create({
                body: whatsappMessage,
                // From: 'whatsapp:+12565734549',
                // to: 'whatsapp:+918116730275'
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+917044289770'
              })
                .then((message) => {
                })
                .catch((error) => {
                });
              const userToken = {
                userId: user._id,
                email: user.email,
                password: user.password,
                title: user.title,
                name: user.name,
                age: user.age,
                //usertoken:user.token,
                phone_no: user.phone_no,
                weight: user.weight,
                height: user.height,
                country: user.country,
                country_code: user.country_code,
                country: user.country,
                goal: user.goal,
                hear_from: user.hear_from,
              };
              //delete req.session.user;
              req.session.user = {
                userId: user._id,
                email: user.email,
                password: user.password,
                title: user.title,
                name: user.name,
                age: user.age,
                image: user.image,
                //usertoken:user.token,
                phone_no: user.phone_no,
                weight: user.weight,
                height: user.height,
                country: user.country,
                country_code: user.country_code,
                country: user.country,
                goal: user.goal,
                hear_from: user.hear_from,
              };
              var userData = req.session.user;
              Users.findOneAndUpdate(
                { _id: user._id },
                { $set: { token: await generateToken(userToken), last_login: dateTime } },
                { upsert: true },
                function (err, doc) {
                  if (err) {
                    throw err;
                  } else {
                    Users.findOne({ _id: user._id }).then((updatedUser) => {
                      // res.status(200).json({
                      //   status: "1",
                      //   message: "Successful!",
                      //   respdata: updatedUser,
                      // });
                    });
                    res.redirect('/my-account');
                  }
                }
              );
            }
          });
        } else {
          res.status(400).json({
            status: "0",
            message: "Password does not match!",
            respdata: {},
          });
        }
      });
    }
  });
};
exports.myAccount = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    //if (userData === undefined || userData === null)
    if (isLoggedIn == "") {
      res.redirect('/registration');
    }
    else {
      var userData = req.session.user;
      const address = await addressBook.find({ user_id: ObjectId(req.session.user.userId) });

      const html = await ejs.renderFile("views/webpages/myaccount.ejs", {
        helper: helper,
        title: "My Account",
        message: "Welcome to the privacy policy page!",
        respdata: req.session.user,
        respdata1: address,
        isLoggedIn: isLoggedIn,
        websiteUrl: process.env.SITE_URL,
      }, {async: true});
      res.send(html);

      // res.render("webpages/myaccount", {
      //   helper: helper,
      //   //async: true,
      //   title: "My Account",
      //   message: "Welcome to the privacy policy page!",
      //   respdata: req.session.user,
      //   respdata1: address,
      //   isLoggedIn: isLoggedIn,
      // });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};
exports.editProfile = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    var userData = req.session.user;
    res.render("webpages/edit-profile", {
      title: "Edit profile",
      message: "Welcome to the Edit Profile page!",
      respdata: req.session.user,
      isLoggedIn: isLoggedIn,
      userData: userData
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.addAddress = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    var userData = req.session.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
    const address = await addressBook.findOne({ user_id: userData.userId });
    var add = address;
    res.render("webpages/edit-address", {
      title: "Edit Address",
      message: "Welcome to the Edit Profile page!",
      respdata: add,
      respdata1: userData,
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};


exports.thankyoupage = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    var userData = req.session.user;
    const message = req.query.message;

    console.log(message);

    res.render("webpages/message", {
      title: "Edit Address",
      message: "Welcome to the Edit Profile page!",
      respdata1: userData,
      isLoggedIn: isLoggedIn,
      message:message
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.getParentCategories = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/productcategories", {
      title: "Product Categories",
      message: "Welcome to the Product Categories!",
      isLoggedIn: isLoggedIn,
      //respdata: parentCategories,
    });
    // return res.status(200).json({
    //   status: "1",
    //   message: "Found!",
    //   respdata: parentCategories,
    // });
    // res.render("webpages/productcategories", {
    //   title: "Product Categories",
    //   message: "Welcome to the Product Categories!",
    //   //respdata: parentCategories,
    // });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching unique parent details.",
      error: error.message,
    });
  }
}



exports.getSubCategoriesWithMatchingParentId = async function (req, res, next) {
  try {
    const id = req.params.id;
    const categoriesWithMatchingParentId = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'matchedCategories',
        },
      },
      {
        $unwind: '$matchedCategories'
      },
      {
        $match: {
          'matchedCategories.parent_id': mongoose.Types.ObjectId(id)
          ,
          'approval_status': 1,
        },
      },
      {
        $group: {
          _id: '$matchedCategories._id',
          name: { $first: '$matchedCategories.name' },
          description: { $first: '$matchedCategories.description' },
          images: { $first: '$matchedCategories.image' },
          product_ids: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          product_ids: 1,
        },
      },
    ]);
    if (!categoriesWithMatchingParentId || categoriesWithMatchingParentId.length === 0) {
      return res.status(404).json({
        status: '0',
        message: 'No sub categories found matching the criteria.',
        respdata: {},
      });
    }
    res.render("webpages/productsubcategories", {
      title: "Product Sub Categories",
      message: "Welcome to the Product Sub Categories!",
      respdata: categoriesWithMatchingParentId,


    });
  } catch (error) {
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching sub categories with matching parent_id.',
      error: error.message,
    });
  }
};
async function getProductDataWithSort(id, sortid, page, pageSize) {
  try {
    let categoryId;
    let sortCriteria = {};

    if (sortid == 0) {
      sortCriteria = { offer_price: 1 };
    } else if (sortid == 1) {
      sortCriteria = { offer_price: -1 };
    } else {
      sortCriteria = { offer_price: 1 };
    }

    const skip = (page - 1) * pageSize;

    let userproducts = [];
    let count = [];
    if (id === "whatshot") {
      userproducts = await Userproduct.find({
        approval_status: 1,
        flag: 0
      })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .sort([sortCriteria, { hitCount: -1 }])
        .exec();

      count = await Userproduct.countDocuments({
        approval_status: 1,
        flag: 0
      });

    } else if (id === "justsold") {
      userproducts = await Userproduct.find({
        approval_status: 1,
        flag: 1
      })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .sort(sortCriteria)
        .exec();

      count = await Userproduct.countDocuments({
        approval_status: 1,
        flag: 1
      });

    } else if (id === "bestDeal") {
      const appSettings = await Appsettings.findOne();
      const percentageFilter = parseInt(appSettings.best_deal);

      userproducts = await Userproduct.find({
        percentage: { $gte: percentageFilter },
        approval_status: 1,
        flag: 0
      })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .sort(sortCriteria)
        .exec();

      count = await Userproduct.countDocuments({
        percentage: { $gte: percentageFilter },
        approval_status: 1,
        flag: 0
      });

    } else {
      categoryId = id;

      userproducts = await Userproduct.find({
        category_id: categoryId,
        approval_status: 1,
        flag: 0
      })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .sort(sortCriteria)
        .exec();

      count = await Userproduct.countDocuments({
        category_id: categoryId,
        approval_status: 1,
        flag: 0
      });
    }
    const formattedUserProducts = [];
    for (const userproduct of userproducts) {
      const productImages = await Productimage.find({ product_id: userproduct._id });
      const productCondition = await Productcondition.findById(userproduct.status);
      const formattedUserProduct = {
        _id: userproduct._id,
        name: userproduct.name,
        description: userproduct.description,
        category: userproduct.category_id ? userproduct.category_id.name : '',
        brand: userproduct.brand_id ? userproduct.brand_id.name : '',
        user_id: userproduct.user_id ? userproduct.user_id._id : '',
        user_name: userproduct.user_id ? userproduct.user_id.name : '',
        size_id: userproduct.size_id ? userproduct.size_id.name : '',
        price: userproduct.price,
        offer_price: userproduct.offer_price,
        percentage: userproduct.percentage,
        status: userproduct.status,
        flag: userproduct.flag,
        approval_status: userproduct.approval_status,
        added_dtime: userproduct.added_dtime,
        __v: userproduct.__v,
        product_images: (typeof productImages != "undefined") ? productImages: "",
        status_name: productCondition ? productCondition.name : '',
      };
      formattedUserProducts.push(formattedUserProduct);
    }
    const paginatedData = formattedUserProducts.slice(skip, skip + pageSize);
    const productCount = formattedUserProducts.length;
    const totalPages = Math.ceil(productCount / pageSize);
    const currentPage = parseInt(page);
    return {
      status: '1',
      productCount: productCount,
      totalPages: totalPages,
      currentPage: currentPage,
      count: count,
      message: 'Success',
      respdata: paginatedData,
    };
  } catch (error) {
    return {
      status: '0',
      message: 'An error occurred while fetching products with matching parent_id.',
      error: error.message,
    };
  }
}
exports.getSubCategoriesProducts = async function (page, req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    let brandIds = [];
    let sizeIds = [];
    let statusIds = [];
    let brandList = [];
    let sizeList = [];
    let result;
    let conditionList = [];
    const id = req.params.id;
    const pageno = page || 1;
    const pageSize = 8;
    const sortid = req.params.sortid || 0;
    const data = await getProductDataWithSort(id, sortid, pageno, pageSize);
    const productCount = data.count;
    const formattedUserProducts = data.respdata;
    const filterproductCount = formattedUserProducts.length;
    const totalPages = data.totalPages;
    const currentPage = data.currentPage;
    const categoryName = await Category.find({ _id: id }).populate('name');
    const userProducts = await Userproduct.find({
        category_id: id,
        approval_status: 1,
        flag: 0,
      })
        .select('brand_id size_id status'); 
    if(userProducts.length > 0) {
      result = await Userproduct.aggregate([
        {
          $match: {
            category_id: mongoose.Types.ObjectId(id),
            approval_status: 1,
            flag: 0
          }
        },
        {
          $group: {
            _id: id,
            maxPrice: { $max: "$offer_price" },
            minPrice: { $min: "$offer_price" }
          }
        }
      ]);
      brandIds = userProducts.map(product => product.brand_id).filter(Boolean);
      sizeIds = userProducts.map(product => product.size_id).filter(Boolean);
      statusIds = userProducts.map(product => product.status).filter(Boolean);
      brandList = await brandModel.find({ _id: { $in: brandIds } });
      sizeList = await sizeModel.find({ _id: { $in: sizeIds } });
      conditionList = await productconditionModel.find({ _id: { $in: statusIds } });
      genderList = await Gender.find();
      // genderIds = userProducts.map(product => product.gender_id).filter(Boolean);
      // genderList = await Gender.find({ _id: { $in: genderIds } });
    }
    
    res.render("webpages/subcategoryproduct", {
      title: "Product Sub Categories",
      message: "Welcome to the Product Sub Categories!",
      websiteUrl: process.env.SITE_URL,
      isLoggedIn: isLoggedIn,
      categoryName: categoryName,
      brandList: typeof brandList != "undefined" ? brandList : [],
      sizeList: typeof sizeList != "undefined" ? sizeList : [],
      conditionList: typeof conditionList != "undefined" ? conditionList : [],
      genderList: typeof genderList != "undefined" ? genderList : [],
      maxvalue: typeof result != "undefined" ? result[0].maxPrice : "0",
      minvalue: typeof result != "undefined" ? result[0].minPrice : "0",
      filterproductCount: typeof filterproductCount != "undefined" ? filterproductCount : "0",
      productCount: typeof productCount != "undefined" ? productCount : "",
      respdata: typeof formattedUserProducts != "undefined" ? formattedUserProducts : "",
      product_category_id: id,
      totalPages: totalPages,
      currentPage: currentPage,
      pageSize: pageSize,
    });

  }
  catch (error) {
    return {
      status: '0',
      message: 'An error occurred while fetching products with matching parent_id.',
      error: error.message,
    };
  }
};
exports.getSubCategoriesProductswithSort = async function (page, req, res, next) {

  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  const id = req.params.id;
  const sortid = req.params.sortid || 0;
  const pageno = page || 1;
  const pageSize = 8;
  const data = await getProductDataWithSort(id, sortid, pageno, pageSize);
  const formattedUserProducts = data.respdata;
  const productCount = formattedUserProducts.length;
  return res.json({
    status: '1',
    message: 'Success',
    websiteUrl: process.env.SITE_URL,
    respdata: formattedUserProducts,
    productCount: productCount,
    isLoggedIn: isLoggedIn
  });

};
exports.userUpdate = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const user = await Users.findOne({ _id: req.body.userId });

    if (!user) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }
    const updData = {
      name: req.body.name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      created_dtime: dateTime,
    };
    const updatedUser = await Users.findOneAndUpdate(
      { _id: user._id },
      { $set: updData },
      { upsert: true, new: true }
    );
    if (!updatedUser) {
      return res.status(500).json({
        status: "0",
        message: "Failed to update user!",
        respdata: {},
      });
    }
    req.session.user.name = updatedUser.name;
    req.session.user.email = updatedUser.email;
    req.session.user.phone_no = updatedUser.phone_no;
    res.redirect("/my-account");
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.userNewCheckOutAddressAdd = async function (req, res, next) {
  try {
    const addr_name = req.body.addrType;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
    const newAddress = new addressBook({
      user_id: req.body.userId ? req.body.userId : req.session.user.userId,
      street_name: req.body.address2,
      address1: req.body.address1,
      landmark: req.body.landmark,
      city_name: req.body.city_name,
      city_code: req.body.city_code,
      state_name: req.body.state_name,
      state_code: req.body.state_code,
      pin_code: req.body.pin_code,
      address_name: addr_name,
      flag: req.body.flag,
      created_dtime: dateTime,
    });
    const savedAddress = await newAddress.save();
    const user = await Users.findById(newAddress.user_id);
    const randomSuffix = Math.floor(Math.random() * 1000);
    const pickupLocation = savedAddress.address_name + ' - ' + user.name + ' - ' + randomSuffix;
    const PickupData = {
      pickup_location: pickupLocation,
      name: user.name,
      email: user.email,
      phone: user.phone_no,
      address: savedAddress.street_name + ',' + savedAddress.address1,
      address_2: savedAddress.landmark,
      city: savedAddress.city_name,
      state: savedAddress.state_name,
      country: "India",
      pin_code: savedAddress.pin_code
    };
    const shiprocketResponse = await generateSellerPickup(PickupData);
    if (shiprocketResponse) {
      savedAddress.shiprocket_address = pickupLocation;
      savedAddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
      await savedAddress.save();
      res.redirect('/checkout-web');
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }

};

exports.userAddressAdd = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const addr_name = req.body.addrType;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
    const newAddress = new addressBook({
      user_id: req.body.userId,
      street_name: req.body.address2,
      address1: req.body.address1,
      landmark: req.body.landmark,
      city_name: req.body.city_name,
      city_code: req.body.city_code,
      state_name: req.body.state_name,
      state_code: req.body.state_code,
      pin_code: req.body.pin_code,
      address_name: addr_name,
      flag: req.body.flag,
      created_dtime: dateTime,
    });
    const savedAddress = await newAddress.save();
    const user = await Users.findById(newAddress.user_id);
    const randomSuffix = Math.floor(Math.random() * 1000);
    const pickupLocation = savedAddress.address_name + ' - ' + user.name + ' - ' + randomSuffix;
    const PickupData = {
      pickup_location: pickupLocation,
      name: user.name,
      email: user.email,
      phone: user.phone_no,
      address: savedAddress.street_name + ',' + savedAddress.address1,
      address_2: savedAddress.landmark,
      city: savedAddress.city_name,
      state: savedAddress.state_name,
      country: "India",
      pin_code: savedAddress.pin_code
    };
    const shiprocketResponse = await generateSellerPickup(PickupData);
    if (shiprocketResponse) {
      savedAddress.shiprocket_address = pickupLocation;
      savedAddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
      await savedAddress.save();
      res.redirect('/my-account');
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};


exports.updateuserAddressAdd = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    addbook_id = req.body.addressid;
    const updatedAddress = await addressBook.findOneAndUpdate(
      { _id: addbook_id },
      { $set: { default_status: 1 } },
      { new: true }
    );
    const addr_name = req.body.addrType;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }
    const newAddress = new addressBook({
      user_id: req.body.userId,
      street_name: req.body.address2,
      address1: req.body.address1,
      landmark: req.body.landmark,
      city_name: req.body.city_name,
      city_code: req.body.city_code,
      state_name: req.body.state_name,
      state_code: req.body.state_code,
      pin_code: req.body.pin_code,
      address_name: addr_name,
      flag: req.body.flag,
      created_dtime: dateTime,
    });
    const savedAddress = await newAddress.save();
    const user = await Users.findById(newAddress.user_id);
    const randomSuffix = Math.floor(Math.random() * 1000);
    const pickupLocation = savedAddress.address_name + ' - ' + user.name + ' - ' + randomSuffix;
    const PickupData = {
      pickup_location: pickupLocation,
      name: user.name,
      email: user.email,
      phone: user.phone_no,
      address: savedAddress.street_name + ',' + savedAddress.address1,
      address_2: savedAddress.landmark,
      city: savedAddress.city_name,
      state: savedAddress.state_name,
      country: "India",
      pin_code: savedAddress.pin_code
    };
    const shiprocketResponse = await generateSellerPickup(PickupData);
    if (shiprocketResponse) {
      savedAddress.shiprocket_address = pickupLocation;
      savedAddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
      await savedAddress.save();
      res.redirect('/my-account');
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

exports.getAddressdetails = async function (req, res, next) {
  //console.log('req.body:', req.body);
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    var userData = req.session.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    addbook_id = req.params.id;

    const address = await addressBook.findById(addbook_id);

    if (!address) {
      return res.status(404).json({
        status: "0",
        message: "Address not found!",
        respdata: {},
      });
    }

      res.render("webpages/update-address", {
        title: "My Account",
        message: "Address fetched successfully!",
        respdata: req.session.user,
        respdata1: userData,
        address: address,
        isLoggedIn: isLoggedIn,
      });

    // res.status(200).json({
    //   status: "1",
    //   message: "Address fetched successfully!",
    //   respdata: address,
    // });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};
exports.deleteUserAddress = async function (req, res, next) {
  try {
    addbook_id = req.params.id;
    const updatedAddress = await addressBook.findOneAndUpdate(
      { _id: addbook_id },
      { $set: { default_status: 1 } },
      { new: true }
    );
    if (!updatedAddress) {
      return res.status(404).json({
        status: "0",
        message: "Address not found for deletion!",
        respdata: {},
      });
    }
    res.redirect('/my-account');
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.userWisePost = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    var userData = req.session.user;
    const userproducts = await Userproduct.find({ user_id: req.params.id })
      .populate('brand_id', 'name', { optional: true })
      .populate('category_id', 'name', { optional: true })
      .populate('user_id', 'name', { optional: true })
      .populate('size_id', 'name', { optional: true })
      .exec();
    const formattedUserProducts = [];
    for (const userproduct of userproducts) {
      const productImages = await Productimage.find({ product_id: userproduct._id });
      const formattedUserProduct = {
        _id: userproduct._id,
        name: userproduct.name,
        description: userproduct.description,
        brand: userproduct.brand_id ? userproduct.brand_id.name : '',
        user_id: userproduct.user_id._id,
        user_name: userproduct.user_id.name,
        size_id: userproduct.size_id ? userproduct.size_id.name : '',
        price: userproduct.price,
        offer_price: userproduct.offer_price,
        percentage: userproduct.percentage,
        status: userproduct.status,
        flag: userproduct.flag,
        approval_status: userproduct.approval_status,
        original_invoice: userproduct.original_invoice,
        original_packaging: userproduct.original_packaging,
        added_dtime: userproduct.added_dtime,
        __v: userproduct.__v,
        product_images: productImages,
      };
      formattedUserProducts.push(formattedUserProduct);
    }
    if (formattedUserProducts) {
      res.render("webpages/mypost", {
        title: "My Post",
        message: "Welcome to the My Post page!",
        respdata: formattedUserProducts,
        userData: req.session.user,
        isLoggedIn: isLoggedIn,
        websiteUrl: process.env.SITE_URL,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

exports.addPostView = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    if (isLoggedIn == "") {
      res.redirect("/registration");
    }
    const productConditions = await Productcondition.find();
    const parentCategoryId = "650444488501422c8bf24bdb";
    const categoriesWithoutParentId = await Category.find({ parent_id: { $ne: parentCategoryId } });
    const genderList = await Gender.find();
    res.render("webpages/addmypost", {
      title: "My Account",
      message: "Welcome to the Add Post page!",
      respdata: req.session.user,
      productcondition: productConditions,
      subcate: categoriesWithoutParentId,
      genderList: genderList,
      isLoggedIn: isLoggedIn,
      websiteUrl: process.env.SITE_URL,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.addNewPost = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
    let invoice;
    let packaging;
    let gender;
    if (req.body.original_invoice == 'on' || req.body.original_invoice != '') {
      invoice = '1';
    }
    else {
      invoice = '0';
    }
    if (req.body.original_packaging == 'on' || req.body.original_packaging != '') {
      packaging = '1';
    }
    else {
      packaging = '0';
    }
    if (req.body.gender) {
      gender = req.body.gender;
    }
    else {
      gender = '';
    }
    const newProduct = new Userproduct({
      category: req.body.product_cate,
      user_id: req.session.user.userId,
      brand: req.body.brand,
      height: req.body.height,
      weight: req.body.weight,
      length: req.body.length,
      breath: req.body.breath,
      size: req.body.size,
      name: req.body.name,
      description: req.body.description,
      status: req.body.product_condition,
      price: req.body.price,
      offer_price: req.body.offer_price,
      reseller_price: req.body.reseller_price,
      percentage: req.body.percentage,
      original_invoice: invoice,
      original_packaging: packaging,
      gender_id: gender,
      added_dtime: moment().tz('Asia/Kolkata').format("YYYY-MM-DD HH:mm:ss"),
    });
    const savedProductdata = await newProduct.save();
    const requrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      const imageDetails = [];
      req.files.forEach(async (file) => {
        const imageUrl = file.filename;
         let extension = path.extname(imageUrl);
            if(typeof extension != "undefined" && extension != "webp" && extension != "WEBP"){
              await CompressImage("./public/images/"+imageUrl,"./public/compress_images/");
            } else
            {
              await fs.copyFile("./public/images/"+imageUrl, "./public/compress_images/"+imageUrl, (err) => {
                if (err) {
                    console.log("Error Found:", err);
                }
                else {
                    console.log("File copied successfully!");
                }
              });
            }
        const productimageDetail = new Productimage({
          product_id: savedProductdata._id,
          user_id: req.session.user.userId,
          image: imageUrl,
          added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
        const savedImage = productimageDetail.save();
      });
    }
    res.redirect('/my-account');
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Add Post.",
      error: error.message,
    });
  }
};

exports.editUserWisePost = async function (req, res, next) {

  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    const productConditions = await Productcondition.find();

    const parentCategoryId = "650444488501422c8bf24bdb";
    const categoriesWithoutParentId = await Category.find({ parent_id: { $ne: parentCategoryId } });
    const brands = await Brand.find({ status: 1 });
    const productsize = await Size.find();

    const productId = req.params.id;
    const product = await Userproduct.findById(productId);
    const genderList = await Gender.find();

    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    const productImages = await Productimage.find({ product_id: req.params.id });

    const productDetails = {
      ...product.toObject(),
      images: productImages,
    };

    res.render("webpages/editmypost", {
      title: "My Post",
      message: "Welcome to the My Post page!",
      respdata: productDetails,
      userData: req.session.user,
      productcondition: productConditions,
      subcate: categoriesWithoutParentId,
      productId: productId,
      brands: brands,
      productsize: productsize,
      genderList: genderList,
      isLoggedIn: isLoggedIn,
      websiteUrl: process.env.SITE_URL,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};
exports.updatePostData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
    const productId = req.body.productid;
    const existingProduct = await Userproduct.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }
    existingProduct.category_id = req.body.category_id || existingProduct.category_id;
    existingProduct.user_id = req.body.user_id || existingProduct.user_id;
    if (req.body.brand) {
      existingProduct.brand = ((req.body.brand || existingProduct.brand) ?? null);
    }
    if (req.body.size) {
      existingProduct.size = ((req.body.size || existingProduct.size) ?? null);
    }
    existingProduct.brand_id = ((req.body.brand_id || existingProduct.brand_id) ?? null);
    existingProduct.size_id = ((req.body.size_id || existingProduct.size_id) ?? null);
    existingProduct.name = req.body.name || existingProduct.name;
    existingProduct.description = req.body.description || existingProduct.description;
    existingProduct.status = req.body.status || existingProduct.status;
    existingProduct.price = req.body.price || existingProduct.price;
    existingProduct.offer_price = req.body.offer_price || existingProduct.offer_price;
    existingProduct.percentage = req.body.percentage || existingProduct.percentage;
    existingProduct.gender_id = req.body.gender || existingProduct.gender_id;
    const newProduct = new Userproduct({
      category_id: req.body.category_id,
      user_id: req.body.user_id,
      brand: req.body.brand,
      size: req.body.size,
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      price: req.body.price,
      offer_price: req.body.offerprice,
      reseller_price: req.body.reseller_price,
      percentage: req.body.percentage,
      original_invoice: req.body.original_invoice,
      original_packaging: req.body.original_packaging,
      added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    existingProduct.updated_dtime = moment().format("YYYY-MM-DD HH:mm:ss");
    // if (req.files && req.files.length > 0) {

    //   // await Productimage.deleteMany({ product_id: existingProduct._id });

    //   const imageUrls = [];
    //   const requrl = url.format({
    //     protocol: req.protocol,
    //     host: req.get("host"),
    //   });

    //   for (const file of req.files) {
    //     const imageUrl = requrl + "/public/images/" + file.filename;

    //     const productImageDetail = new Productimage({
    //       product_id: existingProduct._id,
    //       category_id: existingProduct.category_id,
    //       user_id: existingProduct.user_id,
    //       brand_id: existingProduct.brand_id,
    //       image: imageUrl,
    //       added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     });

    //     const savedImage = await productImageDetail.save();
    //   }
    // }

     const previousImages = await Productimage.find({ product_id: existingProduct._id });
     //for (const image of previousImages) {
      //  const imagePath = path.resolve(__dirname,'../../../public/compress_images/'+image.image);
      //  const imagePathreal = path.resolve(__dirname,'../../../public/images/'+image.image);
      //     if (fs.existsSync(imagePath)) {
      //         fs.unlinkSync(imagePath);
      //     }
      //     if (fs.existsSync(imagePathreal)) {
      //         fs.unlinkSync(imagePathreal);
      //     }
      //   await Productimage.findByIdAndDelete(image._id);
      // }
 
    if (req.files && Object.keys(req.files).length > 0) {
      const requrl = url.format({
        protocol: req.protocol,
        host: req.get("host"),
      });
      for (const fieldName in req.files) {
        const files = req.files[fieldName];
        for (const file of files) {
          const imageUrl = file.filename;
          let extension = path.extname(imageUrl);
             if(typeof extension != "undefined" && extension != "webp" && extension != "WEBP"){
               await CompressImage("./public/images/"+imageUrl,"./public/compress_images/");
             }
             else
             {
               await fs.copyFile("./public/images/"+imageUrl, "./public/compress_images/"+imageUrl, (err) => {
                 if (err) {
                     console.log("Error Found:", err);
                 }
                 else {
                     console.log("File copied successfully!");
                 }
               });
             }
          const productImageDetail = new Productimage({
            product_id: existingProduct._id,
            category_id: existingProduct.category_id,
            user_id: existingProduct.user_id,
            brand_id: existingProduct.brand_id,
            image: imageUrl,
            added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
          });
          await productImageDetail.save();
        }
      }
    }
    const updatedProduct = await existingProduct.save();
    const productImages = await Productimage.find({ product_id: updatedProduct._id });
    const productDetails = {
      ...updatedProduct.toObject(),
      images: productImages,
    };
    res.redirect('/my-account');
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Add Post.",
      error: error.message,
    });
  }
};

exports.signOut = async function (req, res, next) {
  //const banner = await Banner.find({ status: 1 });
  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  if (isLoggedIn != '') {
    Users.findOne({ _id: req.session.user.userId }).then((user) => {
      if (!user)
        res.status(404).json({
          status: "0",
          message: "User not found!",
          respdata: {},
        });
      else {
        var updData = {
          token: "na",
          last_logout: dateTime,
        };
        Users.findOneAndUpdate(
          { _id: req.session.user.userId },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              req.session.destroy((err) => {
                if (err) {
                  res.status(500).json({
                    status: "error",
                    message: "Error logging out",
                    respdata: {},
                  });
                }
                res.status(200).json({
                  status: "success",
                  message: "Sign out!",
                });
                // Session destroyed, redirect or render logout success message
                // res.render("webpages/list", {
                //   title: "Wish List Page",
                //   message: "Successfully logged out!",
                //   isLoggedIn: isLoggedIn,
                //   banner: banner,
                // });
              });
            }
          }
        );
      }
    });
  }
  else {
    res.status(200).json({
      status: "error",
      message: "Unable to logout at this moment.",

    });
  }
};

exports.addToWishlistWeb = async function (req, res, next) {
  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
    const user_id = req.session.user.userId;
    const product_id = req.params.id;
    const status = 0;
    const existingList = await Wishlist.findOne({ user_id, product_id, status: 0 });
    if (existingList) {
      return res.status(200).json({
        message: 'The product has been already added to your wishlist.',
        wishlist: existingList,
        success: true,
        is_wishlisted: true
      });
    }
    else {
      console.log("helllo");
      const user = await Users.findOne({ _id: user_id });
      const product = await Userproduct.findOne({ _id: product_id }).populate('category_id', 'name');
      const newFavList = new Wishlist({
        user_id,
        product_id,
        status,
        added_dtime: new Date(),
      });
      const savedFavData = await newFavList.save();

      const requestUrl = req.headers.referer;

      await insertNotification(
        'Wishlist Notification',
        `Item ${product.name} added to wishlist by ${user.name}`,
        user_id,
        requestUrl,
        new Date()
      );

      return res.status(200).json({
        message: 'The product has been added to your wishlist',
        success: true,
        is_wishlisted: true
      });
    }
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      success: false,
      is_wishlisted: false,
      message: "An error occurred while rendering Wishlist.",
      error: error.message,
    });
  }
};
exports.viewWishListByUserId = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    if (isLoggedIn == "") {
      res.redirect("/registration");
    }

    const user_id = req.session.user.userId;
    const existingList = await Wishlist.find({ user_id: isLoggedIn })
      .populate('user_id', 'name')
      .exec();

    if (existingList.length === 0) {
      res.render("webpages/wishlist", {
        title: "Wish List Page",
        message: "Welcome to the Wish List page!",
        respdata: [],
        isLoggedIn: isLoggedIn,
        itemCount: 0,
        websiteUrl: process.env.SITE_URL,
      });
    } else {
      const formattedList = await Promise.all(existingList.map(async (item) => {
        const product = await Userproduct.findOne({ _id: item.product_id }).populate('category_id', 'name');
        if (product) {
          const productImages = await Productimage.find({ product_id: item.product_id }).limit(1);
          const date = moment(item.added_dtime, 'YYYY-MM-DDTHH:mm:ssZ');
          const addedDate = date.format('DD/MM/YYYY');
          const category_name = product.category_id ? product.category_id.name : 'Uncategorized';
          return {
            _id: item._id,
            user_id: item.user_id._id,
            user_name: item.user_id.name,
            product_id: item.product_id,
            product_name: product.name,
            product_price: product.price,
            category_name: product.category_id ? product.category_id.name : '',
            images: productImages[0].image,
            status: item.status,
            added_dtime: addedDate,
            __v: item.__v,
          };
        }
      }));
      const count = formattedList.length;
      res.render("webpages/wishlist", {
        title: "Wish List Page",
        message: "Welcome to the Wish List page!",
        respdata: formattedList,
        isLoggedIn: isLoggedIn,
        itemCount: formattedList.length,
        websiteUrl: process.env.SITE_URL,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering Wishlist Listing Page.",
      error: error.message,
    });
  }
};
exports.removeWishlistWeb = async (req, res) => {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const product_id = req.params.id;
    const user_id = req.session.user.userId;
    const existingList = await Wishlist.findOne({ user_id, product_id });
    if (Object.keys(existingList).length == 0) {
      return res.status(404).json({
        message: 'Product is not found in the Wishlist',
        success: false,
        count: count
      });
    }
    else {
      await existingList.remove();
      const count = await Wishlist.countDocuments({ user_id });
      return res.status(200).json({
        message: 'The product has been removed from your wishlist',
        success: true,
        count: count
      });
    }
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      success: false,
      is_wishlisted: false,
      message: "An error occurred while rendering Wishlist.",
      error: error.message,
    });
  }

};

exports.addToCart = async function (req, res, next) {
  try {
    var userData = req.session.user;
    var qty = '1';
    const product_id = req.params.id;
    const user_id = req.session.user.userId;
    const existingCart = await Cart.findOne({ user_id: user_id, status: 0 });
    if (existingCart) {
      const existingCartItem = await CartDetail.findOne({
        cart_id: existingCart._id
      });

      if (existingCartItem) {
        existingCartItem.product_id = product_id;
        existingCartItem.qty = parseInt(qty);
        await existingCartItem.save();
      } else {

        const cartDetail = new CartDetail({
          cart_id: existingCart._id,
          product_id,
          qty,
          check_status: 0,
          status: 0,
          added_dtime: dateTime,
        });
        await cartDetail.save();
      }
      const user = await Users.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const product = await Userproduct.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const cartResponse = {
        _id: existingCart._id,
        user_id: existingCart.user_id,
        status: existingCart.status,
        check_status: existingCartItem.check_status,
        qty: existingCartItem.qty,
        user_name: user.name,
        product_name: product.name,
        added_dtime: existingCart.added_dtime,
        __v: existingCart.__v,
      };
      setTimeout(() => {
        removeItemAfterTime(existingCart._id);
      }, 20 * 60 * 1000);
      return res.status(200).json({
        message: 'Item Added to Cart',
        cart: cartResponse,
      });
    }
    else {
      const newCart = new Cart({
        user_id,
        status: 0,
        added_dtime: dateTime,
      });
      const savedCart = await newCart.save();
      const cartDetail = new CartDetail({
        cart_id: savedCart._id,
        product_id,
        qty,
        check_status: 0,
        status: 0,
        added_dtime: dateTime,
      });
      const savedata = await cartDetail.save();
      var cartCount = await Cart.countDocuments({ user_id: savedCart.user_id });
      const user = await Users.findById(user_id);
      const product = await Userproduct.findById(product_id);
      const cartResponse = {
        _id: savedCart._id,
        user_id: savedCart.user_id,
        status: savedCart.status,
        check_status: cartDetail.check_status,
        qty: cartDetail.qty,
        user_name: user.name,
        product_name: product.name,
        product_user_id: product.user_id,
        added_dtime: savedCart.added_dtime,
        __v: savedCart.__v,
      };
      const cartRemove = await Cartremove.findOne({}, { name: 1, _id: 0 });
      const durationInSeconds = cartRemove.name;
      const durationInMilliseconds = durationInSeconds * 60 * 1000;
      setTimeout(() => {
        removeItemAfterTime(savedCart._id);
      }, durationInMilliseconds);
      res.status(200).json({
        cart_count: cartCount,
        message: 'Item Added to Cart',
        cart: cartResponse,
        is_added: true
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

const removeItemAfterTime = async (cartId) => {
  try {
    await Cart.findByIdAndDelete(cartId);
    const cartItems = await CartDetail.find({ cart_id: cartId, status: 0 });
    for (const cartItem of cartItems) {
      await CartDetail.findByIdAndDelete(cartItem._id);
    }
  } catch (error) {
  }
};
exports.viewCartListByUserId = async function (req, res, next) {
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    if (isLoggedIn == "") {
      return res.redirect("/registration");
    }
    const user_id = req.session.user.userId;
    const existingCart = await Cart.findOne({ user_id, status: 0 });
    if (!existingCart) {
      res.render("webpages/addtocart", {
        title: "Cart List Page",
        message: "Cart is empty",
        respdata: [],
        respdata1: [],
        user: user_id,
        isLoggedIn: isLoggedIn,
        websiteUrl: process.env.SITE_URL,
      });
    }
    else {
      const cartList = await CartDetail.find({ cart_id: existingCart._id, status: 0 })
        .populate({
          path: 'product_id',
          model: Userproduct,
          select: 'name images',
        })
        .exec();
      const user = await Users.findById(existingCart.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const formattedCartList = await Promise.all(cartList.map(async (cartItem) => {
        const product = await Userproduct.findOne({ _id: cartItem.product_id._id }).populate('category_id', 'name');
        const productImages = await Productimage.find({ product_id: cartItem.product_id._id }).limit(1);
        const finalData = {
          _id: cartItem._id,
          cart_id: existingCart._id,
          quantity: cartItem.qty,
          product_id: cartItem.product_id._id,
          product_name: cartItem.product_id.name,
          product_price: product.offer_price,
          product_est_price: product.price,
          seller_id: product.user_id,
          category_name: product.category_id.name,
          images: productImages.length > 0 ? productImages[0].image : null,
          user_name: user.name,
          added_dtime: cartItem.added_dtime,
          status: cartItem.status,
        };
        const product_price = finalData.product_price;
        const gst = (product_price * 18) / 100;
        const finalPrice = parseInt(product_price) + 250 + parseInt(gst);
        res.render("webpages/addtocart", {
          title: "Cart List Page",
          message: "Welcome to the Cart List page!",
          respdata: finalData,
          respdata1: finalPrice,
          user: user_id,
          isLoggedIn: isLoggedIn,
          websiteUrl: process.env.SITE_URL,
        });
      }));
    }
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering Cart List.",
      error: error.message,
    });
  }
};
exports.deleteCart = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const user_id = req.session.user.userId;
    const existingCart = await Cart.findOne({ user_id, status: 0 });
    if (!existingCart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }
    const cartDetail = await CartDetail.findOne({
      cart_id: existingCart._id,
      status: 0,
    });

    if (!cartDetail) {
      return res.status(404).json({
        message: 'Product not found in cart',
      });
    }
    await cartDetail.remove();
    const cartDetailsCount = await CartDetail.countDocuments({ cart_id: existingCart._id });
    if (cartDetailsCount === 0) {
      await existingCart.remove();
    }
    res.render("webpages/deletecart", {
      title: "Delete Cart",
      message: "Welcome to the Delete Cart page!",
      isLoggedIn: isLoggedIn,
    });
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Cart Page.",
      error: error.message,
    });
  }
};

exports.changeProfileImgWeb = async function (req, res, next) {
  try {
    const requrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      const imageDetails = [];
      req.files.forEach(async (file) => {
        // const imageUrl = requrl + "/public/images/" + file.filename;
        const imageUrl = file.filename;
        let extension = path.extname(imageUrl);
           if(typeof extension != "undefined" && extension != "webp" && extension != "WEBP"){
             await CompressImage("./public/images/"+imageUrl,"./public/compress_images/");
           } else
           {
             await fs.copyFile("./public/images/"+imageUrl, "./public/compress_images/"+imageUrl, (err) => {
               if (err) {
                   console.log("Error Found:", err);
               }
               else {
                   console.log("File copied successfully!");
               }
             });
           }
        const updData = {
          image: imageUrl,
        };
        const updatedUser = await Users.findOneAndUpdate(
          { _id: req.body.user_id },
          { $set: updData },
          { upsert: true, new: true }
        );
        if (updatedUser) {
          req.session.user.image = updatedUser.image;
          res.redirect('/my-account');
        }
      });
    }
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while Profile Image Change.",
      error: error.message,
    });
  }
};
exports.checkoutWeb = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    if (isLoggedIn == "") {
      return res.redirect("/registration");
    }
    const user_id = req.session.user.userId;
    const existingCart = await Cart.findOne({ user_id, status: 0 });
    if (!existingCart) {
      res.render("webpages/addtocart", {
        title: "Cart List Page",
        message: "Cart is empty",
        respdata: [],
        respdata1: [],
        user: user_id,
        isLoggedIn: isLoggedIn,
      });
    } else {
      const cartList = await CartDetail.find({ cart_id: existingCart._id, status: 0 })
        .populate({
          path: 'product_id',
          model: Userproduct,
          select: 'name images',
        })
        .exec();
      // const addressUserList = await addressBook.find({user_id: user_id });
      const addressUserList = await addressBook.find({
        user_id: user_id,
        default_status: 0
      });
      const user = await Users.findById(existingCart.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const formattedCartList = await Promise.all(cartList.map(async (cartItem) => {
        const product = await Userproduct.findOne({ _id: cartItem.product_id._id }).populate('category_id', 'name');
        const productImages = await Productimage.find({ product_id: cartItem.product_id._id }).limit(1);
        const finalData = {
          _id: cartItem._id,
          cart_id: existingCart._id,
          quantity: cartItem.qty,
          product_id: cartItem.product_id._id,
          product_name: cartItem.product_id. name,
          product_price: product.offer_price,
          product_est_price: product.price,
          seller_id: product.user_id,
          category_name: product.category_id.name,
          images: productImages.length > 0 ? productImages[0].image : null,
          user_name: user.name,
          added_dtime: cartItem.added_dtime,
          status: cartItem.status,
        };
        // const requestUrl =  req.headers.referer;
        const requestUrl = '/web-my-order';

        await insertNotification(
          'Order Placed Successfully from Website',
          `Item ${cartItem.product_id.name} added to order list by ${user.name}`,
          user_id,
          requestUrl,
          new Date()
        );
        const product_price = finalData.product_price;
        const gst = (product_price * 28) / 100;
        const finalPrice = parseInt(product_price) + 250 + parseInt(gst);
        res.render("webpages/mycheckoutweb", {
          title: "Check Out Page",
          status: '1',
          is_orderPlaced: 1,
          message: "Welcome to the Checkout page!",
          respdata: finalData,
          product_price: product_price,
          finalPrice: finalPrice,
          gst: gst,
          product_id: finalData.product_id,
          isLoggedIn: isLoggedIn,
          user: req.session.user,
          addressUserList: addressUserList,
        });
      }));
    }
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred Checkout .",
      error: error.message,
    });
  }
};
exports.myOrderWeb = async (req, res) => {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/myorder", {
      title: "Wish List Page",
      message: "Welcome to the Wish List page!",
      respdata: typeof req.session.user != "undefined" ? req.session.user : null,
      isLoggedIn: isLoggedIn,
      websiteUrl: process.env.SITE_URL,
    });
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred My order .",
      error: error.message,
    });
  }
};
exports.myOrderDetailsWeb = async (req, res) => {
  try {
    const orderlistId = req.params.id;
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    if (!orderlistId) {
      return res.status(400).json({ message: 'Order ID is missing in the request' });
    }
    const order = await Order.findById(orderlistId)
      .populate('seller_id', 'name')
      .populate('user_id', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    let productId;
    if (order.product_id) {
      productId = order.product_id.toString();
    } else {
      return res.status(404).json({ message: 'Product ID not found for this order' });
    }

    const productDetails = await Userproduct.findById(productId);

    if (!productDetails) {
      return res.status(404).json({ message: 'Product details not found' });
    }

    const productImage = await Productimage.findOne({ product_id: productId }).limit(1);
    const orderTrackStatusOne = await Ordertracking.find({ orderlistId, status: 1 });

    let shiprocketResponse = [];
    let shiprocketResponselabel = [];
    let shiprocketResponseinvoice = [];
    let shiprocketResponsefortracking = [];

    //   if (orderTrackStatusOne && orderTrackStatusOne.length > 0)  {
    //     const trackingId = orderTrackStatusOne[0].tracking_id;
    //     const trackDetails = await Track.findById(trackingId);

    //     if(trackDetails.shiprocket_shipment_id)
    //     {

    //       shiprocketResponselabel = await generateLabel(trackDetails.shiprocket_shipment_id);

    //       shiprocketResponseinvoice = await generateInvoice(trackDetails.shiprocket_order_id);
    //     }

    //     if (trackDetails.shiprocket_shipment_id) {
    //       shiprocketResponse = await generateOrderDetails(trackDetails.shiprocket_order_id);
    //     }

    //     if (trackDetails.shiprocket_shipment_id) {
    //       shiprocketResponsefortracking = await trackbyaorderid(trackDetails.shiprocket_order_id);
    //     }
    // }
    const sellerAddress = await addressBook.findOne({ _id: order.billing_address_id });
    const buyerAddress = await addressBook.findOne({ _id: order.shipping_address_id });
    const shippingKitData = await Shippingkit.findOne({ order_id: order._id });
    let shippingkit_details;
    let shipping_user_details;
    if (shippingKitData) {
      shippingkit_details = await addressBook.findById({ _id: shippingKitData.shipping_address_id });
      shipping_user_details = await Users.findById({ _id: shippingKitData.buyer_id });
    }
    const orderDetails = {
      _id: order._id,
      total_price: order.total_price,
      payment_method: order.payment_method,
      pay_now: order.pay_now,
      remaining_amount: order.remaining_amount,
      order_status: order.order_status,
      delete_by: order.delete_by,
      delete_status: order.delete_status,
      gst: order.gst,
      seller: {
        _id: order.seller_id._id,
        name: order.seller_id.name,
      },
      buyeraddress: buyerAddress ? buyerAddress : 'No Buyer Address Found',
      user: {
        _id: order.user_id._id,
        name: order.user_id.name,
        phone_no: req.session.user.phone_no ? req.session.user.phone_no : '',
      },
      selleraddress: sellerAddress ? sellerAddress : 'No Buyer Address Found',
      product: {
        name: productDetails ? productDetails.name : 'Unknown Product',
        offer_price: productDetails ? productDetails.offer_price : 'Unknown Product',
        image: productImage ? productImage.image : 'No Image',
      },
      shippingKitData: shippingKitData || null,
      shippingkit_details: shippingkit_details || null,
      shipping_user_details: shipping_user_details || null
    };
    res.render("webpages/myorderdetails", {
      title: "Wish List Page",
      message: "Welcome to the Wish List page!",
      respdata: orderDetails,
      //respdata1: orderlistId,
      isLoggedIn: isLoggedIn,
      websiteUrl: process.env.SITE_URL,
    });
  }
  catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred My order .",
      error: error.message,
    });
  }
};
exports.addShipmentData = async (req, res) => {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const order_id = req.params.id;
    const price = 350;
    const gst = (price * 18) / 100;
    const final_price = price + gst;
    const track = await Ordertracking.findOne({ order_id: order_id }).exec();
    if (track == null) {
      return res.status(200).json({
        status: "0",
        message: 'Order Delivery Partner Not chosse yet',
        is_shippingkit: false,
      });
    }
    const hubaddress = await Track.findById(track.tracking_id)
      .populate('seller_id', 'name phone_no email')
      .populate('billing_address_id')
      .populate('hub_address_id');
    if (!hubaddress) {
      res.status(200).json({
        status: "0",
        message: 'Order Delivery Partnerss Not chosse yet',
        is_shippingkit: false,
      });
    }
    const orderCode = `BFSSHIPKIT${Date.now().toString()}`;
    const shippingkit = new Shippingkit({
      track_code: orderCode,
      buyer_id: hubaddress.seller_id._id,
      product_id: hubaddress.product_id,
      shipping_address_id: hubaddress.billing_address_id._id,
      order_id: order_id,
      total_price: final_price,
      payment_method: 1,
      added_dtime: new Date().toISOString(),
    });
    const savedOrder = await shippingkit.save();
    if (savedOrder) {
      const updatedTrack = await Track.findOneAndUpdate(
        { _id: track.tracking_id },
        { $set: { shippingkit_status: 1 } },
        { new: true }
      );
      const user = await Users.findById(savedOrder.buyer_id);
      res.status(200).json({
        status: "1",
        message: 'Shipping Kit Order placed successfully',
        success: true,
        is_shippingkit: true,
        order: savedOrder,
        isLoggedIn: isLoggedIn,
        websiteUrl: process.env.SITE_URL,
      });
    }
  } catch (error) {
    res.status(200).json({
      status: "0",
      message: 'Can not Order Shipping kit',
      is_shippingkit: false,
    });
  }
};
exports.getWhatsHotProductsweb = async function (req, res) {

  const page = parseInt(req.body.page) || 1; // Current page, default: 1

  const pageSize = parseInt(req.body.pageSize) || 10; // Items per page, default: 10


  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const hotProductsCount = await Userproduct.countDocuments({ approval_status: 1, flag: 0 });

    const totalPages = Math.ceil(hotProductsCount / pageSize);


    const brandList = await brandModel.find({});
    const sizeList = await sizeModel.find({});
    const conditionList = await productconditionModel.find({});

    const hotProducts = await Userproduct.find({ approval_status: 1, flag: 0 }).sort({ hitCount: -1 });

    const whatsHotProducts = [];

    for (const product of hotProducts) {

      const productImage = await Productimage.findOne({ product_id: product._id });

      if (productImage) {

        const productCondition = await Productcondition.findById(product.status);

        whatsHotProducts.push({

          _id: product._id,

          name: product.name,

          price: product.price,

          offer_price: product.offer_price,

          original_packaging: product.original_packaging,

          original_invoice: product.original_invoice,

          status_name: productCondition ? productCondition._id : '',

          status: productCondition ? productCondition.name : '',

          image: productImage,

        });

      }

    }

    res.render("webpages/allhomeproduct",
      {
        title: "Product Sub Categories",
        message: "Welcome to the Product Sub Categories!",
        respdata: whatsHotProducts,
        brandList: brandList,
        sizeList: sizeList,
        conditionList: conditionList,
        productCount: hotProductsCount,
        isLoggedIn: isLoggedIn,
        filter_basedon: "whatshot",
        websiteUrl: process.env.SITE_URL,
      });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });

  }

};


exports.getJustSoldProductsweb = async function (req, res) {

  const page = parseInt(req.query.page) || 1;

  const pageSize = parseInt(req.query.pageSize) || 10;



  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const soldItemsCount = await Userproduct.countDocuments({ approval_status: 1, flag: 1 });

    const totalPages = Math.ceil(soldItemsCount / pageSize);

    const brandList = await brandModel.find({});
    const sizeList = await sizeModel.find({});
    const conditionList = await productconditionModel.find({});
    const solditems = await Userproduct.find({ approval_status: 1, flag: 1 });
    const justSoldProducts = [];
    for (const product of solditems) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        justSoldProducts.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage,
        });
      }
    }
    res.render("webpages/allhomeproduct",
      {
        title: "Product Sub Categories",
        message: "Welcome to the Product Sub Categories!",
        respdata: justSoldProducts,
        brandList: brandList,
        sizeList: sizeList,
        conditionList: conditionList,
        productCount: soldItemsCount,
        isLoggedIn: isLoggedIn,
        filter_basedon: "justsold",
        websiteUrl: process.env.SITE_URL,
      });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }

};

exports.getBestDealProductsweb = async function (req, res) {

  const page = parseInt(req.query.page) || 1;

  const pageSize = parseInt(req.query.pageSize) || 10;

  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const soldItemsCount = await Userproduct.countDocuments({ approval_status: 1, flag: 1 });

    const totalPages = Math.ceil(soldItemsCount / pageSize);

    const brandList = await brandModel.find({});
    const sizeList = await sizeModel.find({});
    const conditionList = await productconditionModel.find({});


    const appSettings = await Appsettings.findOne();

    if (!appSettings) {
      return res.status(404).json({ message: 'App settings not found' });
    }
    const percentageFilter = parseInt(appSettings.best_deal);

    const count = await Userproduct.countDocuments({
      percentage: { $gte: percentageFilter },
      approval_status: 1,
      flag: 0
    });

    const products = await Userproduct.find({ percentage: { $gte: percentageFilter }, approval_status: 1, flag: 0 }); // Adding approval_status filter


    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products meet the percentage filter criteria' });
    }

    const bestDealProducts = [];

    for (const product of products) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {

        const productCondition = await Productcondition.findById(product.status);

        bestDealProducts.push({

          _id: product._id,

          name: product.name,

          price: product.price,

          offer_price: product.offer_price,

          original_packaging: product.original_packaging,

          original_invoice: product.original_invoice,

          status_name: productCondition ? productCondition._id : '',

          status: productCondition ? productCondition.name : '',

          image: productImage,

        });

      }

    }
    res.render("webpages/allhomeproduct",
      {
        title: "Product Sub Categories",
        message: "Welcome to the Product Sub Categories!",
        respdata: bestDealProducts,
        brandList: brandList,
        sizeList: sizeList,
        conditionList: conditionList,
        productCount: count,
        isLoggedIn: isLoggedIn,
        filter_basedon: "bestDeal"
      });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });

  }

};

exports.userPlacedOrder = async function (req, res) {

  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    let user_id = req.body.data.user_id;
    let seller_id = req.body.data.seller_id;
    let cart_id = req.body.data.cart_id;
    let product_id = req.body.data.product_id;
    let total_price = req.body.data.total_amt;
    let payment_method = req.body.data.payment_method;
    let gst = req.body.data.gst;
    let order_status = '0';
    let delivery_charges = '0';
    let discount = '0';
    let pickup_status = '0';
    let delivery_status = '0';
    let shipping_address_id = req.body.data.addressBookId;

    let pay_now = req.body.data.pay_now || null;
    let remaining_amount = req.body.data.remaining_amount || null;

    //Get Shipping Address id 
    // const shippingaddress = await addressBook.findOne({ user_id: seller_id });
    // if (!shippingaddress) {
    //   return res.status(404).json({ message: 'Shipping address not found' });
    // }
    // const shipping_address_id = shippingaddress._id;

    // Get Billing Address id
    // const productdetails = await Userproduct.findById(product_id);
    // if (!productdetails) {
    //   return res.status(404).json({ message: 'Billing address not found' });
    // }
    // const billing_address_id = productdetails.user_id;
    const billingaddress = await addressBook.findOne({ user_id: seller_id });

    if (!billingaddress) {
      return res.status(404).json({ message: 'Seller address not found' });
    }

    const billing_address_id = billingaddress._id;

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentSecond = now.getSeconds().toString().padStart(2, '0');
    const currentMillisecond = now.getMilliseconds().toString().padStart(3, '0');

    const orderCode = `BFSORD${currentHour}${currentMinute}${currentSecond}${currentMillisecond}`;
    const order = new Order({
      order_code: orderCode,
      user_id,
      cart_id,
      seller_id,
      product_id,
      billing_address_id,
      shipping_address_id,
      total_price,
      payment_method,
      order_status,
      gst,
      delivery_charges,
      discount,
      pickup_status,
      delivery_status,
      pay_now,
      remaining_amount,
      added_dtime: new Date().toISOString(),
    });
    const savedOrder = await order.save();

    if (savedOrder) {
      await Iptrnsaction.create({
        user_id: savedOrder.user_id,
        Purpose: "Order Placement from Web",
        ip_address: req.connection.remoteAddress,
        created_dtime: new Date(),
      });
      const user = await Users.findById(savedOrder.user_id);
      const mailData = {
        from: "Bid For Sale! <" + smtpUser + ">",
        to: user.email,
        subject: "BFS - Bid For Sale  - Order Placed Successfully",
        text: "Server Email!",
        html:
          "Hey " +
          user.name +
          ", <br> <p>Congratulations your order is placed.please wait for some times and the delivery details you will show on the app.</p>",
      };
      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
      // const deleteCart;
      //Delete Cart while place order
      const existingCart = await Cart.findOne({ user_id, status: 0 });
      if (!existingCart) {
        return res.status(404).json({
          message: 'Cart not found',
        });
      }
      const cartDetail = await CartDetail.findOne({
        cart_id: existingCart._id,
        product_id,
        status: 0,
      });

      /*if (!cartDetail) {
        return res.status(404).json({
          message: 'Product not found in cart',
        });
      }*/
      await cartDetail.remove();

      const cartDetailsCount = await CartDetail.countDocuments({ cart_id: existingCart._id });

      if (cartDetailsCount === 0) {
        await existingCart.remove();
      }
      const updatedProduct = await Userproduct.findOneAndUpdate(
        { _id: product_id },
        { $set: { flag: 1 } },
        { new: true }
      );
      res.status(200).json({
        status: "1",
        is_orderPlaced: 1,
        message: 'Order placed successfully',
        order: savedOrder
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.demoorder = async function (req, res) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    let formData = req.body.data; // assuming formData is correctly populated
    let user_id = formData.user_id;
    let seller_id = formData.seller_id;
    let cart_id = formData.cart_id;
    let product_id = formData.product_id;
    let total_price = formData.total_amt;
    let payment_method = formData.payment_method;
    let gst = formData.gst;
    let order_status = '0';
    let delivery_charges = '0';
    let discount = '0';
    let pickup_status = '0';
    let delivery_status = '0';
    let shipping_address_id = formData.addressBookId;
    let pay_now = formData.pay_now || null;
    let remaining_amount = formData.remaining_amount || null;

    // Check if billing address exists
    const billingaddress = await addressBook.findOne({ user_id: seller_id });
    if (!billingaddress) {
      return res.status(404).json({ message: 'Seller address not found' });
    }

    const billing_address_id = billingaddress._id;

    const order = new Demoorder({
      user_id,
      cart_id,
      seller_id,
      product_id,
      billing_address_id,
      shipping_address_id,
      total_price,
      payment_method,
      order_status,
      pay_now,
      remaining_amount,
      status: 1,
      added_dtime: new Date().toISOString(),
    });

    const savedOrder = await order.save();

    if (savedOrder) {
      res.status(200).json({
        status: "1",
        is_orderPlaced: 1,
        message: 'Order placed successfully',
        order: savedOrder
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async function (req, res, next) {

  try {
    const userId = (typeof req.session.user != "undefined") ? req.session.user.userId : ""
    var cartCount = (userId != "") ? await Cart.countDocuments({ user_id: mongoose.Types.ObjectId(userId) }) : 0;
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/forget-password", {
      title: "Home Page 123",
      requrl: req.app.locals.requrl,
      message: "Welcome to the Dashboard page!",
      cart: cartCount,
      isLoggedIn: isLoggedIn,
    });

  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }

};

// exports.sendotp = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(200).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   try {
//     const user = await Users.findOne({ email: req.body.email });
//     if (!user) {
//       return res.status(200).json({
//         status: "0",
//         message: "User not found!",
//         respdata: {},
//       });
//     }

//     if (!req.body.otp) {
//       //const otp = randNumber(1000, 2000);

//       //SEND SMS
//       const smsRandNumber = Math.floor((Math.random() * 1000000) + 1);
//       const smsData = {
//         textId: "test",
//         toMobile: "917044289770",
//         text: "You have been tagged with an invoice " + smsRandNumber + ". Please use OTP " + smsRandNumber + " for approving the invoice. Do not share your OTP with anyone. RJSSLT",
//       };
//       let smsReturnData = await sendSms(smsData);
//       let smsHistoryData = new ApiCallHistory({
//         userId: mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"),
//         called_for: "sms",
//         api_link: process.env.SITE_URL,
//         api_param: smsData,
//         api_response: smsReturnData,
//         send_status: 'send',
//       });
//       await smsHistoryData.save();

//       //SEND WHATSAPP
//       const root = create({ version: '1.0', encoding: "ISO-8859-1" })
//         .ele('MESSAGE', { VER: '1.2' })
//         .ele('USER', { USERNAME: process.env.WP_SMS_USER_NAME, PASSWORD: process.env.WP_PASSWORD })
//         .ele('SMS', { UDH: "0", CODING: "1", TEXT: "Hi", PROPERTY: "0", ID: "1", TEMPLATE: "bfstest" })
//         .ele('ADDRESS', { FROM: process.env.WP_SMS_SENDER_MOBILE, TO: "917044289770", SEQ: "1" });

//       // convert the XML tree to string
//       const xml = root.end({ prettyPrint: true });
//       const whatsappData = xml;
//       let whatsappReturnData = await sendWhatsapp(whatsappData);
//       let whatsappHistoryData = await new ApiCallHistory({
//         userId: mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"),
//         called_for: "whatsapp",
//         api_link: process.env.SITE_URL,
//         api_param: whatsappData,
//         api_response: whatsappReturnData,
//         send_status: 'send',
//       });
//       await whatsappHistoryData.save();

//       const mailData = {
//         from: "Bid For Sale! <" + smtpUser + ">",
//         to: user.email,
//         subject: "BFS - Bids For Sale - Forgot password OTP",
//         text: "Server Email!",
//         html:
//           "Hey " +
//           user.name +
//           ", <br> <p> Please use this OTP : <b>" +
//           smsRandNumber +
//           "</b> to reset your password! </p>",
//       };

//       transporter.sendMail(mailData, function (err, info) {
//         if (err) console.log(err);
//         else console.log(info);
//       });

//       const updData = {
//         forget_otp: otp,
//       };
//       await Users.findOneAndUpdate(
//         { _id: user._id },
//         { $set: updData },
//         { upsert: true }
//       );

//       return res.status(200).json({
//         status: "1",
//         message: "OTP sent!",
//         resdpata: user,
//         is_forgetpassword: true
//       });
//     } else {
//       // Handle OTP verification and password update logic here
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "0",
//       message: "Internal server error",
//       respdata: error.message || "Unknown error",
//     });
//   }
// };


exports.sendotp = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ email: req.body.email }).then(async (user) => {
    if (!user)
      res.status(200).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else if (!req.body.otp) {
      let randNumber = Math.floor((Math.random() * 1000000) + 1);
      //SEND SMS
      await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
        if (err) {
          // return {
          //   status:false,
          //   data:err
          // };
        }
        //let obj = JSON.parse(data);
        //let randNumber = Math.floor((Math.random() * 1000000) + 1);
        let smsData = {
          textId: "test",
          toMobile: "91"+user.phone_no,
          text: "You have been tagged with an invoice " + randNumber + ". Please use OTP " + randNumber + " for approving the invoice. Do not share your OTP with anyone. RJSSLT",
        };
        let returnData = "";
        // returnData = await sendSms(smsData);
        const historyData = new ApiCallHistory({
          userId: mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"),
          called_for: "sms",
          api_link: process.env.SITE_URL,
          api_param: smsData,
          api_response: returnData,
          send_status: 'send',
        });
        await historyData.save();
      });
      //SEND SMS
      

      const mailData = {
        from: "Bid For Sale! <" + smtpUser + ">",
        to: "sneha.lnsel@gmail.com",
        //to: user.email,
        subject: "BFS - Bids For Sale - Forgot password OTP",
        text: "Server Email!",
        html:
          "Hey " +
          user.name +
          ", <br> <p> Please use this OTP : <b>" +
          randNumber +
          "</b> to reset your password! </p>",
      };

      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log("err",err);
        else console.log("info", info);
      });

      var updData = {
        forget_otp: randNumber,
      };
      Users.findOneAndUpdate(
        { _id: user._id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            Users.findOne({ _id: user._id }).then((user) => {
              res.status(200).json({
                status: "1",
                message: "OTP sent!",
                resdpata: user,
                is_forgetpassword: true
              });
            });
          }
        }
      );
    }
    else {
      if (user.forget_otp == req.body.otp) {
        bcrypt.hash(req.body.newPassword, rounds, (error, hash) => {
          bcrypt.compare(req.body.confirmPassword, hash, (error, match) => {
            if (error) {
              res.status(200).json({
                status: "0",
                message: "Error!",
                respdata: error,
              });
            } else if (match) {
              var updData = {
                password: hash,
                forget_otp: "0",
              };
              Users.findOneAndUpdate(
                { email: req.body.email },
                { $set: updData },
                { upsert: true },
                function (err, doc) {
                  if (err) {
                    throw err;
                  } else {
                    Users.findOne({ email: req.body.email }).then((user) => {
                      res.status(200).json({
                        status: "1",
                        message: "Successfully updated! Please login with your new password",
                        respdata: user,
                        is_forgetpassword: true,
                        is_changepassword: true
                      });
                    });
                  }
                }
              );
            } else {
              res.status(200).json({
                status: "0",
                message: "New and Repeat password does not match!",
                respdata: {},
                is_changepassword: false
              });
            }
          });
        });
      } else {
        res.status(200).json({
          status: "0",
          message: "OTP does not match!",
          respdata: {},
        });
      }
    }
  });
};

exports.changePassword = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  const userId = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  Users.findOne({ _id: userId }).then((user) => {
    if (!user)
      res.status(200).json({
        status: "0",
        message: "User not found!",
        respdata: {},
        is_passwordchnage: "false"
      });
    else {
      bcrypt.compare(req.body.old_password, user.password, (error, match) => {
        if (error) {
          res.status(200).json({
            status: "0",
            message: "Old password does not match!!",
            respdata: error,
            is_passwordchnage: "false"
          });
        } else if (match) {
          bcrypt.compare(
            req.body.new_password,
            user.password,
            (error, match) => {
              if (error) {
                res.status(200).json({
                  status: "0",
                  message: "Error!",
                  respdata: {},
                  is_passwordchnage: "false"
                });
              } else if (!match) {
                bcrypt.hash(req.body.new_password, rounds, (error, hash) => {
                  var updData = {
                    password: hash,
                  };
                  Users.findOneAndUpdate(
                    { _id: req.body.user_id },
                    { $set: updData },
                    { upsert: true },
                    function (err, doc) {
                      if (err) {
                        throw err;
                      } else {
                        Users.findOne({ _id: req.body.user_id }).then(
                          (user) => {
                            res.status(200).json({
                              status: "1",
                              message: "Successfully updated!",
                              respdata: user,
                              is_passwordchnage: "true"
                            });
                          }
                        );
                      }
                    }
                  );
                });
              } else {
                res.status(200).json({
                  status: "0",
                  message: "New password cannot be same as your Old password!",
                  respdata: {},
                  is_passwordchnage: "false"
                });
              }
            }
          );
        } else {
          res.status(200).json({
            status: "0",
            message: "Old password does not match!",
            respdata: {},
            is_passwordchnage: "false"
          });
        }
      });
    }
  });
};

exports.reasonlistdata = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
    const reasons = await Reasonlist.find();
    console.log(reasons)
    return res.json(reasons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.genderwomenlistdata = async function (req, res, next) {
  try {
    const genderId = "65c5dd7c949c7a8b6173f1a9"; 
    const userProducts = await Userproduct.find({
      approval_status: 1,
      flag: 0,
      gender_id: genderId, 
    }).distinct('category_id');

    const categoryList = await Category.find({ _id: { $in: userProducts } });

    res.json({
      status: '1',
      message: 'Categories fetched successfully.',
      categories: categoryList,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching categories by gender_id.',
      error: error.message,
    });
  }
};

exports.gendermenlistdata = async function (req, res, next) {
  try {
    const genderId = "65c5df544f66e281a6393737"; 
    const userProducts = await Userproduct.find({
      approval_status: 1,
      flag: 0,
      gender_id: genderId, 
    }).distinct('category_id');

    const categoryList = await Category.find({ _id: { $in: userProducts } });

    res.json({
      status: '1',
      message: 'Categories fetched successfully.',
      categories: categoryList,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching categories by gender_id.',
      error: error.message,
    });
  }
};


exports.genderkidlistdata = async function (req, res, next) {
  try {
    const genderId = "65c5df684f66e281a639373a"; 
    const userProducts = await Userproduct.find({
      approval_status: 1,
      flag: 0,
      gender_id: genderId, 
    }).distinct('category_id');

    const categoryList = await Category.find({ _id: { $in: userProducts } });

    res.json({
      status: '1',
      message: 'Categories fetched successfully.',
      categories: categoryList,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching categories by gender_id.',
      error: error.message,
    });
  }
};

exports.otherlistdata = async function (req, res, next) {
  try {
    const genderId = "65c5e0db8e59ce8c9788301c"; 
    const userProducts = await Userproduct.find({
      approval_status: 1,
      flag: 0,
      gender_id: genderId, 
    }).distinct('category_id');

    const categoryList = await Category.find({ _id: { $in: userProducts } });

    res.json({
      status: '1',
      message: 'Categories fetched successfully.',
      categories: categoryList,
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching categories by gender_id.',
      error: error.message,
    });
  }
};
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
const smtpUser = "sneha.lnsel@gmail.com";
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
const { log } = require("console");



const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: smtpUser,
    pass: "iysxkkaexpkmfagh",
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
        console.error('Error:', response.body);
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
        console.error('Errottr:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });


}


exports.productData = async function (req, res, next) {
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const productId = req.params.id;
    console.log(productId);
    let query = {};

    query._id = productId;

    let isProductInWishlist = "";
    if (isLoggedIn) {
      isProductInWishlist = await Wishlist.findOne({
        user_id: isLoggedIn,
        product_id: productId,
      });
      console.log("product");
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

      console.log(userproducts);
      console.log("product ------");

      const userproducts1 = await Userproduct.find({ 
        category_id: categoydetails.category_id , 
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
                product_images: productImages1,
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
        category : categoydetails.category_id,
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
      category: userproducts.category_id ? userproducts.category_id.name : '', // Check if category_id exists before accessing 'name'
      brand: userproducts.brand_id ? userproducts.brand_id.name : '', // Check if brand_id exists before accessing 'name'
      user_id: userproducts.user_id ? userproducts.user_id._id : '',
      user_name: userproducts.user_id ? userproducts.user_id.name : '',
      size_id: userproducts.size_id ? userproducts.size_id.name : '', // Check if size_id exists before accessing 'name'
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
      hitCount: userproducts.hitCount || 0, // Provide a default value if hitCount is undefined
      __v: userproducts.__v,
      product_images: productImages,
    };


    
    res.render("webpages/productdetails", {
      title: "Product Details",
      message: "Welcome to the Product page!",
      respdata: formattedUserProduct,
      relatedProducts: formattedUserProducts1,
      category : categoydetails.category_id,
      websiteUrl:process.env.SITE_URL,
      isLoggedIn: isLoggedIn,
      isWhislist: isProductInWishlist != null && Object.keys(isProductInWishlist).length ? true : false
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};


exports.registration = async function (req, res, next) {
  try {
    // console.log("Registration");
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    res.render("webpages/registration", {
      title: "Registration",
      message: "Welcome to the privacy policy page!",
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the privacy policy.",
      error: error.message,
    });
  }
};

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

  bcrypt.hash(req.body.password, rounds, (error, hash) => {
    if (error) {
      res.status(400).json({
        status: "0",
        message: "Error!",
        respdata: error,
      });
    }
    else {

      Users.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          const newUser = Users({
            email: req.body.email,
            password: hash,
            token: "na",
            //title: req.body.title,
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
          });

          newUser.save();
          res.redirect('/api/home');
        }
        else {
          res.status(400).json({
            status: "0",
            message: "User already exists!",
            respdata: {},
          });
        }
      });
    }
  });
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
  /*await Users.findOne({ email }).then(async (user) => {
    const userToken = {
      userId: user._id,
      email: user.email,
      password: user.password,
      title: user.title,
      name: user.name,
      age: user.age,
      //usertoken:user.token,
      phone_no:user.phone_no,
      weight: user.weight,
      height: user.height,
      country: user.country,
      country_code: user.country_code,
      country: user.country,
      goal: user.goal,
      hear_from: user.hear_from,
    };
    if(cookieRefreshToken != "") {
      //Access token validate
      let getAccessTokenData = await tokenDecode(cookieAccessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
      if(!getAccessTokenData.error) {
        if((typeof req.session.user != "undefined") && (req.session.user.userId.toString() == getAccessTokenData.tokenDetails.userId.toString())) {
          //Do Nothing....
          //console.log("session matched with current data");
          res.status(200).json({
            status: "success",
            refreshReset:false,
            message:"Already logged In!!"
          });
        } else {
          let getRefreshTokenData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
          if(!getRefreshTokenData.error) {
            if(getRefreshTokenData.tokenDetails.exp > (Date.now() / 1000)){
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
            //user data stored in session
            req.session.user = userToken;
            res.status(200).json({
              status: "success",
              refreshReset:true,
              accessToken: accessTokenGlobal,
              refreshToken:refreshTokenGlobal
            });
          } else {
            //Do something while you will get error in refresh token
            res.status(200).json({
              status: "error",
              refreshReset:false,
              message: "Error while generating your token!"
            });
          }
        }
      } else {
        //Do something while you will get error in access token
        res.status(200).json({
          status: "error",
          refreshReset:false,
          message: "Error while generating your token!"
        });
      }
    } else {
      //User is logging for the first time
      const { accessToken, refreshToken } = await generateTokens(userToken, "");
      res.status(200).json({
        status: "success",
        refreshReset:true,
        accessToken: accessToken,
        refreshToken:refreshToken
      });
    }
  });*/
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

          user.save(async (err) => {
            if (err) {
              res.status(400).json({
                status: "0",
                message: "Error updating user device information!",
                respdata: err,
              });
            } else {
              const mailData = {
                from: smtpUser,
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
                  console.log(`WhatsApp message sent with SID: ${message.sid}`);
                })
                .catch((error) => {
                  console.error(`Error sending WhatsApp message: ${error.message}`);
                });
              const userToken = {
                userId: user._id,
                email: user.email,
                password: user.password,
                title: user.title,
                name: user.name,
                age: user.age,
                image: user.image ? user.image:'',
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
                //Access token validate
                let getAccessTokenData = await tokenDecode(cookieAccessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
                if (!getAccessTokenData.error) {
                  if ((typeof req.session.user != "undefined") && (req.session.user.userId.toString() == getAccessTokenData.tokenDetails.userId.toString())) {
                    //Do Nothing....
                    //console.log("session matched with current data");
                    res.status(200).json({
                      status: "success",
                      refreshReset: false,
                      message: "Already logged In!!"
                    });
                  } else {
                    let getRefreshTokenData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
                    if (!getRefreshTokenData.error) {
                      if (getRefreshTokenData.tokenDetails.exp > (Date.now() / 1000)) {
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
                    } else {
                      //Do something while you will get error in refresh token
                      res.status(200).json({
                        status: "error",
                        refreshReset: false,
                        message: "Error while generating your token!"
                      });
                    }
                  }
                } else {
                  //Do something while you will get error in access token
                  res.status(200).json({
                    status: "error",
                    refreshReset: false,
                    message: "Error while generating your token!"
                  });
                }
              } else {
                //User is logging for the first time
                const { accessToken, refreshToken } = await generateTokens(userToken, "");
                accessTokenGlobal = accessToken;
                refreshTokenGlobal = refreshToken;
              }
              //Generate Token Required By Condition
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
                  //Store user data into the session
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
        //Do Nothing....
        //console.log("session matched with current data");
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
            image: user.image ? user.image:'',
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
  let { brandList, sizeList, conditionList, priceList, optionId,productcategoryId } = req.body;
  if (typeof optionId != "undefined") {
    if ((optionId == 0)) {
      optionId = 1;
    } else {
      optionId = -1;
    }
  } else {
    optionId = 1;
  }
  let concatVar = {};
  let objConditionList = [];
  if ((typeof conditionList != "undefined") && (conditionList.length > 0)) {
    conditionList.forEach(function (item) {
      objConditionList.push(mongoose.Types.ObjectId(item));
    });
  }
  if (typeof brandList != "undefined") {
    concatVar["brand"] = { "$in": brandList };
  }
  //if(typeof brandList != "undefined" && concatVar.length > 0) {
    if (typeof sizeList != "undefined") {
      concatVar["size"] = { "$in": sizeList };
    }
  //}
  if (typeof productcategoryId != "undefined") {
    concatVar["category_id"] = { "$in": mongoose.Types.ObjectId(productcategoryId) };
  }
  if ((typeof conditionList != "undefined") && (objConditionList.length > 0)) {
    concatVar["status"] = { "$in": objConditionList };
  }
  if (typeof priceList !== "undefined" && priceList.length > 0) {
    const priceConditions = priceList.map(item => {
      const priceArr = item.split("-");
      return {
        offer_price: {
          $gt: parseFloat(priceArr[0]),
          $lte: parseFloat(priceArr[1])
        }
      };
    });
  
    concatVar['$or'] = priceConditions;
  }
  

  let allProductData = await Userproduct.find({ $and: [concatVar]}).sort({ offer_price: optionId });
 
  //let allProductData = await Userproduct.find(concatVar).sort({ offer_price: optionId });  
 
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
      size_id: (typeof userproduct.size_id != "undefined") ? userproduct.size_id.name: "",
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

  const userProductsCount = formattedUserProducts.length;

  if (formattedUserProducts.length > 0) {
    return res.json({
      status: 'success',
      message: 'Success search result',
      respdata: formattedUserProducts,
      userProductsCount:userProductsCount
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
                from: smtpUser,
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
                  console.log(`WhatsApp message sent with SID: ${message.sid}`);
                })
                .catch((error) => {
                  console.error(`Error sending WhatsApp message: ${error.message}`);
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
                  console.log("err", err);
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

                    res.redirect('/api/my-account');
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
    if (isLoggedIn == "")
    {
      res.redirect('/api/registration');
    }
    else{
      var userData = req.session.user;

      const address = await addressBook.find({ user_id: ObjectId(req.session.user.userId) });
      res.render("webpages/myaccount", {
        title: "My Account",
        message: "Welcome to the privacy policy page!",
        respdata: req.session.user,
        respdata1:address,
        isLoggedIn: isLoggedIn,
      });
    }

  } catch (error) {
    //console.error(error);
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
    //console.log('**************** HI EDIT PROFILE**************');
    //console.log(userData);
    //console.log("Edit profile");
    res.render("webpages/edit-profile", {
      title: "Edit profile",
      message: "Welcome to the Edit Profile page!",
      respdata: req.session.user,
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    console.error(error);
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
    console.log('**************** HI EDIT Address**************');
    console.log(userData);
    console.log("Edit Address");
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

    console.log('Address....');
    console.log(address);



    res.render("webpages/edit-address", {
      title: "Edit Address",
      message: "Welcome to the Edit Profile page!",
      respdata: add,
      respdata1: userData,
      isLoggedIn: isLoggedIn,
    });
  } catch (error) {
    console.error(error);
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
    console.error('Error fetching unique parent details:', error);
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
          product_ids: { $push: '$_id' }, // Collect product IDs in an array
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

    console.log('********** Hi ****************11111');
    console.log(categoriesWithMatchingParentId);

    if (!categoriesWithMatchingParentId || categoriesWithMatchingParentId.length === 0) {
      return res.status(404).json({
        status: '0',
        message: 'No sub categories found matching the criteria.',
        respdata: {},
      });
    }

    // return res.status(200).json({
    //   status: '1',
    //   message: 'Found!',
    //   respdata: categoriesWithMatchingParentId,
    // });
    res.render("webpages/productsubcategories", {
      title: "Product Sub Categories",
      message: "Welcome to the Product Sub Categories!",
      respdata: categoriesWithMatchingParentId,


    });
  } catch (error) {
    console.error('Error fetching sub categories with matching parent_id:', error);
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching sub categories with matching parent_id.',
      error: error.message,
    });
  }
};

async function getProductDataWithSort(id, sortid) {
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

    let userproducts = [];
  
    if (id === "whatshot") {
       userproducts = await Userproduct.find({
        approval_status: 1,
        flag: 1
    })
        .populate('brand_id', 'name')
        .populate('category_id', 'name')
        .populate('user_id', 'name')
        .populate('size_id', 'name')
        .sort([
            sortCriteria,
            { hitCount: -1 }
        ])
        .exec();
    
  
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
    
    } else {
      categoryId = id; 

       userproducts = await Userproduct.find({ category_id: id })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .populate('user_id', 'name')
      .populate('size_id', 'name')
      .sort(sortCriteria)
      .exec();
    }



    const formattedUserProducts = [];

    for (const userproduct of userproducts) {

      const productImages = await Productimage.find({ product_id: userproduct._id });

      const productCondition = await Productcondition.findById(userproduct.status);


      const formattedUserProduct = {
        _id: userproduct._id,
        name: userproduct.name,
        description: userproduct.description,
        category: userproduct.category_id.name,
        brand: userproduct.brand_id.name,
        user_id: userproduct.user_id._id,
        user_name: userproduct.user_id.name,
        size_id: userproduct.size_id.name,
        price: userproduct.price,
        offer_price: userproduct.offer_price,
        percentage: userproduct.percentage,
        status: userproduct.status,
        flag: userproduct.flag,
        approval_status: userproduct.approval_status,
        added_dtime: userproduct.added_dtime,
        __v: userproduct.__v,
        product_images: productImages,
        status_name: productCondition ? productCondition.name : '',
      };

      formattedUserProducts.push(formattedUserProduct);
    }

    return {
      status: '1',
      message: 'Success',
      respdata: formattedUserProducts,
      //isLoggedIn: isLoggedIn,
    };

  }
  catch (error) {
    console.error('Error fetching products with matching parent_id:', error);
    return {
      status: '0',
      message: 'An error occurred while fetching products with matching parent_id.',
      error: error.message,
    };
  }
}

exports.getSubCategoriesProducts = async function (req, res, next) {
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const id = req.params.id;

    const sortid = req.params.sortid || 0;

    const data = await getProductDataWithSort(id, sortid);
    const formattedUserProducts = data.respdata;
    const productCount = formattedUserProducts.length;

    const categoryName = await Category.find({ _id: id}).populate('name');
    
    //Get All Filter Data
    //Brand List
    const brandList = await brandModel.find({});
    const sizeList = await sizeModel.find({});
    const conditionList = await productconditionModel.find({});


    res.render("webpages/subcategoryproduct",
      {
        title: "Product Sub Categories",
        message: "Welcome to the Product Sub Categories!",
        respdata: formattedUserProducts,
        product_category_id: id,
        brandList: brandList,
        sizeList: sizeList,
        categoryName:categoryName,
        conditionList: conditionList,
        productCount:productCount,
        isLoggedIn: isLoggedIn

      });


  }
  catch (error) {
    console.error('Error fetching products with matching parent_id:', error);
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching products with matching parent_id.',
      error: error.message,
    });
  }
};


exports.getSubCategoriesProductswithSort = async function (req, res, next) {

  let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
  const id = req.params.id;

  const sortid = req.params.sortid || 0;


  const data = await getProductDataWithSort(id, sortid);
  const formattedUserProducts = data.respdata;
  const productCount = formattedUserProducts.length;

console.log(productCount);
console.log("product changes");
  return res.json({
    status: '1',
    message: 'Success',
    respdata: formattedUserProducts,
    productCount:productCount,
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
      { upsert: true, new: true } // Use new: true to get the updated document
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

    res.redirect("/api/my-account");

    // res.status(200).json({
    //   status: "1",
    //   message: "Successfully updated!",
    //   respdata: updatedUser,
    // });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

// user checkout address add
exports.userNewCheckOutAddressAdd = async function (req, res, next) {
  try{
    
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
      user_id: req.body.userId ? req.body.userId:req.session.user.userId,
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
    console.log("###########hgfhfhfhfh######################");
    console.log(user);
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
      res.redirect('/api/checkout-web');
    }    

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }

};




exports.userAddressAdd = async function (req, res, next) {
  try {
    
    const addr_name = req.body.addrType;
    //const address = await addressBook.findOne({ _id: req.params.id });
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
      res.redirect('/api/my-account');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
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
    res.redirect('/api/my-account');
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

// My Post
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
        //category: userproduct.category_id.name, 
        brand: userproduct.brand_id ? userproduct.brand_id.name : '',
        //brand_id: userproduct.brand_id._id, 
        user_id: userproduct.user_id._id,
        user_name: userproduct.user_id.name,
        //size: userproduct.size_id.name,
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
      });
    }

  } catch (error) {
    console.error(error);
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
    //console.log('Add User Post');

    if (isLoggedIn == "") {
      res.redirect("/api/registration");
    }
    const productConditions = await Productcondition.find();

    const parentCategoryId = "650444488501422c8bf24bdb";
    const categoriesWithoutParentId = await Category.find({ parent_id: { $ne: parentCategoryId } });

    res.render("webpages/addmypost", {
      title: "My Account",
      message: "Welcome to the Add Post page!",
      respdata: req.session.user,
      productcondition: productConditions,
      subcate: categoriesWithoutParentId,
      isLoggedIn: isLoggedIn,

    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }

};

// New Post Add
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

    const existingProduct = await Userproduct.findOne({ name: req.body.name });

    if (existingProduct) {
      return res.status(404).json({
        status: "0",
        message: "Product already exists!",
        respdata: {},
      });
    }

    let invoice;
    let packaging;

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
        const imageUrl = requrl + "/public/images/" + file.filename;

        const productimageDetail = new Productimage({
          product_id: savedProductdata._id,
          //category_id: req.body.product_cate,
          user_id: req.session.user.userId,
          //brand: brand,
          image: imageUrl,
          added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });

        const savedImage = productimageDetail.save();
        console.log(savedImage);
      });

    }
    res.redirect('/api/my-account');



  } catch (error) {
    console.error(error);
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
  if(isLoggedIn != ''){
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
                  console.error('Error destroying session:', err);
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
  else
  {
    res.status(200).json({
      status: "error",
      message: "Unable to logout at this moment.",
     
    });
  }
};



// // User wise Post edit
exports.editUserWisePost = async function (req, res, next) {

  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    const productConditions = await Productcondition.find();

    const parentCategoryId = "650444488501422c8bf24bdb";
    const categoriesWithoutParentId = await Category.find({ parent_id: { $ne: parentCategoryId } });

    //console.log('Product Category');
    //console.log(categoriesWithoutParentId);


    const product = await Userproduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    //  console.log('Product');
    //  console.log(product);

    const productImages = await Productimage.find({ product_id: req.params.id });

    const productDetails = {
      ...product.toObject(),
      images: productImages,
    };

    console.log('Formated_User_Products');
    console.log(productDetails);


    // if(formattedUserProducts)
    // {
    res.render("webpages/editmypost", {
      title: "My Post",
      message: "Welcome to the My Post page!",
      respdata: productDetails,
      //productimg: productImg, 
      userData: req.session.user,
      productcondition: productConditions,
      subcate: categoriesWithoutParentId,
      isLoggedIn: isLoggedIn,
    });
    // }



  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }
};

// For Wishlist
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
        message: 'Item already added to your favorite successfully',
        wishlist: existingList,
        success: true,
        is_wishlisted: true
      });
    }
    else {
      const user = await Users.findOne({ _id: user_id });
      const product = await Userproduct.findOne({ _id: product_id }).populate('category_id', 'name');
      const newFavList = new Wishlist({
        user_id,
        product_id,
        status,
        added_dtime: new Date(),
      });

      const savedFavData = await newFavList.save();

      return res.status(200).json({
        message: 'Item added to your wishlist successfully',
        success: true,
        is_wishlisted: true
      });
    }

  }
  catch (error) {
    console.error(error);
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
    if (!req.session.user) {
      return res.redirect("/api/registration");
    }

    const user_id = req.session.user.userId;
    const existingList = await Wishlist.find({ user_id: isLoggedIn })
      .populate('user_id', 'name')
      .exec();

    console.log(existingList);

    if (existingList.length === 0) {
      res.render("webpages/wishlist", {
        title: "Wish List Page",
        message: "Welcome to the Wish List page!",
        respdata: [],
        isLoggedIn: isLoggedIn,
        itemCount: 0,
      });
    } else {
      const formattedList = await Promise.all(existingList.map(async (item) => {
        console.log(item.product_id);
        const product = await Userproduct.findOne({ _id: item.product_id }).populate('category_id', 'name');


        console.log(product);
        const productImages = await Productimage.find({ product_id: item.product_id }).limit(1);

        const date = moment(item.added_dtime);
        const addedDate = date.format('DD/MM/YYYY');

        return {
          _id: item._id,
          user_id: item.user_id._id,
          user_name: item.user_id.name,
          product_id: item.product_id,
          product_name: product.name,
          product_price: product.price,
          category_name: product.category_id.name,
          images: productImages[0].image,
          status: item.status,
          added_dtime: addedDate,
          __v: item.__v,
        };
      }));

      const count = formattedList.length;

      res.render("webpages/wishlist", {
        title: "Wish List Page",
        message: "Welcome to the Wish List page!",
        respdata: formattedList,
        isLoggedIn: isLoggedIn,
        itemCount: formattedList.length,
      });
    }
  } catch (error) {
    console.error(error);
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

    console.log(existingList);
    console.log(existingList);
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
        message: 'Product removed from Wishlist successfully',
        success: true,
        count: count
      });
    }
  }
  catch (error) {
    console.error(error);
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
        removeItemAfterTime(existingCart._id); // savedata._id contains the ID of the added item
      }, 20 * 60 * 1000);

      return res.status(200).json({
        message: 'Item Added to Cart',
        cart: cartResponse,
      });

    }
    else {

      console.log("NEW..###############");
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

      // Cart Count
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

      const durationInSeconds = cartRemove.name; // Assuming 'name' holds a duration in seconds


      const durationInMilliseconds = durationInSeconds * 60 * 1000;
      console.log("removal time");
      console.log(durationInSeconds);

      setTimeout(() => {
        removeItemAfterTime(savedCart._id); // savedata._id contains the ID of the added item
        //console.log('welcome');
      }, durationInMilliseconds);

      // Convert duration from seconds to milliseconds


      console.log("removal time in miliseond");
      console.log(durationInMilliseconds);


      // render after success 

      res.status(200).json({
        cart_count: cartCount,
        message: 'Item Added to Cart',
        cart: cartResponse,
        is_added: true
      });


    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the Edit Profile.",
      error: error.message,
    });
  }

};

const removeItemAfterTime = async (cartId) => {
  console.log('hi' + cartId)
  try {
    console.log("Timer expired for cart:", cartId);

    await Cart.findByIdAndDelete(cartId);
    // Perform logic to remove items from the cart after 1 minute (for testing purposes)
    const cartItems = await CartDetail.find({ cart_id: cartId, status: 0 });

    for (const cartItem of cartItems) {
      await CartDetail.findByIdAndDelete(cartItem._id);
      console.log(`Item ${cartItem._id} removed from the cart after 1 minute (test).`);
    }
  } catch (error) {
    console.error('Error while removing item from cart:', error);
  }
};

exports.viewCartListByUserId = async function (req, res, next) {
  try {

    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    //if (!req.session.user || !req.session.user.userId) {
    if (isLoggedIn == "") {
      return res.redirect("/api/registration");
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

        });

      }));

    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering Cart List.",
      error: error.message,
    });
  }
};

// Delete cart
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
    console.error(error);
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
        const imageUrl = requrl + "/public/images/" + file.filename;
        console.log(imageUrl);

        const updData = {
          image: imageUrl,
        };

        const updatedUser = await Users.findOneAndUpdate(
          { _id: req.body.user_id },
          { $set: updData },
          { upsert: true, new: true } // Use new: true to get the updated document
        );

        if (updatedUser) {
          req.session.user.image = updatedUser.image;
          res.redirect('/api/my-account');
        }


      });

      // res.status(200).json({
      //   status: "1",
      //   status: "1",
      //   message: "Product and images added!",
      //   respdata: savedProductdata
      // });
    }

  }
  catch (error) {
    console.error(error);
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
        return res.redirect("/api/registration");
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
      }else{
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
          
          res.render("webpages/mycheckoutweb", {
            title: "Check Out Page",
            status: '1',
            is_orderPlaced: 1,
            message: "Welcome to the Checkout page!",
            respdata: finalData,
            product_price:product_price,
            finalPrice:finalPrice,
            gst:gst,
            isLoggedIn: isLoggedIn,
            user: req.session.user,
            addressUserList:addressUserList,
          });
          
  
        }));
  }
  }
  catch (error) {
    console.error(error);
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
      respdata: req.session.user,
      isLoggedIn: isLoggedIn,
    });

  }
  catch (error) {
    console.error(error);
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
    const sellerAddress = await addressBook.findOne({ _id: order.billing_address_id});
    const buyerAddress = await addressBook.findOne({ _id: order.shipping_address_id });

    const shippingKitData = await Shippingkit.findOne({ order_id: order._id });

    let shippingkit_details;

    let shipping_user_details;

    if(shippingKitData)
    {
       shippingkit_details = await addressBook.findById({ _id: shippingKitData.shipping_address_id });

       shipping_user_details = await Users.findById({ _id: shippingKitData.buyer_id });
    }

    console.log(shippingkit_details);

    const orderDetails = {
      _id: order._id,
      total_price: order.total_price,
      payment_method: order.payment_method,
      order_status: order.order_status,
      gst: order.gst,
      seller: {
        _id: order.seller_id._id,
        name: order.seller_id.name,
      },
      buyeraddress: buyerAddress ? buyerAddress: 'No Buyer Address Found',
      user: {
        _id: order.user_id._id,
        name: order.user_id.name,
        phone_no: req.session.user.phone_no ? req.session.user.phone_no : '',
      },
      selleraddress: sellerAddress ? sellerAddress : 'No Buyer Address Found',
      product: {
        name: productDetails ? productDetails.name : 'Unknown Product',
        offer_price : productDetails ? productDetails.offer_price : 'Unknown Product',
        image: productImage ? productImage.image : 'No Image',
      },
      shippingKitData :shippingKitData || null,
      shippingkit_details : shippingkit_details || null,
      shipping_user_details :shipping_user_details || null
    };
    //return false;
    res.render("webpages/myorderdetails",{
      title: "Wish List Page",
      message: "Welcome to the Wish List page!",
      respdata: orderDetails,
      //respdata1: orderlistId,
      isLoggedIn: isLoggedIn,
    });

  }
  catch (error) {
    console.error(error);
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
    const gst = (price * 18)/100;
    const final_price = price +  gst;

    const track = await Ordertracking.findOne({ order_id: order_id }).exec();
   
    if (track == null)  {
      console.log(4556646546);
      //return res.status(404).json({ message: 'Order Delivery Partner Not chosse yet' });
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
      // return res.status(404).json({ message: 'Order Delivery Partner Not chosse yet' });
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
      total_price : final_price,
      payment_method : 1,
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

      // if (user.email) {
      //   const mailData = {
      //     from: smtpUser,
      //     to: user.email,
      //     subject: "BFS - Bid For Sale  - Order Placed Successfully",
      //     text: "Server Email!",
      //     html:
      //       "Hey " +
      //       user.name +
      //       ", <br> <p>Congratulations your order is placed.please wait for some times and the delivery details you will show on the app.</p>",
      //   };

      //   transporter.sendMail(mailData, function (err, info) {
      //     if (err) console.log(err);
      //     else console.log(info);
      //   });
      // }
      res.status(200).json({
        status: "1",
        message: 'Shipping Kit Order placed successfully',
        success: true,
        is_shippingkit: true,
        order: savedOrder,
        isLoggedIn: isLoggedIn,
      });

      
    //}
    }

  } catch (error) {
    console.error('Error placing order:', error);
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
        productCount:hotProductsCount,
        isLoggedIn: isLoggedIn,
        filter_basedon:"whatshot"

      });

  } catch (error) {

    console.error('Error fetching what\'s hot products:', error);

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
        productCount:soldItemsCount,
        isLoggedIn: isLoggedIn,
        filter_basedon:"justsold"

      });

  } catch (error) {

    console.error('Error fetching just sold products:', error);

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
        productCount:count,
        isLoggedIn: isLoggedIn,
        filter_basedon:"bestDeal"
      });

  } catch (error) {

    console.error('Error fetching just sold products:', error);

    return res.status(500).json({ message: 'Internal server error' });

  }

};

exports.userPlacedOrder = async function (req, res) {

 try{
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
    // console.log(billing_address_id);

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

    // Generate the unique code using the current time components
    const orderCode = `BFSORD${currentHour}${currentMinute}${currentSecond}${currentMillisecond}`;

    // Create value for saving data in order table
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
      added_dtime: new Date().toISOString(),
    });
    const savedOrder = await order.save();

    if (savedOrder) {
      const user = await Users.findById(savedOrder.user_id);

      const mailData = {
        from: smtpUser,
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
      //Delete Cart while place order
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

  console.error('Error fetching Order Palced: ', error);

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

    console.error(error);

    res.status(500).json({

      status: "0",

      message: "An error occurred while rendering the dashboard.",

      error: error.message,

    });

  }

};

exports.sendotp = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      res.status(200).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else if(!req.body.otp){
      var otp = randNumber(1000, 2000);

      const mailData = {
        from: smtpUser, 
        to: user.email,
        subject: "BFS - Bids For Sale - Forgot password OTP",
        text: "Server Email!",
        html:
          "Hey " +
          user.name +
          ", <br> <p> Please use this OTP : <b>" +
          otp +
          "</b> to reset your password! </p>",
      };

      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });

      var updData = {
        forget_otp: otp,
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
    else
    {
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
                { _id: req.body.user_id },
                { $set: updData },
                { upsert: true },
                function (err, doc) {
                  if (err) {
                    throw err;
                  } else {
                    Users.findOne({ _id: req.body.user_id }).then((user) => {
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

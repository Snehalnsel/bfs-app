var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/web/usersModel");
const Userproduct = require("../../models/api/userproductModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
// var { getAllActiveSessions } = require("../../middlewares/redis");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");

const generateAdminTokens = require("../../utils/generateAdminTokens");
const verifyRefreshToken = require("../../utils/verifyRefreshToken");
const tokenDecode = require("../../utils/tokenDecode");

//functions
function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
}

//methods
exports.getUsers = async function (req, res, next) {
  
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";

  Users.find().then((users) => {
    res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: users,
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};

exports.signUp = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  // let userCount = await Users.countDocuments();
  // let userCode = `BFS${(userCount + 1).toString().padStart(3, '0')}`;
  bcrypt.hash(req.body.password, rounds, (error, hash) => {
    if (error) {
      res.status(400).json({
        status: "0",
        message: "Error!",
        respdata: error,
        isAdminLoggedIn:isAdminLoggedIn
      });
    } else {

      Users.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          const newUser = Users({
            email: req.body.email,
            password: hash,
            token: "na",
            name: req.body.name,
            last_login: "na",
            created_dtime: dateTime,
            image: "na",
            last_logout: "na",
          });

          newUser
            .save()
            .then((user) => {
              res.status(200).json({
                status: "1",
                message: "Added!",
                respdata: user,
                isAdminLoggedIn:isAdminLoggedIn
              });
            })
            .catch((error) => {
              res.status(400).json({
                status: "0",
                message: "Error!",
                respdata: error,
                isAdminLoggedIn:isAdminLoggedIn
              });
            });
        } else {
          res.status(400).json({
            status: "0",
            message: "User already exists!",
            respdata: {},
            isAdminLoggedIn:isAdminLoggedIn
          });
        }
      });
    }
  });
};

exports.ajaxAdminLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var pageTitle = req.app.locals.siteName + " - Login";
    res.render("pages", {
      status: 0,
      siteName: req.app.locals.siteName,
      pageTitle: pageTitle,
      year: moment().format("YYYY"),
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  var pageTitle = req.app.locals.siteName + " - Dashboard";
  const { email, password, cookieAccessToken, cookieRefreshToken } = req.body;

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  //Token generate
  let accessTokenGlobal = "";
  let refreshTokenGlobal = "";
  Users.findOne({ email: email }).then((user) => {
    if (!user)
      res.render("pages", {
        status: 0,
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "User not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    else {
      bcrypt.compare(password, user.password, async (error, match) => {
        if (error) {
          res.render("pages", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageTitle: pageTitle,
            year: moment().format("YYYY"),
            message: "Error!",
            respdata: error,
            isAdminLoggedIn:isAdminLoggedIn
          });
        } else if (match) {
  
          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
          };
          //Generate Token Required By Condition
          if (cookieRefreshToken != "") {
            //Access token validate
            let getAccessTokenData = await tokenDecode(cookieAccessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
            if (!getAccessTokenData.error) {
              if ((typeof  req.session.admin != "undefined") && ( req.session.admin.userId.toString() == getAccessTokenData.tokenDetails.userId.toString())) {
                res.status(200).json({
                  status: "success",
                  refreshReset: false,
                  message: "Already logged In!!",
                  isAdminLoggedIn:isAdminLoggedIn
                });
              } else {
                let getRefreshTokenData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
                if (!getRefreshTokenData.error) {
                  if (getRefreshTokenData.tokenDetails.exp > (Date.now() / 1000)) {
                    //generate access token only
                    const { accessToken, refreshToken } = await generateAdminTokens(userToken, cookieRefreshToken);
                    accessTokenGlobal = accessToken;
                    refreshTokenGlobal = refreshToken;
                  } else {
                    //generate refresh token
                    const { accessToken, refreshToken } = await generateAdminTokens(userToken, "");
                    accessTokenGlobal = accessToken;
                    refreshTokenGlobal = refreshToken;
                  }
                } else {
                  //Do something while you will get error in refresh token
                  res.status(200).json({
                    status: "error",
                    refreshReset: false,
                    message: "Error while generating your token!",
                    isAdminLoggedIn:isAdminLoggedIn
                  });
                }
              }
            } else {
              //Do something while you will get error in access token
              res.status(200).json({
                status: "error",
                refreshReset: false,
                message: "Error while generating your token!",
                isAdminLoggedIn:isAdminLoggedIn
              });
            }
          } else {
            //Admin is logging for the first time
            const { accessToken, refreshToken } = await generateAdminTokens(userToken, "");
            accessTokenGlobal = accessToken;
            refreshTokenGlobal = refreshToken;
          }
          Users.findOneAndUpdate(
            { _id: user._id },
            { $set: { token: accessTokenGlobal, last_login: dateTime } },
            { upsert: true },
            function (err, doc) {
              if (err) {
                throw err;
              } else {
                Users.findOne({ _id: user._id }).then((user) => {
                  if (user.image != "na") {
                    var image_url =
                      req.app.locals.requrl + "/public/images/" + user.image;
                  } else {
                    var image_url =
                      req.app.locals.requrl +
                      "/public/images/" +
                      "no-image.jpg";
                  }

                  delete  req.session.admin;
                  req.session.admin = {
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    userToken: user.token,
                    image: user.image,
                    image_url: image_url,
                  };
                  //After Successfull Logged in Send Response
                  res.status(200).json({
                    status: "success",
                    message: "Successfully logged in!",
                    respdata: {
                      accessToken: accessTokenGlobal,
                      accessTokenExpires: process.env.COOCKIE_ACCESS_TOKEN_EXPIRES_IN,
                      refreshToken: refreshTokenGlobal,
                      refreshTokenExpires: process.env.COOCKIE_REFRESH_TOKEN_EXPIRES_IN,
                      refreshReset: true,
                      isAdminLoggedIn:isAdminLoggedIn
                    },
                  });
                  //res.redirect("/dashboard");
                });
              }
            }
          );
        } else {
          res.status(400).json({
            status: "error",
            message: "Password does not match!",
            respdata: {},
            isAdminLoggedIn:isAdminLoggedIn
          });
          /*res.render("pages", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageTitle: pageTitle,
            year: moment().format("YYYY"),
            message: "Password does not match!",
            respdata: {},
          });*/
        }
      });
    }
  });
};

/*exports.getLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var pageTitle = req.app.locals.siteName + " - Login";
    res.render("pages", {
      status: 0,
      siteName: req.app.locals.siteName,
      pageTitle: pageTitle,
      year: moment().format("YYYY"),
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  var pageTitle = req.app.locals.siteName + " - Dashboard";

  Users.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      res.render("pages", {
        status: 0,
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "User not found!",
        respdata: {},
      });
    else {
      bcrypt.compare(req.body.password, user.password, (error, match) => {
        if (error) {
          res.render("pages", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageTitle: pageTitle,
            year: moment().format("YYYY"),
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
  
          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
          };

          Users.findOneAndUpdate(
            { _id: user._id },
            { $set: { token: generateToken(userToken), last_login: dateTime } },
            { upsert: true },
            function (err, doc) {
              if (err) {
                throw err;
              } else {
                Users.findOne({ _id: user._id }).then((user) => {
                  if (user.image != "na") {
                    var image_url =
                      req.app.locals.requrl + "/public/images/" + user.image;
                  } else {
                    var image_url =
                      req.app.locals.requrl +
                      "/public/images/" +
                      "no-image.jpg";
                  }

                  delete  req.session.admin;
                   req.session.admin = {
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    userToken: user.token,
                    image: user.image,
                    image_url: image_url,
                  };
                  
                  res.redirect("/dashboard");
                });
              }
            }
          );
        } else {
          res.render("pages", {
            status: 0,
            siteName: req.app.locals.siteName,
            pageTitle: pageTitle,
            year: moment().format("YYYY"),
            message: "Password does not match!",
            respdata: {},
          });
        }
      });
    }
  });
};*/
exports.adminRelogin = async function (req, res, next) {
  const { cookieRefreshToken } = req.body;
  let accessTokenGlobal = "";
  let refreshTokenGlobal = "";
  if (cookieRefreshToken != "") {
    let tokenDetailsData = await tokenDecode(cookieRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    if (!tokenDetailsData.error) {
      const email = tokenDetailsData.tokenDetails.email;
      if ((typeof  req.session.admin != "undefined") && ( req.session.admin.userId.toString() == tokenDetailsData.tokenDetails.userId.toString())) {
        res.status(200).json({
          status: "error",
          message: "Already logged In!!",
          isAdminLoggedIn:isAdminLoggedIn
        });
      } else {
        Users.findOne({ email }).then(async (user) => {
          //user.save(async (err) => {
          const userToken = {
            userId: user._id,
            email: user.email,
            password: user.password,
          };
          //user data stored in session
           req.session.admin = userToken;
          if (tokenDetailsData.tokenDetails.exp > (Date.now() / 1000)) {
            //generate access token only
            const { accessToken, refreshToken } = await generateAdminTokens(userToken, cookieRefreshToken);
            accessTokenGlobal = accessToken;
            refreshTokenGlobal = refreshToken;
          } else {
            //generate refresh token
            const { accessToken, refreshToken } = await generateAdminTokens(userToken, "");
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
                  isAdminLoggedIn:isAdminLoggedIn
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
                    isAdminLoggedIn:isAdminLoggedIn
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
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  }

};
exports.getProfile = async function (req, res, next) {
 

  if (! req.session.admin) {
    res.redirect("/");
  }
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageTitle = req.app.locals.siteName + " - Profile";
  const user_id = mongoose.Types.ObjectId( req.session.admin.userId);

  Users.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      res.status(400).json({
        status: "0",
        message: "User does not exist!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    } else {
      
      user.image = req.baseUrl + "/images/" + "test.jpg";

      res.render("pages/profile", {
        status: 1,
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        respdata: user,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  });
};

exports.uploadImage = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    else {
      const imgData = req.body.img_base64;
      const folderPath = "./public/images/";
      const path = Date.now() + ".png";
      fs.writeFileSync(folderPath + path, imgData, "base64", function (err) {
      });

      var image_url = req.app.locals.requrl + "/public/images/" + path;

      var updData = {
        image: image_url,
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
                message: "Successful!",
                respdata: user,
                isAdminLoggedIn:isAdminLoggedIn
              });
            });
          }
        }
      );
    }
  });
};

exports.signOut = async function (req, res, next) {
  //const banner = await Banner.find({ status: 1 });
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  if(isLoggedIn != ''){
    Users.findOne({ _id:  req.session.admin.userId }).then((user) => {
      if (!user)
        res.status(404).json({
          status: "0",
          message: "User not found!",
          respdata: {},
          isAdminLoggedIn:isAdminLoggedIn
        });
      else {
        var updData = {
          token: "na",
          last_logout: dateTime,
        };
        Users.findOneAndUpdate(
          { _id:  req.session.admin.userId },
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
                    isAdminLoggedIn:isAdminLoggedIn
                  });
                }
                res.status(200).json({
                    status: "success",                 
                    message: "Sign out!",
                    isAdminLoggedIn:isAdminLoggedIn
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
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};
/*exports.getLogout = async function (req, res, next) {
  if (! req.session.admin) {
    res.redirect("/");
  }
  let adminUserId = typeof  req.session.admin != "undefined" ?  req.session.admin.userId : "";
  const user_id = mongoose.Types.ObjectId(adminUserId);

  Users.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      var pageTitle = req.app.locals.siteName + " - Login";
      res.render("pages", {
        status: 0,
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "User not found!",
      });
    } else {
      var updData = {
        token: "na",
        last_logout: dateTime,
      };
      Users.findOneAndUpdate(
        { _id: user_id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            Users.findOne({ _id: user_id }).then((user) => {
              delete  req.session.admin;
              res.redirect("/");
            });
          }
        }
      );
    }
  });
};*/

exports.editProfile = async function (req, res, next) {
  var pageTitle = req.app.locals.siteName + " - Profile";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("pages/profile", {
      siteName: req.app.locals.siteName,
      pageTitle: pageTitle,
      userFullName:  req.session.admin.name,
      userImage:  req.session.admin.image_url,
      userEmail:  req.session.admin.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const user_id = mongoose.Types.ObjectId( req.session.admin.userId);

  Users.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      res.render("pages/profile", {
        siteName: req.app.locals.siteName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        status: 0,
        message: "User not found!",
        respdata: errors.array(),
        isAdminLoggedIn:isAdminLoggedIn
      });
    } else {
      if (!req.body.newPassword) {
        var updData = {
          name: req.body.fullName,
        };
        Users.findOneAndUpdate(
          { _id: user_id },
          { $set: updData },
          { upsert: true },
          function (err, doc) {
            if (err) {
              throw err;
            } else {
              Users.findOne({ _id: user_id }).then((user) => {
                res.render("pages/profile", {
                  siteName: req.app.locals.siteName,
                  pageTitle: pageTitle,
                  userFullName: user.name,
                  userImage:  req.session.admin.image_url,
                  userEmail: user.email,
                  year: moment().format("YYYY"),
                  requrl: req.app.locals.requrl,
                  status: 0,
                  message: "Successfully updated!",
                  respdata: user,
                  isAdminLoggedIn:isAdminLoggedIn
                });
              });
            }
          }
        );
      } else {
        bcrypt.compare(req.body.newPassword, user.password, (error, match) => {
          if (error) {
            res.render("pages/profile", {
              siteName: req.app.locals.siteName,
              pageTitle: pageTitle,
              userFullName: user.name,
              userImage:  req.session.admin.image_url,
              userEmail: user.email,
              year: moment().format("YYYY"),
              requrl: req.app.locals.requrl,
              status: 0,
              message: "error!",
              respdata: error,
              isAdminLoggedIn:isAdminLoggedIn
            });
          } else if (!match) {
            bcrypt.hash(req.body.newPassword, rounds, (error, hash) => {
              var updData = {
                password: hash,
              };
              Users.findOneAndUpdate(
                { _id: user_id },
                { $set: updData },
                { upsert: true },
                function (err, doc) {
                  if (err) {
                    throw err;
                  } else {
                    Users.findOne({ _id: user_id }).then((user) => {
                      res.render("pages/profile", {
                        siteName: req.app.locals.siteName,
                        pageTitle: pageTitle,
                        userFullName:  req.session.admin.name,
                        userImage:  req.session.admin.image_url,
                        userEmail:  req.session.admin.email,
                        year: moment().format("YYYY"),
                        requrl: req.app.locals.requrl,
                        status: 0,
                        message: "Successfully updated!",
                        respdata: user,
                        isAdminLoggedIn:isAdminLoggedIn
                      });
                    });
                  }
                }
              );
            });
          } else {
            res.render("pages/profile", {
              siteName: req.app.locals.siteName,
              pageTitle: pageTitle,
              userFullName:  req.session.admin.name,
              userImage:  req.session.admin.image_url,
              userEmail:  req.session.admin.email,
              status: 0,
              year: moment().format("YYYY"),
              message: "New password cannot be same as your Old password!!",
              respdata: {},
              isAdminLoggedIn:isAdminLoggedIn
            });
          }
        });
      }
    }
  });
};


exports.countProducts = async (req, res) => {
  try {
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const totalProducts = await Userproduct.countDocuments();
    
    res.status(200).json({
      status: "1",
      message: "Total products count retrieved successfully!",
      respdata: {
        totalProducts: totalProducts,
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while counting products",
      respdata: {},
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    res.status(200).json({
      status: "1",
      message: "Total users count retrieved successfully!",
      respdata: {
        totalUsers: totalUsers,
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while counting users",
      respdata: {},
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

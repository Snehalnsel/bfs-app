var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const twilio = require('twilio');
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/api/userModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const today = moment().format("YYYY-MM-DD");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
var ObjectId = require("mongodb").ObjectId;
const url = require("url");
const nodemailer = require("nodemailer");
// const smtpUser = "snigdho.lnsel@gmail.com";onaonfajcxjjwoow
const smtpUser = "sneha.lnsel@gmail.com";

const accountSid = 'ACa1b71e8226f3a243196beeee233311a9';
const authToken = 'ea9a24bf2a9ca43a95b991c9c471ba93';
const twilioClient = new twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  port: 587,
  host: "smtp.gmail.com",
  auth: {
    user: smtpUser,
    pass: "iysxkkaexpkmfagh",
  },
  secure: false, // Setting 'secure' to false
  tls: {
    rejectUnauthorized: false, // Avoids specifying a TLS version
  },
});




function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};
  if (matches) {
    if (matches.length !== 3) {
      return new Error("Invalid input string");
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], "base64");
  }

  return response;
}

function randNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

exports.getUsers = async function (req, res, next) {
  

  Users.find().then((users) => {
    res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: users,
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

  let userCount = await Users.countDocuments();
  let userCode = `BFS${(userCount + 1).toString().padStart(5, '0')}`;

  console.log(userCode);
  bcrypt.hash(req.body.password, rounds, (error, hash) => {
    if (error) {
      res.status(400).json({
        status: "0",
        message: "Error!",
        respdata: error,
      });
    } else {
     

      var trial_date = moment(today, "YYYY-MM-DD").add(14, "days");
      trial_date = trial_date.format("YYYY-MM-DD");

      Users.findOne({ email: req.body.email , status: "0" }).then((user) => {
        if (!user) {
          const newUser = Users({
            email: req.body.email,
            password: hash,
            token: "na",
            title: req.body.title,
            name: req.body.name,
            phone_no : req.body.phone_no,
            deviceid: req.body.deviceid,
            devicename: req.body.devicename,
            fcm_token: req.body.fcm_token,
            country: req.body.country,
            country_code: req.body.country_code,
            country: req.body.country,
            last_login: "na",
            last_logout: "na",
            created_dtime: dateTime,
            app_user_id: userCode,
            trial_end_date: trial_date,
            image: "na",
          });

          newUser
            .save()
            .then((user) => {
              res.status(200).json({
                status: "1",
                message: "Added!",
                respdata: user,
              });
            })
            .catch((error) => {
              res.status(400).json({
                status: "0",
                message: "Error!",
                respdata: error,
              });
            });
        } else {
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

// exports.getLogin = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   const { email, password, deviceid, devicename, fcm_token } = req.body;

//   Users.findOne({ email, status: "0" }).then((user) => {
//     if (!user)
//       res.status(404).json({
//         status: "0",
//         message: "User not found!",
//         respdata: {},
//       });
//     else {
//       const requrl = url.format({
//         protocol: req.protocol,
//         host: req.get("host"),
//       });
//       req.app.locals.requrl = requrl;

//       bcrypt.compare(password, user.password, (error, match) => {
//         if (error) {
//           res.status(400).json({
//             status: "0",
//             message: "Error!",
//             respdata: error,
//           });
//         } else if (match) {
         
//           user.deviceid = deviceid;
//           user.devicename = devicename;
//           user.fcm_token = fcm_token;

//           user.save((err) => {
//             if (err) {
//               res.status(400).json({
//                 status: "0",
//                 message: "Error updating user device information!",
//                 respdata: err,
//               });
//             } else {
//               const mailData = {
//                 from: smtpUser,
//                 to: user.email,
//                 subject: "BFS - Bid For Sale  - Welcome Email",
//                 text: "Server Email!",
//                 html:
//                   "Hey " +
//                   user.name +
//                   ", <br> <p>Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items </p>",
//               };

//               transporter.sendMail(mailData, function (err, info) {
//                 if (err) console.log(err);
//                 else console.log(info);
//               });

//              // const msg = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";

//               const whatsappMessage = "Welcome to the Bidding App, your gateway to exciting auctions and amazing deals! We're thrilled to have you on board and can't wait for you to start bidding on your favorite items";
//               const userPhoneNo = "+917044289770";

//               twilioClient.messages.create({
//                 body: whatsappMessage,
//                 // From: 'whatsapp:+12565734549',
//                 // to: 'whatsapp:+918116730275'
//                 from: 'whatsapp:+14155238886',
//                 to: 'whatsapp:+917044289770'
//               })
//               .then((message) => {
//                 console.log(`WhatsApp message sent with SID: ${message.sid}`);
//               })
//               .catch((error) => {
//                 console.error(`Error sending WhatsApp message: ${error.message}`);
//               });

//               const userToken = {
//                 userId: user._id,
//                 email: user.email,
//                 password: user.password,
//                 title: user.title,
//                 name: user.name,
//                 age: user.age,
//                 weight: user.weight,
//                 height: user.height,
//                 country: user.country,
//                 country_code: user.country_code,
//                 country: user.country,
//                 goal: user.goal,
//                 hear_from: user.hear_from,
//               };

//               Users.findOneAndUpdate(
//                 { _id: user._id },
//                 { $set: { token: generateToken(userToken), last_login: dateTime } },
//                 { upsert: true },
//                 function (err, doc) {
//                   if (err) {
//                     throw err;
//                   } else {
//                     Users.findOne({ _id: user._id }).then((updatedUser) => {
//                       res.status(200).json({
//                         status: "1",
//                         message: "Successful!",
//                         respdata: updatedUser,
//                       });
//                     });
//                   }
//                 }
//               );
//             }
//           });
//         } else {
//           res.status(400).json({
//             status: "0",
//             message: "Password does not match!",
//             respdata: {},
//           });
//         }
//       });
//     }
//   });
// };

exports.getLogin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  //const { email, password, deviceid, devicename, fcm_token } = req.body;

  const { email, password, deviceid, devicename, fcm_token, phone_no } = req.body;

  let query = {};

  if (email) {
    query = { email, status: "0" };
  } else if (phone_no) {
    query = { phone_no, status: "0" };
  } else {
    return res.status(422).json({
      status: "0",
      message: "Email or phone number is required",
      respdata: {},
    });
  }

  Users.findOne(query).then((user) => {
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

      bcrypt.compare(password, user.password, (error, match) => {
        if (error) {
          res.status(400).json({
            status: "0",
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
         
          user.deviceid = deviceid;
          user.devicename = devicename;
          user.fcm_token = fcm_token;

          user.save((err) => {
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
                weight: user.weight,
                height: user.height,
                country: user.country,
                country_code: user.country_code,
                country: user.country,
                goal: user.goal,
                hear_from: user.hear_from,
              };

              Users.findOneAndUpdate(
                { _id: user._id },
                { $set: { token: generateToken(userToken), last_login: dateTime } },
                { upsert: true },
                function (err, doc) {
                  if (err) {
                    throw err;
                  } else {
                    Users.findOne({ _id: user._id }).then((updatedUser) => {
                      res.status(200).json({
                        status: "1",
                        message: "Successful!",
                        respdata: updatedUser,
                      });
                    });
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

exports.getProfile = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user) {
      res.status(400).json({
        status: "0",
        message: "User does not exist!",
        respdata: {},
      });
    } else {
      
      user.image = req.baseUrl + "/images/" + "test.jpg";
      res.status(400).json({
        status: "1",
        message: "Detalis Found!",
        respdata: user,
      });
    }
  });
};

exports.editProfile = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      var updData = {
        title: req.body.title,
        name: req.body.name,
        phone_no : req.body.phone_no,
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
                message: "Successfully updated!",
                respdata: user,
              });
            });
          }
        }
      );
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

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
      const imgData = req.body.img_base64;
      const folderPath = "./public/images/";
      const path = Date.now() + ".png";
    
      fs.writeFileSync(folderPath + path, imgData, "base64", function (err) {
        console.log(err);
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
              });
            });
          }
        }
      );
    }
  });
};

exports.getLogout = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
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
                message: "Successfully logged out!",
                respdata: user,
              });
            });
          }
        }
      );
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

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else { 
     bcrypt.compare(req.body.old_password, user.password, (error, match) => {
        if (error) {
          res.status(400).json({
            status: "0",
            message: "Error!",
            respdata: error,
          });
        } else if (match) {
          bcrypt.compare(
            req.body.new_password,
            user.password,
            (error, match) => {
              if (error) {
                res.status(400).json({
                  status: "0",
                  message: "Error!",
                  respdata: error,
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
                            });
                          }
                        );
                      }
                    }
                  );
                });
              } else {
                res.status(400).json({
                  status: "0",
                  message: "New password cannot be same as your Old password!",
                  respdata: {},
                });
              }
            }
          );
        } else {
          res.status(400).json({
            status: "0",
            message: "Old password does not match!",
            respdata: {},
          });
        }
      });
    }
  });
};

exports.forgotPassword = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {
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
                respdata: user,
              });
            });
          }
        }
      );
    }
  });
};

exports.resetPassword = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findOne({ _id: req.body.user_id }).then((user) => {
    if (!user)
      res.status(404).json({
        status: "0",
        message: "User not found!",
        respdata: {},
      });
    else {

      if (user.forget_otp == req.body.otp) {
        bcrypt.hash(req.body.new_password, rounds, (error, hash) => {
          bcrypt.compare(req.body.repeat_password, hash, (error, match) => {
            if (error) {
              res.status(400).json({
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
                        message: "Successfully updated!",
                        respdata: user,
                      });
                    });
                  }
                }
              );
            } else {
              res.status(400).json({
                status: "0",
                message: "New and Repeat password does not match!",
                respdata: {},
              });
            }
          });
        });
      } else {
        res.status(400).json({
          status: "0",
          message: "OTP does not match!",
          respdata: {},
        });
      }
    }
  });
};

exports.deleteData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Users.findByIdAndDelete({ _id: ObjectId(req.body.user_id) }).then(
    (user) => {
      if (!user) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      } else {
        res.status(200).json({
          status: "1",
          message: "Deleted!",
          respdata: user,
        });
      }
    }
  );
};

exports.deleteuser = async function (req, res, next) {
  console.log('req.body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const { id } = req.body;

    const updatedData = await Users.findOneAndUpdate(
      { _id: id },
      { $set: { status: 1 } },
      { new: true }
    );
    

    if (!updatedData) {
      return res.status(404).json({
        status: "0",
        message: "User not found for deletion!",
        respdata: {},
      });
    }

    res.status(200).json({
      status: "1",
      message: "User deleted successfully!",
      respdata: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};

// +12565734549
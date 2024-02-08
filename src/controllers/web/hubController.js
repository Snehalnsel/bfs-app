var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const request = require('request');
const mime = require("mime");
const Hub = require("../../models/api/hubModel");
const Users = require("../../models/api/userModel");
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
const upload = multer({ dest: 'public/images/' }); 

// const email = 'cs@jalanbuilders.com';
// const shipPassword = 'Sweetu@2501';
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

async function generateSellerPickup(data) {
  try {
    const token = await generateToken(email, shipPassword);

    if (!token) {
      //console.error('Token not available. Call generateToken first.');
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
          resolve(responseBody);
        } else {
          reject(new Error(`Error in generateSellerPickup: ${response.statusCode}`));
        }
      });
    });
  } catch (error) {
    return Promise.reject(error);
  }
}


//methods
exports.getData = async function (req, res, next) {

  var pageName = "Hublist";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Hub.find().sort({ _id: -1 }).then((hub) => {
    res.render("pages/hublist/list", {
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      status: 0,
      message: "found!",
      respdata: {
        list: hub,
      },
    });
  });
};

exports.addData = async function (req, res, next) {

  var pageName = "Hub List";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  res.render("pages/hublist/create", {
    status: 1,
    siteName: req.app.locals.siteName,
    pageName: pageName,
    pageTitle: pageTitle,
    userFullName: req.session.user.name,
    userImage: req.session.user.image_url,
    userEmail: req.session.user.email,
    year: moment().format("YYYY"),
    requrl: req.app.locals.requrl,
    message: "",
    respdata: {},
  });
 
};

exports.createData = async function (req, res, next) {
  var pageName = "Hub";
  var pageTitle = req.app.locals.siteName + " - Add " + pageName;

  try {
    const hub = await Hub.findOne({ hub_name : req.body.hub_name }); 
    if (hub) {
      res.render("pages/hublist/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        pageName: pageName,
        pageTitle: pageTitle,
        year: moment().format("YYYY"),
        message: "Already exists!",
        requrl: req.app.locals.requrl,
        respdata: {},
      });
    } else {
      const newAddress = new Hub({
        name: req.body.name,
        phone_no: req.body.phone_no,
        email: req.body.email,
        street_name: req.body.street_name,
        address1: req.body.address1,
        landmark: req.body.landmark,
        city_name: req.body.city,
        state_name: req.body.state,
        pin_code: req.body.pincode,
        //gst_no: req.body.gst_name,
        hub_name: req.body.hub_name,
        created_dtime: dateTime,
      });
      const savedAddress = await newAddress.save();

      if(savedAddress)
      {
        const PickupData = {
          pickup_location: "BFS" + ' - ' + savedAddress.hub_name,
          name: "Pratiik Jalan",
          email: "cs@jalanbuilders.com",
          phone: "9830357255",
          address: savedAddress.street_name + ',' + savedAddress.address1,
          address_2: savedAddress.landmark,
          city: savedAddress.city_name,
          state: savedAddress.state_name,
          country: "India",
          pin_code: savedAddress.pin_code
        };
        const shiprocketResponse = await generateSellerPickup(PickupData);  
        if (shiprocketResponse) {
          savedAddress.shiprocket_address = "BFS" + ' - ' + savedAddress.hub_name;
          savedAddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
          await savedAddress.save();
        }
  
      }
  
      res.render("pages/hublist/create", {
        status: 0,
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        message: "Added!",
        requrl: req.app.locals.requrl,
        respdata: savedAddress,
      });
    }
  } catch (error) {
    res.render("pages/hublist/create", {
      status: 0,
      pageName: pageName,
      siteName: req.app.locals.siteName,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      pageTitle: pageTitle,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      message: "Error!",
      respdata: error,
    });
  }
};

exports.updateStatusData = async function (req, res, next) {
  const hubId = req.params.id;

  Hub.findById(hubId)
    .then((hub) => {
      if (!hub) {
        return res.status(404).json({
          status: "0",
          message: "Size not found!",
          respdata: {},
        });
      }

      // Toggle the status between 0 and 1
      hub.flag = hub.flag === 0 ? 1 : 0;

      // Save the updated size
      hub.save()
        .then((updatedHub) => {
          if (!updatedHub) {
            return res.status(404).json({
              status: "0",
              message: "Size status not updated!",
              respdata: {},
            });
          }

          res.redirect("/hublist");
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the size status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the size.",
        respdata: {},
      });
    });
};


exports.editData = async function (req, res, next) {
  
  var pageName = "Hub";
  var pageTitle = req.app.locals.siteName + " - Edit " + pageName;

  const hub_id = mongoose.Types.ObjectId(req.params.id);

  Hub.findOne({ _id: hub_id }).then((hub) => {
    res.render("pages/hublist/edit", {
      status: 1,
      siteName: req.app.locals.siteName,
      pageName: pageName,
      pageTitle: pageTitle,
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      message: "",
      respdata: {
        hub : hub,
      },
    });
  });
};

exports.updateData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Hub.findById(req.body.id).then(async (product) => {
    if (!product) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      var updData = {
        name: req.body.name,
        phone_no: req.body.phone_no,
        email: req.body.email,
        street_name: req.body.street_name,
        address1: req.body.address1,
        landmark: req.body.landmark,
        city_name: req.body.city,
        state_name: req.body.state,
        pin_code: req.body.pincode,
        gst_no: req.body.gst_name,
        hub_name: req.body.hub_name,
      };

      await Userproduct.findOneAndUpdate({ _id: req.body.product_id }, { $set: updData }, { upsert: true });

      res.redirect("/productlist");
    }
  }).catch((err) => {
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the product.",
      respdata: {},
    });
  });
};

// exports.deleteData = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   Category.findOne({ _id: req.body.category_id }).then((category) => {
//     if (!category) {
//       res.status(404).json({
//         status: "0",
//         message: "Not found!",
//         respdata: {},
//       });
//     } else {
      
//       Category.deleteOne(
//         { _id: req.body.category_id },
//         { w: "majority", wtimeout: 100 }
//       );

//       res.status(200).json({
//         status: "1",
//         message: "Deleted!",
//         respdata: category,
//       });
//     }
//   });
// };

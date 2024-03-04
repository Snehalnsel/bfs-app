var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Users = require("../../models/api/userModel");
const AddressBook = require("../../models/api/addressbookModel");
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
        //console.error('Error:', response.body);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function generateSellerPickup(data) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   //console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/settings/company/addpickup',
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
       //console.log(responseBody);
       //console.log("hi");
       const token = responseBody;
       resolve(token);
     } else {
       //console.error('Errottr:', response);
       reject(new Error(`Error: ${response.statusCode}`));
     }
   });
 });


}


// exports.addAddress = async function (req, res, next) {
//   console.log('req.body:', req.body);
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: "0",
//         message: "Validation error!",
//         respdata: errors.array(),
//       });
//     }

//     console.log(req.body.street_name);
//     const newAddress = new AddressBook({
//       user_id: req.body.user_id,
//       street_name: req.body.street_name,
//       address1: req.body.address1,
//       landmark: req.body.landmark,
//       city_name: req.body.city_name,
//       city_code: req.body.city_code,
//       state_name: req.body.state_name,
//       state_code: req.body.state_code,
//       pin_code: req.body.pin_code,
//       address_name: req.body.address_name,
//       flag: req.body.flag,
//       created_dtime: dateTime,
//     });

//     console.log(newAddress);

//     const savedAddress = await newAddress.save();

//     res.status(200).json({
//       status: "1",
//       message: "Address added successfully!",
//       respdata: savedAddress,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "0",
//       message: "Errorlll!",
//       respdata: error.message,
//     });
//   }
// };


exports.addAddress = async function (req, res, next) {
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    //console.log('req.body:', req.body);
    //console.log(req.body.street_name);
    const newAddress = new AddressBook({
      user_id: req.body.user_id,
      street_name: req.body.street_name,
      address1: req.body.address1,
      landmark: req.body.landmark,
      city_name: req.body.city_name,
      city_code: req.body.city_code,
      state_name: req.body.state_name,
      state_code: req.body.state_code,
      pin_code: req.body.pin_code,
      address_name: req.body.address_name,
      flag: req.body.flag,
      created_dtime: dateTime,
    });

    //console.log(newAddress);

    const savedAddress = await newAddress.save();
    const user = await Users.findById(req.body.user_id);

    const PickupData = {
      pickup_location: savedAddress.address_name + ' - ' + user.name,
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

    //console.log(PickupData);

    
      const shiprocketResponse = await generateSellerPickup(PickupData);

      //console.log(shiprocketResponse);

      if (shiprocketResponse) {
        savedAddress.shiprocket_address = savedAddress.address_name + ' - ' + user.name;
        savedAddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
        await savedAddress.save();

        return res.status(200).json({
          status: "1",
          message: "Address added successfully! Seller Pickup also created.",
          respdata: savedAddress,
          shiprocketdata : shiprocketResponse
        });
      } else {
        return res.status(200).json({
          status: "1",
          message: "Address added successfully! Seller Pickup creation failed.",
          respdata: savedAddress,
        });
      }
   
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Error occurred while adding address and processing Seller Pickup.",
      respdata: error.message,
    });
  }
};


exports.getAddressesByUser = async function (req, res, next) {
  //console.log('req.body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const { user_id } = req.body;

    //console.log(user_id);
    const addresses = await AddressBook.find({ user_id });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No addresses found for the user!",
        respdata: {},
      });
    }

    res.status(200).json({
      status: "1",
      message: "Addresses fetched successfully!",
      respdata: addresses,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};


exports.getAddressdetails = async function (req, res, next) {
  //console.log('req.body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const { addressbook_id } = req.body;

  
    const address = await AddressBook.findById(addressbook_id);

    if (!address) {
      return res.status(404).json({
        status: "0",
        message: "Address not found!",
        respdata: {},
      });
    }

    res.status(200).json({
      status: "1",
      message: "Address fetched successfully!",
      respdata: address,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};


exports.updateAddress = async function (req, res, next) {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    // const { addbook_id } = req.body.addressbook_id;

    const id = req.body.addressbook_id;


    const address = await AddressBook.findById(id);

    if (!address) {
      return res.status(404).json({
        status: "0",
        message: "Address not found!",
        respdata: {},
      });
    }

    address.street_name = req.body.street_name || address.street_name;
    address.address1 = req.body.address1 || address.address1;
    address.landmark = req.body.landmark || address.landmark;
    address.city_name = req.body.city_name || address.city_name;
    address.city_code = req.body.city_code || address.city_code;
    address.state_name = req.body.state_name || address.state_name;
    address.state_code = req.body.state_code || address.state_code;
    address.pin_code = req.body.pin_code || address.pin_code;
    address.address_name = req.body.address_name || address.address_name;
    address.flag = req.body.flag || address.flag;


    const updatedAddress = await address.save();

    res.status(200).json({
      status: "1",
      message: "Address updated successfully!",
      respdata: updatedAddress,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};


exports.deleteAddress = async function (req, res, next) {
  //console.log('req.body:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const { addbook_id } = req.body;

    const deletedAddress = await AddressBook.findOneAndDelete({ _id: addbook_id });

    if (!deletedAddress) {
      return res.status(404).json({
        status: "0",
        message: "Address not found for deletion!",
        respdata: {},
      });
    }

    res.status(200).json({
      status: "1",
      message: "Address deleted successfully!",
      respdata: deletedAddress,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};

exports.toggleDefaultStatus = async function (req, res, next) {
  try {
    const { user_id, addbook_id } = req.body;

    await AddressBook.updateMany({ user_id }, { $set: { default_status: 0 } });

    // Find the address by ID and set its default_status to 1
    const updatedAddress = await AddressBook.findOneAndUpdate(
      { _id: addbook_id },
      { $set: { default_status: 1 } },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        status: "0",
        message: "Address not found or does not belong to the specified user!",
        respdata: {},
      });
    }

    res.status(200).json({
      status: "1",
      message: "Default status toggled successfully!",
      respdata: updatedAddress,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};



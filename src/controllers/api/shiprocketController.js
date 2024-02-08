var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const request = require('request');
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
const Cart = require('../../models/api/cartModel');
const CartDetail = require('../../models/api/cartdetailsModel');
const Users = require("../../models/api/userModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Order = require("../../models/api/orderModel");
const AddressBook = require("../../models/api/addressbookModel");
const nodemailer = require("nodemailer");
// const axios = require('axios');
// const bodyParser = require('body-parser'); 
const smtpUser = "sneha.lnsel@gmail.com";

const transporter = nodemailer.createTransport({
  port: 465, 
  host: "smtp.gmail.com",
  auth: {
    user: smtpUser,
    pass: "iysxkkaexpkmfagh",
  },
  secure: true,
});


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


async function generateAWBno(shipment_id,courier_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/courier/assign/awb',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify({
    shipment_id,
    courier_id
  })
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

async function generateCouriresList() {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'GET',
   url: baseUrl+'/courier/courierListWithCounts',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   }
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

async function generateCouriresServiceability(shipment_id,pickup_postcode,delivery_postcode,cod,weight) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
  method: 'GET',
  url: `${baseUrl}/courier/serviceability/?shipment_id=${shipment_id}&pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
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


async function generateRequestShipmentPickup(shipment_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
  method: 'POST',
  url: baseUrl+'/courier/generate/pickup',
  headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    "shipment_id": [
      shipment_id
    ]
 })
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


async function generateOrderList(optionalParams = {}) {
  token = await generateToken(email, shipPassword);

  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  
  const queryParams = [];

  for (const key in optionalParams) {
    if (optionalParams[key] !== undefined) {
      queryParams.push(`${key}=${encodeURIComponent(optionalParams[key])}`);
    }
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

  const apiUrl = baseUrl + '/orders' + queryString;

  const options = {
    method: 'GET',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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


async function generateOrderDetails(shiproket_orderid) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/orders/show/${shiproket_orderid}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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


async function generateOrderDetails(shiproket_orderid) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/orders/show/${shiproket_orderid}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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

async function trackbyawbid(pickup_awb) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track/awb/${pickup_awb}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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

async function trackbyaorderid(order_id){
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const channel_id = 12345;
  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track?order_id=${order_id}&channel_id=${channel_id}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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

async function trackbyshipmentid(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track/shipment/${shipment_id}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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


async function cancelshipmentbyshipmentid(pickup_awb) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/orders/cancel/shipment/awbs',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify({
    "awbs": [
      pickup_awb
    ]
  })
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

async function allShipmentData() {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'GET',
   url: baseUrl+'/shipments',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   }
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


async function SpecificShipmentDeatils(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/shipments/${shipment_id}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
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


async function generateManifest(shipment_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/manifests/generate',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify({
    "shipment_id": [
      shipment_id
    ]
  })
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

async function generateLabel(shipment_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/courier/generate/label',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify({
    "shipment_id": [
      shipment_id
    ]
  })
 };


 return new Promise((resolve, reject) => {
   request(options, function (error, response, body) {
     if (error) {
       reject(error);
     } else if (response.statusCode === 200) {
       const responseBody = JSON.parse(body);
       console.log("hi");
       const token = responseBody;
       resolve(token);
     } else {
       console.error('Errottr:', response);
       reject(new Error(`Error: ${response.statusCode}`));
     }
   });
 });


}


async function generateInvoice(order_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/orders/print/invoice',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: JSON.stringify({
    "ids": [
      order_id
    ]
  })
 };

 console.log(options);

 return new Promise((resolve, reject) => {
   request(options, function (error, response, body) {
     if (error) {
       reject(error);
     } else if (response.statusCode === 200) {
       const responseBody = JSON.parse(body);
       console.log(responseBody);
       console.log("hi");
       const token = responseBody;
       resolve(token);
     } else {
       console.error('Errottr:', response);
       reject(new Error(`Error: ${response.statusCode}`));
     }
   });
 });


}

exports.getAWBnoById = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    if(existingOrder)
    {

      const shipment_id = existingOrder.shiprocket_shipment_id;
      
      // const courier_id = "225";
      const courier_id = "1";

      const shiprocketResponse = await generateAWBno(shipment_id,courier_id);

      if (shiprocketResponse) {
            
        existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code; 
        
        await existingOrder.save();
      }

      res.status(200).json({
        status: "1",
        message: "Order AWB Number generated successfully!",
        respdata: existingOrder,
        shiprocketResponse: shiprocketResponse
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getListOfCourires = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }
  try {
   
     const shiprocketResponse = await generateCouriresList();

     if(shiprocketResponse)
     {
      res.status(200).json({
        status: "1",
        message: "Courioes List Fetch successfully!",
        shiprocketResponse: shiprocketResponse
      });
     }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getCourierServiceability = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    if(existingOrder)
    {

      const billingaddress = await AddressBook.findById(existingOrder.billing_address_id);
      const selleraddress = await AddressBook.findById(existingOrder.shipping_address_id);

      const shipment_id = existingOrder.shiprocket_shipment_id;
      const pickup_postcode = billingaddress.pin_code;
      const delivery_postcode = selleraddress.pin_code;
      const cod = "1";

      const weight = "2";
    
      const shiprocketResponse = await generateCouriresServiceability(shipment_id,pickup_postcode,delivery_postcode,cod,weight);

      res.status(200).json({
        status: "1",
        message: "Order canceled successfully!",
        respdata: existingOrder,
        shiprocketResponse: shiprocketResponse
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getShipmentPickup = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    if(existingOrder)
    {
      const shipment_id = existingOrder.shiprocket_shipment_id;
    
      const shiprocketResponse = await generateRequestShipmentPickup(shipment_id);

      if(shiprocketResponse)
      {
        existingOrder.pickup_token_number = shiprocketResponse.response.pickup_token_number;
        existingOrder.pickup_dtime = shiprocketResponse.response.pickup_scheduled_date;

        await existingOrder.save();
      }

      res.status(200).json({
        status: "1",
        message: "Order canceled successfully!",
        respdata: existingOrder,
        shiprocketResponse: shiprocketResponse
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getAllOrderList = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const optionalParams = {};

    if (req.body.sort) {
      optionalParams.sort = req.body.sort;
    }
    if (req.body.sort_by) {
      optionalParams.sort_by = req.body.sort_by;
    }
    if (req.body.filter_by) {
      optionalParams.filter_by = req.body.filter_by;
    }
    if (req.body.to) {
      optionalParams.to = req.body.to;
    }
    if (req.body.from) {
      optionalParams.from = req.body.from;
    }
    if (req.body.filter) {
      optionalParams.filter = req.body.filter;
    }
    if (req.body.search) {
      optionalParams.search = req.body.search;
    }
    if (req.body.pickup_location) {
      optionalParams.pickup_location = req.body.pickup_location;
    }
    if (req.body.channel_id) {
      optionalParams.channel_id = req.body.channel_id;
    }
    

    if (!optionalParams) {
      return res.status(404).json({
        status: "0",
        message: "No Parameters are found!",
        respdata: {},
      });
    }
  
      const shiprocketResponse = await generateOrderList(optionalParams);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getOrderDetail = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shiproket_orderid = existingOrder.shiprocket_order_id;

      const shiprocketResponse = await generateOrderDetails(shiproket_orderid);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getTrackByAWB = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    pickup_awb = existingOrder.pickup_awb;

      const shiprocketResponse = await trackbyawbid(pickup_awb);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getTrackByorderid = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
     order_id = existingOrder.shiprocket_order_id;

      const shiprocketResponse = await trackbyaorderid(order_id);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getTrackByshipmentid = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shipment_id = existingOrder.shiprocket_shipment_id;

      const shiprocketResponse = await trackbyshipmentid(shipment_id);

      res.status(200).json({
        status: "1",
        message: "Details fetched successfully!",
        shiprocketResponse: shiprocketResponse
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getCancelShipment = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    pickup_awb = existingOrder.pickup_awb;

      const shiprocketResponse = await cancelshipmentbyshipmentid(pickup_awb);

      if(shiprocketResponse)
      {
          pickup_awb = 0;

        res.status(200).json({
          status: "1",
          message: "Details fetched successfully!",
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getAllShipmentDetails = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

      const shiprocketResponse = await allShipmentData();

      if(shiprocketResponse)
      {
        res.status(200).json({
          status: "1",
          message: "All Shipment Details fetched successfully!",
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getParticularShipmentDetails = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shipment_id = existingOrder.shiprocket_shipment_id;

      const shiprocketResponse = await SpecificShipmentDeatils(shipment_id);

      if(shiprocketResponse)
      {
        res.status(200).json({
          status: "1",
          message: "Specific Shipment Details fetched successfully!",
          oderdeatils : existingOrder,
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getGenerateManifest = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shipment_id = existingOrder.shiprocket_shipment_id;

      const shiprocketResponse = await generateManifest(shipment_id);

      if(shiprocketResponse)
      {
     
          // existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code; 
          
          // await existingOrder.save();
      
        res.status(200).json({
          status: "1",
          message: "Specific Shipment Details fetched successfully!",
          oderdeatils : existingOrder,
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getGenerateLabel = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    shipment_id = existingOrder.shiprocket_shipment_id;

      const shiprocketResponse = await generateLabel(shipment_id);

      if(shiprocketResponse)
      {
     
          // existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code; 
          
          // await existingOrder.save();
      
        res.status(200).json({
          status: "1",
          message: "Specific Shipment Details fetched successfully!",
          oderdeatils : existingOrder,
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.getGenerateInvoice = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
  
    order_id = existingOrder.shiprocket_order_id;

      const shiprocketResponse = await generateInvoice(order_id);

      if(shiprocketResponse)
      {
     
          // existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code; 
          
          // await existingOrder.save();
      
        res.status(200).json({
          status: "1",
          message: "Specific Shipment Details fetched successfully!",
          oderdeatils : existingOrder,
          shiprocketResponse: shiprocketResponse
        });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};

exports.ReturnToBuyer = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const orderId = req.body.order_id;

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    existingOrder.user_id = req.body.user_id || existingOrder.user_id;
    existingOrder.seller_id = req.body.seller_id || existingOrder.seller_id;
    existingOrder.cart_id = req.body.cart_id || existingOrder.cart_id;
    existingOrder.billing_address_id = req.body.billing_address_id || existingOrder.billing_address_id;
    existingOrder.shipping_address_id = req.body.shipping_address_id || existingOrder.shipping_address_id;
    existingOrder.total_price = req.body.total_price || existingOrder.total_price;
    existingOrder.payment_method = req.body.payment_method || existingOrder.payment_method;
    existingOrder.order_status = req.body.order_status || existingOrder.order_status;
    existingOrder.gst = req.body.gst || existingOrder.gst;
    existingOrder.delivery_charges = req.body.delivery_charges || existingOrder.delivery_charges;
    existingOrder.discount = req.body.discount || existingOrder.discount;
    existingOrder.pickup_status = req.body.pickup_status || existingOrder.pickup_status;
    existingOrder.delivery_status = req.body.delivery_status || existingOrder.delivery_status;

    existingOrder.updated_dtime = new Date().toISOString();

    const updatedOrder = await existingOrder.save();

    if(updatedOrder)
    {
      const seller = await Users.findById(updatedOrder.seller_id);
      // const user = await Users.findById(updatedOrder.user_id);
      const selleraddress = await AddressBook.findById(updatedOrder.billing_address_id);
      // = await AddressBook.findById(updatedOrder.shipping_address_id);

      const orderIdAsString = updatedOrder.shiprocket_order_id;

      const timestamp = updatedOrder.added_dtime;
      const datePart = timestamp.substr(0, 10);

      const street_name = selleraddress.street_name;
      const address1 = selleraddress.address1;
      const landmark = selleraddress.landmark;

     
      const full_address = `${street_name} ${address1} ${landmark}`;

      //shipping for who's product is & pickup is for the hub
      const orderData = {
       order_id : orderIdAsString,
       order_date: datePart,
       channel_id : "27202",
       pickup_customer_name : "BFS",
       pickup_last_name : "",
       company_name  : "BFS",
       pickup_address: "89, Brussla Streek, Ground Floor, Barabazar",
       pickup_address_2 : "",
       pickup_city : "Kolkata",
       pickup_state : "West Bengal",
       pickup_country : "India",
       pickup_pincode : "700007",
       pickup_email : "sneha.lnsel@gmail.com",
       pickup_phone : "7044289770",
       pickup_isd_code: "91",
       shipping_customer_name : "Jax",
       shipping_last_name : seller.name,
       shipping_address: full_address,
       shipping_address_2 : " ",
       shipping_city : selleraddress.city_name,
       shipping_country : "India",
       shipping_pincode : selleraddress.pin_code,
       shipping_state : "Uttarpardesh",
       shipping_email : "kumar.abhishek@shiprocket.com",
       shipping_isd_code : "91",
       shipping_phone : 8888888888,
       order_items: [
          {
            "sku": "WSH234",
            "name": "shoes",
            "units": 2,
            "selling_price": 100,
            "discount": 0,
            "qc_enable": true,
            "hsn": "123",
            "brand": "",
            "qc_size": "43"
          }
        ],
      payment_method: "PREPAID",
      total_discount : "0",
      sub_total : 400,
      length : 11,
      breadth : 11,
      height : 11,
      weight : 0.5
      };

        const shiprocketResponse = await updateOrder(orderData);

          console.log('JSON Response:', shiprocketResponse);

          if (shiprocketResponse) {
            
            const payment_status = '0';
            
            
            updatedOrder.shiprocket_payment_status = payment_status; 
            updatedOrder.shiprocket_order_id = shiprocketResponse.order_id;
            updatedOrder.shiprocket_shipment_id = shiprocketResponse.shipment_id;
            updatedOrder.shiprocket_status_code = shiprocketResponse.status_code;
        
            await updatedOrder.save();
          }

          res.status(200).json({
            status: "1",
            message: "Order updated!",
            respdata: updatedOrder,
            shiprocketResponse: shiprocketResponse
          });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};
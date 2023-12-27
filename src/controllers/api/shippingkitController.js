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
const Ordertracking = require("../../models/api/ordertrackModel");
const Track = require("../../models/api/trackingModel");
const Shippingkit = require("../../models/api/shippingkitModel");
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
        console.error('Error:', response.body);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}


async function generateOrderDetails(shiproket_orderid) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        console.log(responseBody);
        console.log("hi");
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Error:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyawbid(pickup_awb) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        console.log(responseBody);
        console.log("hi");
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Error:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyaorderid(order_id){
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        console.log(responseBody);
        console.log("hi");
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Error:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function trackbyshipmentid(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        console.log(responseBody);
        console.log("hi");
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Error:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}


async function cancelshipmentbyshipmentid(pickup_awb) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
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




exports.addData = async (req, res) => {
  try {
    const {
      buyer_id,
      product_id,
      order_id,
      total_price,
      payment_method,
    } = req.body;
    
    const billingaddress = await AddressBook.findOne({ user_id: buyer_id });
    
    if (!billingaddress) {
      return res.status(404).json({ message: 'Seller address not found' });
    }
    
    const billing_address_id = billingaddress._id;
    
    const order_details = await Order.findById(order_id);
    
    const track = await Ordertracking.findOne({ order_id: order_id, status: 1 }).exec();

    console.log(track);
    
    const hubaddress = await Track.findById(track.tracking_id)
      .populate('seller_id', 'name phone_no email')
      .populate('billing_address_id') 
      .populate('hub_address_id');
    
    console.log(hubaddress);

    if (!billingaddress) {
      return res.status(404).json({ message: 'Seller address not found' });
    }

    const hub_address_id = hubaddress._id;

    const existingOrdersCount = await Shippingkit.countDocuments();

    const orderCode = `BFSSHIPKIT${(existingOrdersCount + 1).toString().padStart(3, '0')}`;

    const order = new Shippingkit({
      track_code: orderCode, 
      seller_id : hubaddress.seller_id._id,
      product_id : product_id,
      billing_address_id : hubaddress.hub_address_id._id,
      shipping_address_id :hubaddress.billing_address_id._id,
      total_price,
      payment_method,
      order_status,
      added_dtime: new Date().toISOString(),
    });

    const savedOrder = await Shippingkit.save();
   if(savedOrder)
    {
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

      const productdetails  = await Userproduct.findById(hubaddress.product_id);

      const orderData = {
        order_id: orderCode, 
        order_date: new Date().toISOString(), 
        pickup_location: hubaddress.hub_address_id.shiprocket_address,
        channel_id: "", 
        comment: "BFS - Bid For Sale",
        billing_customer_name: hubaddress.hub_address_id.name,
        billing_last_name: "",
        billing_address: hubaddress.hub_address_id.street_name, 
        billing_address_2: hubaddress.hub_address_id.address1,
        billing_city: hubaddress.hub_address_id.city_name,
        billing_pincode: hubaddress.hub_address_id.pin_code,
        billing_state: "West Benagal", 
        billing_country: "India",
        billing_email:  hubaddress.hub_address_id.email, 
        billing_phone: hubaddress.hub_address_id.phone_no,
        shipping_is_billing: false, 
        shipping_customer_name: hubaddress.seller_id.name,
        shipping_last_name: "",
        shipping_address: hubaddress.billing_address_id.street_name,
        shipping_address_2:hubaddress.billing_address_id.address1, 
        shipping_city: hubaddress.billing_address_id.city_name, 
        shipping_pincode: hubaddress.billing_address_id.pin_code, 
        shipping_country: "India", 
        shipping_state: "West Benagal", 
        shipping_email: hubaddress.seller_id.email, 
        shipping_phone: hubaddress.seller_id.phone_no, 
        order_items: [
          {
            name: productdetails.name, 
            sku: "chakra123", 
            units: 1, 
            selling_price: hubaddress.total_price, 
            discount: "", 
            tax: "", 
            hsn: 12345678 
          }
        ],
        payment_method: "COD",
        shipping_charges: 0, 
        giftwrap_charges: 0, 
        transaction_charges: 0, 
        total_discount: 0,
        sub_total:hubaddress.total_price,
        length: productdetails.length, 
        breadth: productdetails.breath, 
        height: productdetails.height, 
        weight: productdetails.weight,
      };

          const shiprocketResponse = await generateOrder(orderData);

          console.log('JSON Response:', shiprocketResponse);

          res.status(200).json({
              status: "1",
            message: 'Order placed successfully',
            order: savedOrder
          });
          
    }

  } catch (error) {
    console.error('Error placing order:', error); 
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};

exports.addShipmentData = async (req, res) => {
  try {
    const {
      order_id,
      total_price,
      payment_method,
    } = req.body;
    
       
    const track = await Ordertracking.findOne({ order_id: order_id, status: 1 }).exec();

    if (!track) {
      return res.status(404).json({ message: 'Order Delivery Partner Not chosse yet' });
    }

    console.log(track);
    
    const hubaddress = await Track.findById(track.tracking_id)
      .populate('seller_id', 'name phone_no email')
      .populate('billing_address_id') 
      .populate('hub_address_id');
    
    console.log(hubaddress);
    console.log(hubaddress.seller_id._id);
    // return;

    if (!hubaddress) {
      return res.status(404).json({ message: 'Order Delivery Partner Not chosse yet' });
    }

    const orderCode = `BFSSHIPKIT${Date.now().toString()}`;

    const shippingkit = new Shippingkit({
      track_code: orderCode, 
      buyer_id : hubaddress.seller_id._id,
      product_id : hubaddress.product_id,
      //billing_address_id : hubaddress.hub_address_id._id,
      shipping_address_id :hubaddress.billing_address_id._id,
      order_id : order_id,
      total_price,
      payment_method,
      added_dtime: new Date().toISOString(),
    });

    const savedOrder = await shippingkit.save();
   if(savedOrder)
    {

      const updatedTrack = await Track.findOneAndUpdate(
        { _id: track.tracking_id },
        { $set: { shippingkit_status: 1 } },
        { new: true }
      );
    
      const user = await Users.findById(savedOrder.buyer_id);

      if(user.email)
      {
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
      }
          res.status(200).json({
              status: "1",
            message: 'Order placed successfully',
            order: savedOrder
          });
          
    }

  } catch (error) {
    console.error('Error placing order:', error); 
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};



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

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
const AddressBook = require("../../models/api/addressbookModel");
const Shippingkit = require("../../models/api/shippingkitModel");
const nodemailer = require("nodemailer");
// const axios = require('axios');
// const bodyParser = require('body-parser'); 
const smtpUser = "sneha.lnsel@gmail.com";

// const transporter = nodemailer.createTransport({
//   port: 465, 
//   host: "smtp.gmail.com",
//   auth: {
//     user: smtpUser,
//     pass: "iysxkkaexpkmfagh",
//   },
//   secure: true,
// });

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


const email = 'sneha.lnsel@gmail.com';
// const shipPassword = 'Sweetu@2501';
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

async function generateOrder(data) {
   token = await generateToken(email,shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl+'/orders/create/adhoc',
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


async function generateSellerPickup(data) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
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



async function generateLabel(shipment_id) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
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


async function updateOrder(data) {
  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }


 const options = {
   method: 'POST',
   url: baseUrl+'/orders/update/adhoc',
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

async function canceleOrder(order_id) {

  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }

//  console.log(order_id);
//  return;

 const options = {
   method: 'POST',
   url: baseUrl+'/orders/cancel',
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

 return new Promise((resolve, reject) => {
   request(options, function (error, response, body) {
     if (error) {
       reject(error);
     } else if (response.statusCode === 200) {
       const responseBody = "Deleted successfully";
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


async function updatePicupLocation(order_id,pickup_location) {

  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }

 const requestBody = {
  "order_id": [order_id],
  "pickup_location": pickup_location
};

const requestBodyString = JSON.stringify(requestBody);

 const options = {
   method: 'PATCH',
   url: baseUrl+'/orders/address/pickup',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: requestBodyString
 };

 return new Promise((resolve, reject) => {
   request(options, function (error, response, body) {
     if (error) {
       reject(error);
     } else if (response.statusCode === 200) {
       const responseBody = "Pickup location Updated";
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

async function updateDeliveryLocation(orderData) {

  token = await generateToken(email,shipPassword);
 if (!token) {
   console.error('Token not available. Call generateToken first.');
   return Promise.reject('Token not available. Call generateToken first.');
 }

const requestBodyString = JSON.stringify(orderData);

 const options = {
   method: 'POST',
   url: baseUrl+'/orders/address/update',
   headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
   },
   body: requestBodyString
 };

 return new Promise((resolve, reject) => {
   request(options, function (error, response, body) {
     if (error) {
       reject(error);
     } else if (response.statusCode === 200) {
       const responseBody = "Delivery location Updated";
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


async function generateOrderDetails(shiproket_orderid) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/orders/show/${shiproket_orderid}`, // Include shiproket_orderid in the URL
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


exports.generatepickupforseller = async (req, res) => {
  try {
    const {
      seller_id
    } = req.body;

      const seller = await Users.findById(seller_id);
      const billingaddress = await AddressBook.findOne({ user_id: seller_id });

      const PickupData = {
        pickup_location: billingaddress.address_name+ ' - ' +seller.name,
        name : seller.name,
        email : seller.email,
        phone : seller.phone_no,
        address : billingaddress.street_name+ ',' +billingaddress.address1,
        address_2 : billingaddress.landmark,
        city : billingaddress.city_name,
        state : billingaddress.state_name,
        country : "India",
        pin_code : billingaddress.pin_code
      };

      console.log(PickupData);

      if (!billingaddress.shiprocket_address && !billingaddress.shiprocket_picup_id) {
         const shiprocketResponse = await generateSellerPickup(PickupData);
      }
          if (shiprocketResponse) {
            billingaddress.shiprocket_address = billingaddress.address_name + ' - ' + seller.name;
            billingaddress.shiprocket_picup_id = shiprocketResponse.pickup_id;
            await billingaddress.save();
          
            res.status(200).json({
              message: 'Seller Pickup successfully',
              billingaddress: shiprocketResponse
            });
          } else {
            res.status(200).json({
              message: 'Seller Pickup failed',
              billingaddress: billingaddress
            });
          }

  } catch (error) {
    console.error('Error placing order:', error); 
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};

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

    console.log('req.body:', req.body);
    console.log(req.body.street_name);
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

    console.log(newAddress);

    const savedAddress = await newAddress.save();

    const user = await Users.findById(req.body.user_id);
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

    console.log(PickupData);

    
      const shiprocketResponse = await generateSellerPickup(PickupData);

      console.log(shiprocketResponse);

      if (shiprocketResponse) {
        savedAddress.shiprocket_address = pickupLocation;
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

exports.checkout = async (req, res) => {
  try {
    const {
      user_id,
      seller_id,
      cart_id,
      product_id,
      shipping_address_id,
      total_price,
      bid_price,
      payment_method,
      order_status,
      gst,
      delivery_charges,
      discount,
      pickup_status,
      delivery_status
    } = req.body;

    const billingaddress = await AddressBook.findOne({ user_id: seller_id });

    if (!billingaddress) {
      return res.status(404).json({ message: 'Seller address not found' });
    }

    const billing_address_id = billingaddress._id;

    // Find the count of existing orders or calculate it based on your requirements
    //const existingOrdersCount = await Order.countDocuments();

    // Generate a unique order code
    //const orderCode = `BFSORD${(existingOrdersCount + 1).toString().padStart(3, '0')}`;
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentSecond = now.getSeconds().toString().padStart(2, '0');
    const currentMillisecond = now.getMilliseconds().toString().padStart(3, '0');

    // Generate the unique code using the current time components
    const orderCode = `BFSORD${currentHour}${currentMinute}${currentSecond}${currentMillisecond}`;
    console.log(`Unique code: ${orderCode}`);
    
    // const orderCode = `BFSORD${Date.now().toString()}`;


    const order = new Order({
      order_code: orderCode, // Add the order code to the Order model
      user_id,
      seller_id,
      product_id,
      billing_address_id,
      shipping_address_id,
      total_price,
      bid_price,
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

      const updatedProduct = await Userproduct.findOneAndUpdate(
        { _id: product_id }, 
        { $set: { flag: 1 } }, 
        { new: true }
      );

    //   if(updatedProduct)
    //   {
    //     console.log(cart_id);
    //     const cleanedCartId =  mongoose.Types.ObjectId(cart_id); // Removes leading/trailing spaces
    //     const cartDetail = await CartDetail.findOne({ cart_id: cleanedCartId });

    //     console.log(cartDetail);
       
    //     if (cartDetail) {
    //       // The cartDetail exists, so it's safe to remove it
    //       await cartDetail.remove();
    //       // Continue with order placement logic
    //     }
    
    //     const cartDetailsCount = await CartDetail.countDocuments({ cart_id: savedOrder.cart_id });

    //     const existingCart = await Cart.findById(cart_id);
    
    //     if (cartDetailsCount === 0) {
    //       await existingCart.remove();
    //     }
    //   }    
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


exports.updateOrderById = async function (req, res, next) {
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
      const user = await Users.findById(updatedOrder.user_id);
      const billingaddress = await AddressBook.findById(updatedOrder.billing_address_id);
      const selleraddress = await AddressBook.findById(updatedOrder.shipping_address_id);

      const orderIdAsString = orderId;

      const orderData = {
        order_id: orderIdAsString, 
        order_date: new Date().toISOString(), 
        pickup_location: "BFS",
        channel_id: "", 
        comment: "Reseller: M/s Goku",
        billing_customer_name: user.name,
        billing_last_name: "",
        billing_address: billingaddress.street_name, 
        billing_address_2: billingaddress.address1,
        billing_city: billingaddress.city_name,
        billing_pincode: billingaddress.pin_code,
        billing_state: "West Benagal", 
        billing_country: "India",
        billing_email: user.email, 
        billing_phone: user.phone_no,
        shipping_is_billing: true, 
        shipping_customer_name: seller.name,
        shipping_last_name: "",
        shipping_address: selleraddress.street_name,
        shipping_address_2:selleraddress.address1, 
        shipping_city: selleraddress.city_name, 
        shipping_pincode: selleraddress.pin_code, 
        shipping_country: "India", 
        shipping_state: "West Benagal", 
        shipping_email: seller.email, 
        shipping_phone: seller.phone_no, 
        order_items: [
          {
            name: user.name, 
            sku: "chakra123", 
            units: 10, 
            selling_price: updatedOrder.total_price, 
            discount: "", 
            tax: "", 
            hsn: 441122 
          }
        ],
        payment_method: "Prepaid",
        shipping_charges: 0, 
        giftwrap_charges: 0, 
        transaction_charges: 0, 
        total_discount: 0,
        sub_total: updatedOrder.total_price,
        length: 0.5, 
        breadth: 0.5, 
        height: 0.5, 
        weight: 0.5,
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

exports.getOrderListByUser = async (req, res) => {
  try {
    let  user_id  = typeof req.body.user_id != "undefined"  ? req.body.user_id : "";
    

    const orders = await Order.find({ user_id: user_id }).populate('seller_id', 'name').populate('user_id', 'name');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }

    const ordersWithProductDetails = [];

    for (const order of orders) {
      const productDetails = await Userproduct.find({ _id: order.product_id });
      const productId = order.product_id.toString();
      const productImage = await Productimage.find({ product_id: productId }).limit(1);

      const orderDetails = {
        _id: order._id,
        total_price: order.total_price,
        payment_method: order.payment_method,
        order_status: order.order_status,
        gst: order.gst,
        seller_id: order.seller_id,
        user_id: order.user_id,
        product: {
          name: productDetails.length ? productDetails[0].name : 'Unknown Product',
          image: productImage.length ? productImage[0].image : 'No Image',
        }
      };

      ordersWithProductDetails.push(orderDetails);
    }

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: ordersWithProductDetails,
    });
  } catch (error) {
    console.error('Error fetching orders by seller:', error);
    res.status(500).json({ error: 'An error occurred while fetching orders' });
  }
};






exports.getOrdersBySeller = async (req, res) => {
  try {
    //const { seller_id } = req.body;
    
    let  seller_id  = req.body.length > 0 ? req.body : req.session.user.userId;

    const orders = await Order.find({ seller_id }).populate('seller_id', 'name').populate('user_id', 'name');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }

    const ordersWithProductDetails = [];

    for (const order of orders) {
      const productDetails = await Userproduct.find({ _id: order.product_id });
      const productId = order.product_id.toString();
      const productImage = await Productimage.find({ product_id: productId }).limit(1);

      // Check if there's any ShippingKit data for this order
      const shippingKitData = await Shippingkit.findOne({ order_id: order._id });

      const orderDetails = {
        _id: order._id,
        total_price: order.total_price,
        payment_method: order.payment_method,
        order_status: order.order_status,
        gst: order.gst,
        seller_id: order.seller_id,
        user_id: order.user_id,
        product: {
          name: productDetails.length ? productDetails[0].name : 'Unknown Product',
          image: productImage.length ? productImage[0].image : 'No Image',
        },
        shippingKit: shippingKitData || null, // Include ShippingKit data if available, otherwise null
      };

      ordersWithProductDetails.push(orderDetails);
    }

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: ordersWithProductDetails,
    });
  } catch (error) {
    console.error('Error fetching orders by seller:', error);
    res.status(500).json({ error: 'An error occurred while fetching orders' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'Order ID is missing in the request' });
    }

    const order = await Order.findById(order_id)
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

    const orderTrackStatusOne = await Ordertracking.find({ order_id, status: 1 });

    let shiprocketResponse = [];


    let shiprocketResponselabel = [];

    let shiprocketResponseinvoice = [];

    let shiprocketResponsefortracking = [];

    if (orderTrackStatusOne && orderTrackStatusOne.length > 0)  {
      const trackingId = orderTrackStatusOne[0].tracking_id;
      const trackDetails = await Track.findById(trackingId);

      if(trackDetails.shiprocket_shipment_id)
      {

        shiprocketResponselabel = await generateLabel(trackDetails.shiprocket_shipment_id);

        shiprocketResponseinvoice = await generateInvoice(trackDetails.shiprocket_order_id);
      }

      if (trackDetails.shiprocket_shipment_id) {
        shiprocketResponse = await generateOrderDetails(trackDetails.shiprocket_order_id);
      }

      if (trackDetails.shiprocket_shipment_id) {
        shiprocketResponsefortracking = await trackbyaorderid(trackDetails.shiprocket_order_id);
      }
  }

    const sellerAddress = await AddressBook.findOne({ user_id: order.seller_id });
    const buyerAddress = await AddressBook.findOne({ user_id: order.user_id });

    const shippingKitData = await Shippingkit.findOne({ order_id: order._id });

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
      },
      selleraddress: sellerAddress ? sellerAddress : 'No Buyer Address Found',
      product: {
        name: productDetails ? productDetails.name : 'Unknown Product',
        offer_price : productDetails ? productDetails.offer_price : 'Unknown Product',
        image: productImage ? productImage.image : 'No Image',
      },
    };

 
    res.status(200).json({
      message: 'Order details retrieved successfully',
      order: orderDetails,
      shiprocketResponse: shiprocketResponse.length > 0 ? shiprocketResponse : null,
      shiprocketResponsetrack: shiprocketResponsefortracking.length > 0 ? shiprocketResponsefortracking : null,
      shiprocketlabel: shiprocketResponselabel.length > 0 ? shiprocketResponselabel : null,
      shiprocketinvoice: shiprocketResponseinvoice.length > 0 ? shiprocketResponseinvoice : null,
      shippingKit: shippingKitData || null, 
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'An error occurred while fetching order details' });
  }
};



exports.cancelOrderById = async function (req, res, next) {
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
    
    existingOrder.delete_status = '1';

    existingOrder.updated_dtime = new Date().toISOString();

    const canceledOrder = await existingOrder.save();

    if (canceledOrder) {
      const shiprocketResponse = await canceleOrder(canceledOrder.shiprocket_order_id);
      
      if (shiprocketResponse.success) {
        
        await Order.findByIdAndDelete(orderId);
        
        res.status(200).json({
          status: "1",
          message: "Order canceled successfully!",
          respdata: canceledOrder,
          shiprocketResponse: shiprocketResponse
        });
      } else {
        
        res.status(400).json({
          status: "0",
          message: "Order cancellation failed!",
          respdata: canceledOrder,
          shiprocketResponse: shiprocketResponse
        });
      }
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



exports.changestatsByUser = async function (req, res, next) {
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
    const userId = req.body.user_id;
    
    const existingOrder = await Order.findOne({ _id: orderId, user_id: userId });
    
    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    existingOrder.order_status = '1';

    existingOrder. pickup_status = '2';

    existingOrder.updated_dtime = new Date().toISOString();

    const updateOrder = await existingOrder.save();

    if(updateOrder)
    {
      res.status(200).json({
        status: "1",
        message: "Order status successfully!",
        respdata: updateOrder,
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

exports.updatePickupAddessByOrderId = async function (req, res, next) {
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

    const shiprocket_orderId = req.body.shiprocket_orderid;
    const pickup_location = "SDF Building";

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    
    existingOrder.billing_address_id = req.body.billing_address_id || existingOrder.billing_address_id;

    existingOrder.updated_dtime = new Date().toISOString();

    const updatedOrder = await existingOrder.save();

    if(updatedOrder)
    {
        const shiprocketResponse = await updatePicupLocation(shiprocket_orderId,pickup_location);

          console.log('JSON Response:', shiprocketResponse);

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


exports.updateDeliveryaddressByOrderId = async function (req, res, next) {
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
    
    existingOrder.shipping_address_id = req.body.shipping_address_id || existingOrder.shipping_address_id;

    existingOrder.updated_dtime = new Date().toISOString();

    const updatedOrder = await existingOrder.save();

    if(updatedOrder)
    {

      const selleraddress = await AddressBook.findById(updatedOrder.shipping_address_id);

      const seller = await Users.findById(updatedOrder.seller_id);
      const user = await Users.findById(updatedOrder.user_id);

      const orderData = {
        "order_id": updatedOrder.shiprocket_order_id,
        "shipping_customer_name":  user.name,
        "shipping_phone":  user.phone_no,
        "shipping_address": selleraddress.street_name,
        "shipping_address_2": selleraddress.address1,
        "shipping_city": selleraddress.city_name,
        "shipping_state": selleraddress.state_name,
        "shipping_country": "India",
        "shipping_pincode": selleraddress.pin_code,
        "shipping_email":  user.email,
        "billing_alternate_phone": seller.phone_no
      };

        const shiprocketResponse = await updateDeliveryLocation(orderData);

          console.log('JSON Response:', shiprocketResponse);
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

// exports.checkout = async (req, res) => {
//   try {
//     const {
//       user_id,
//       seller_id,
//       cart_id,
//       product_id,
//       billing_address_id,
//       shipping_address_id,
//       total_price,
//       payment_method,
//       order_status,
//       gst,
//       delivery_charges,
//       discount,
//       pickup_status,
//       delivery_status
//     } = req.body;

//     const order = new Order({
//       user_id,
//       seller_id,
//       cart_id,
//       product_id,
//       billing_address_id,
//       shipping_address_id,
//       total_price,
//       payment_method,
//       order_status,
//       gst,
//       delivery_charges,
//       discount,
//       pickup_status,
//       delivery_status,
//       added_dtime: new Date().toISOString(), 
//     });

//     const savedOrder = await order.save();
 
//    if(savedOrder)
//     {
//       const seller = await Users.findById(savedOrder.seller_id);
//       const user = await Users.findById(savedOrder.user_id);
//       const billingaddress = await AddressBook.findOne({ user_id: savedOrder.seller_id });
//       const buyeraddress = await AddressBook.findOne({ user_id: savedOrder.user_id });

//       const orderIdAsString = savedOrder._id.toString();


//       const mailData = {
//         from: smtpUser,
//         to: user.email,
//         subject: "BFS - Bid For Sale  - Order Placed Successfully",
//         text: "Server Email!",
//         html:
//           "Hey " +
//           user.name +
//           ", <br> <p>Congratulations your order is placed.please wait for some times and the delivery details you will show on the app.</p>",
//       };

//       transporter.sendMail(mailData, function (err, info) {
//         if (err) console.log(err);
//         else console.log(info);
//       });

//       console.log(billingaddress);

//       // const orderData = {
//       //   order_id: orderIdAsString, 
//       //   order_date: new Date().toISOString(), 
//       //   pickup_location: "BFS",
//       //   channel_id: "", 
//       //   comment: "Reseller: M/s Goku",
//       //   billing_customer_name: user.name,
//       //   billing_last_name: "",
//       //   billing_address: billingaddress.street_name, 
//       //   billing_address_2: billingaddress.address1,
//       //   billing_city: billingaddress.city_name,
//       //   billing_pincode: billingaddress.pin_code,
//       //   billing_state: "West Benagal", 
//       //   billing_country: "India",
//       //   billing_email: user.email, 
//       //   billing_phone: user.phone_no,
//       //   shipping_is_billing: true, 
//       //   shipping_customer_name: seller.name,
//       //   shipping_last_name: "",
//       //   shipping_address: selleraddress.street_name,
//       //   shipping_address_2:selleraddress.address1, 
//       //   shipping_city: selleraddress.city_name, 
//       //   shipping_pincode: selleraddress.pin_code, 
//       //   shipping_country: "India", 
//       //   shipping_state: "West Benagal", 
//       //   shipping_email: seller.email, 
//       //   shipping_phone: seller.phone_no, 
//       //   order_items: [
//       //     {
//       //       name: user.name, 
//       //       sku: "chakra123", 
//       //       units: 10, 
//       //       selling_price: savedOrder.total_price, 
//       //       discount: "", 
//       //       tax: "", 
//       //       hsn: 441122 
//       //     }
//       //   ],
//       //   payment_method: "Prepaid",
//       //   shipping_charges: 0, 
//       //   giftwrap_charges: 0, 
//       //   transaction_charges: 0, 
//       //   total_discount: 0,
//       //   sub_total:savedOrder.total_price,
//       //   length: 0.5, 
//       //   breadth: 0.5, 
//       //   height: 0.5, 
//       //   weight: 0.5,
//       // };

//       const orderData = {
//         order_id: orderIdAsString, 
//         order_date: new Date().toISOString(), 
//         pickup_location: billingaddress.shiprocket_address,
//         channel_id: "", 
//         comment: "Reseller: M/s Goku",
//         billing_customer_name: seller.name,
//         billing_last_name: "",
//         billing_address: billingaddress.street_name, 
//         billing_address_2: billingaddress.address1,
//         billing_city: billingaddress.city_name,
//         billing_pincode: billingaddress.pin_code,
//         billing_state: "West Benagal", 
//         billing_country: "India",
//         billing_email: seller.email, 
//         billing_phone: seller.phone_no,
//         shipping_is_billing: true, 
//         shipping_customer_name: user.name,
//         shipping_last_name: "",
//         shipping_address: buyeraddress.street_name,
//         shipping_address_2:buyeraddress.address1, 
//         shipping_city: buyeraddress.city_name, 
//         shipping_pincode: buyeraddress.pin_code, 
//         shipping_country: "India", 
//         shipping_state: "West Benagal", 
//         shipping_email: user.email, 
//         shipping_phone: user.phone_no, 
//         order_items: [
//           {
//             name: user.name, 
//             sku: "chakra123", 
//             units: 10, 
//             selling_price: savedOrder.total_price, 
//             discount: "", 
//             tax: "", 
//             hsn: 441122 
//           }
//         ],
//         payment_method: "COD",
//         shipping_charges: 0, 
//         giftwrap_charges: 0, 
//         transaction_charges: 0, 
//         total_discount: 0,
//         sub_total:savedOrder.total_price,
//         length: 0.5, 
//         breadth: 0.5, 
//         height: 0.5, 
//         weight: 0.5,
//       };

//           const shiprocketResponse = await generateOrder(orderData);

//           console.log('JSON Response:', shiprocketResponse);

//           if (shiprocketResponse) {
            
//             const payment_status = '0';
            
//             savedOrder.shiprocket_payment_status = payment_status; 
//             savedOrder.shiprocket_order_id = shiprocketResponse.order_id;
//             savedOrder.shiprocket_shipment_id = shiprocketResponse.shipment_id;
//             savedOrder.shiprocket_status_code = shiprocketResponse.status_code;
        
//             await savedOrder.save();

//             const cartDetail = await CartDetail.findOne({
//               cart_id: cart_id,
//               product_id,
//               status: 0,
//             });
        
//             if (!cartDetail) {
//               return res.status(404).json({
//                 message: 'Product not found in cart',
//               });
//             }
//             await cartDetail.remove();
        
//             const cartDetailsCount = await CartDetail.countDocuments({ cart_id: cart_id });

//             const existingCart = await Cart.findById(cart_id);
        
//             if (cartDetailsCount === 0) {
//               await existingCart.remove();
//             }
//           }



//           res.status(200).json({
//             message: 'Order placed successfully',
//             order: savedOrder,
//             shiprocketResponse: shiprocketResponse
//           });
          
//     }

//   } catch (error) {
//     console.error('Error placing order:', error); 
//     res.status(500).json({ error: 'An error occurred while placing the order' });
//   }
// };
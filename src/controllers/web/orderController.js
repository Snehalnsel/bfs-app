var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const nodemailer = require('nodemailer');
const request = require('request');
const Category = require("../../models/api/categoryModel");
const Brand = require("../../models/api/brandModel");
const Size = require("../../models/api/sizeModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Cart = require('../../models/api/cartModel');
const Hublist = require('../../models/api/hubModel');
const CartDetail = require('../../models/api/cartdetailsModel');
const Users = require("../../models/api/userModel");
const Order = require("../../models/api/orderModel");
const Ordertracking = require("../../models/api/ordertrackModel");
const Track = require("../../models/api/trackingModel");
const Shippingkit = require("../../models/api/shippingkitModel");
const AddressBook = require("../../models/api/addressbookModel");

// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const ExcelJS = require('exceljs');
// var { getAllActiveSessions } = require("../../middlewares/redis");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
const upload = multer({ dest: 'public/images/' });
const smtpUser = "hello@bidforsale.com";

const transporter = nodemailer.createTransport({
  port: 465,
  host: "bidforsale.com",
  auth: {
    user: smtpUser,
    pass: "India_2023",
  },
  secure: true,
});


// const email = 'cs@jalanbuilders.com';
// const shipPassword = 'Sweetu@2501';
const email = 'sneha.lnsel@gmail.com';
const shipPassword = 'Jalan@2451';
const baseUrl = 'https://apiv2.shiprocket.in/v1/external';


function generateToken(email, password) {
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

async function generateCouriresList() {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'GET',
    url: baseUrl + '/courier/courierListWithCounts',
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

async function generateAWBno(shipment_id, courier_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl + '/courier/assign/awb',
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

async function generateOrder(data) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl + '/orders/create/adhoc',
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

exports.getOrderList = function (req, res, next) {
  var pageName = "Order List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  Order.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'seller_id',
        foreignField: '_id',
        as: 'seller',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'billing_address_id',
        foreignField: '_id',
        as: 'billing_address',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'shipping_address_id',
        foreignField: '_id',
        as: 'shipping_address',
      },
    },
    {
      $lookup: {
        from: 'mt_userproducts',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $lookup: {
        from: 'order_trackings',
        localField: '_id',
        foreignField: 'order_id',
        as: 'trackingDetails',
      },
    },
    {
      $lookup: {
        from: 'mt_tracks',
        localField: 'trackingDetails.tracking_id',
        foreignField: '_id',
        as: 'trackDetails',
      },
    },
    {
      $sort: {
        added_dtime: -1
      }
    }
  ]).exec(function (error, orderList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      const shipmentPromises = [];
      const imagePromises = [];

      orderList.forEach(function (order) {
        if (order.product && order.product.length > 0) {
          const product_id = order.product[0]._id;
          const imagePromise = Productimage.findOne({ product_id: product_id }).limit(1).exec();
          imagePromises.push(imagePromise);
        }

        const shipmentPromise = Shippingkit.findOne({ order_id: order._id });
        shipmentPromises.push(shipmentPromise);
      });

      orderList.forEach(function (order) {
        const shipment =  Shippingkit.findOne({ order_id:order._id});

        if(shipment)
        {
          order.shipment = shipment;
        }
      });

      
    Promise.all(shipmentPromises)
    .then((shipments) => {
      // Loop through orderList and associate shipments (if found) with respective orders
      orderList.forEach((order, index) => {
        if (shipments[index]) {
          order.shipment = shipments[index];
        } else {
          order.shipment = null; // Set as null or any default value for orders without shipments
        }
      });

      return Promise.all(imagePromises); // Proceed to fetch product images
    })
    .then((productImages) => {

          orderList.forEach((order, index) => {
            order.productImage = productImages[index];
          });
          res.render("pages/order/list", {
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            status: 0,
            message: "Found!",
            respdata: {
              list: orderList,
            },
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((err) => {
          res.status(500).json({ error: 'Error fetching product images' });
        });
    }
  });
};

exports.getOrderDetails = function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Order Details";
  var pageTitle = req.app.locals.siteName + " - " + pageName;
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  Order.findOne({ _id: orderId })
    .populate('user_id', 'name phone_no email')
    .populate('seller_id', 'name phone_no email')
    .populate('billing_address_id')
    .populate('shipping_address_id')
    .populate('hub_address_id')
    .then(async (orderDetails) => {
      if (!orderDetails) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const billingAddress = await AddressBook.find({ user_id: orderDetails.seller_id });
      const shippingAddress = await AddressBook.find({ user_id: orderDetails.user_id });

      const hubdata = await Hublist.find({ flag: 1 });

      const shiprocketResponse = await generateCouriresList();

      const cartId = orderDetails.cart_id;

      CartDetail.find({ cart_id: cartId })
        .populate('product_id', 'name')
        .then((cartDetails) => {
          res.render("pages/order/details", {
            status: 1,
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            message: "",
            respdata: {
              orderDetails: orderDetails,
              cartDetails: cartDetails[0],
              billingAddress: billingAddress,
              shippingAddress: shippingAddress,
              hublist: hubdata,
              shiprocketResponse: shiprocketResponse
            },
            isAdminLoggedIn:isAdminLoggedIn
          });
        })
        .catch((error) => {
          res.status(500).json({ error: 'An error occurred while fetching cart details' });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: 'An error occurred while fetching order details' });
    });

};

async function generateLabel(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl + '/courier/generate/label',
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

async function generateManifest(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'POST',
    url: baseUrl + '/manifests/generate',
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
async function generateInvoice(order_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl + '/orders/print/invoice',
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
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }


  const options = {
    method: 'POST',
    url: baseUrl + '/courier/generate/pickup',
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

async function generateCouriresServiceability(pickup_postcode, delivery_postcode, cod, weight) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}`,
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

exports.updateData = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  Order.findById(req.body.order_id).then(async (order) => {
    if (!order) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    } else {
      // var updData = {
      //   billing_address_id: req.body.seller_address,
      //   shipping_address_id: req.body.buyer_address,
      //   hub_address_id: req.body.hub_address,
      //   // shiprocket_delivery_partner: req.body.user_courier,
      // };
      const orderDetails = await Order.findById(req.body.order_id);
      if (!orderDetails) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const order_id = orderDetails._id;
      const order_code = orderDetails.order_code;
      const user_id = orderDetails.user_id;
      const seller_id = orderDetails.seller_id;
      const product_id = orderDetails.product_id;
      const billing_address_id = orderDetails.billing_address_id;
      const shipping_address_id = req.body.hub_address;
      const total_price = orderDetails.total_price;
      const payment_method = orderDetails.payment_method;
      const order_status = orderDetails.order_status;
      const gst = orderDetails.gst;
      const delivery_charges = orderDetails.delivery_charges;
      const discount = orderDetails.discount;
      const pickup_status = orderDetails.pickup_status;
      const delivery_status = orderDetails.delivery_status;
      const added_dtime = orderDetails.added_dtime;

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentSecond = now.getSeconds().toString().padStart(2, '0');
    const currentMillisecond = now.getMilliseconds().toString().padStart(3, '0');

    // Generate the unique code using the current time components
    const transactionCode = `BFSTRANS${currentHour}${currentMinute}${currentSecond}${currentMillisecond}`;
      const track = new Track({
        track_code: transactionCode,
        seller_id: seller_id,
        product_id: product_id,
        billing_address_id: billing_address_id,
        hub_address_id: req.body.hub_address,
        total_price: total_price,
        payment_method: payment_method,
        order_status: order_status,
        gst: gst,
        delivery_charges: delivery_charges,
        discount: discount,
        added_dtime: new Date().toISOString(),
      });

      const savedTrack = await track.save();

      if (savedTrack) {
        const track_id = savedTrack._id;

        const ordertracking = new Ordertracking({
          order_id: order_id,
          tracking_id: track_id,
          order_code: order_code,
          track_code: transactionCode,
          type: 0,
          added_dtime: new Date().toISOString(),
        });

        const savedOrdertrack = await ordertracking.save();

        if (savedOrdertrack) {
          return res.redirect("/orderlist");
        }
        else {
          return res.redirect("/orderlist");
        }
      }

      //await Order.findOneAndUpdate({ _id: req.body.order_id }, { $set: updData }, { upsert: true });

      res.redirect("/orderlist");
    }
  }).catch((err) => {;
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the product.",
      respdata: {},
      isAdminLoggedIn:isAdminLoggedIn
    });
  });
};

exports.getShipmentList = function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Shipment List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  var orderId = req.params.id;
  Order.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(orderId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'seller_id',
        foreignField: '_id',
        as: 'seller',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'billing_address_id',
        foreignField: '_id',
        as: 'billing_address',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'shipping_address_id',
        foreignField: '_id',
        as: 'shipping_address',
      },
    },
  ]).exec(function (error, orderList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.render("pages/order/shipmentlist", {
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        status: 0,
        message: "Found!",
        respdata: {
          list: orderList
        },
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  });
};


// exports.deleteData = async function (req, res, next) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: "0",
//         message: "Validation error!",
//         respdata: errors.array(),
//       });
//     }

//     const order = await Order.findOne({ _id: req.params.id });
//     if (!order) {
//       return res.status(404).json({
//         status: "0",
//         message: "Not found!",
//         respdata: {},
//       });
//     }

//     // await Order.deleteOne(
//     //   { _id: req.params.id },
//     //   { w: "majority", wtimeout: 100 }
//     // );
//     await Order.updateOne(
//       { _id: req.params.id },
//       { $set: { delete_status: 1 } },
//       { $set: { delete_by: 1 } },
//       { w: "majority", wtimeout: 100 }
//     );

//     const productIdToUpdateFlag = order.product_id;

//     // await Order.deleteOne(
//     //   { _id: req.params.id },
//     //   { w: "majority", wtimeout: 100 }
//     // );

//     await Userproduct.updateOne(
//       { _id: productIdToUpdateFlag }, 
//       { $set: { flag: 0 } }
//     );

//     res.redirect("/orderlist");
//   } catch (error) {

//     return res.status(500).json({
//       status: "0",
//       message: "Error occurred while deleting the category!",
//       respdata: error.message,
//     });
//   }
// };

exports.deleteData = async function (req, res, next) {
  try {
    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    await Order.updateOne(
      { _id: req.params.id },
      { $set: { delete_status: 1, delete_by: 1 } }, 
      { w: "majority", wtimeout: 100 }
    );

    const productIdToUpdateFlag = order.product_id;

    await Userproduct.updateOne(
      { _id: productIdToUpdateFlag }, 
      { $set: { flag: 0 } }
    );

    res.redirect("/orderlist");
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

// const orderId = req.params.id;

// if (!mongoose.Types.ObjectId.isValid(orderId)) {
//   return res.status(400).json({ error: 'Invalid order ID' });
// }

// Order.findOne({ _id: orderId })
//   .populate('user_id', 'name phone_no email') // Populate user details as needed
//   .populate('seller_id', 'name phone_no email') // Populate seller details as needed
//   .populate('billing_address_id') // Populate billing address details as needed
//   .populate('shipping_address_id') // Populate shipping address details as needed
//   .then((orderDetails) => {
//     if (!orderDetails) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
//     const cartId = orderDetails.cart_id;
//     CartDetail.find({ cart_id: cartId })
//       .populate('product_id', 'name')
//       .then((cartDetails) => {

//         res.render("pages/order/details", {
//           status: 1,
//           siteName: req.app.locals.siteName,
//           pageName: pageName,
//           pageTitle: pageTitle,
//           userFullName:  req.session.admin.name,
//           userImage:  req.session.admin.image_url,
//           userEmail:  req.session.admin.email,
//           year: moment().format("YYYY"),
//           requrl: req.app.locals.requrl,
//           message: "",
//           respdata: {
//             orderDetails: orderDetails,
//             cartDetails: cartDetails[0],
//           },
//         });
//       })
//       .catch((error) => {
//         res.status(500).json({ error: 'An error occurred while fetching cart details' });
//       });
//   })
//   .catch((error) => {
//     res.status(500).json({ error: 'An error occurred while fetching order details' });
//   });

exports.orderplaced = async (req, res) => {
  try {

    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const track_id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(track_id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // const orderDetails = await Order.findById({ _id: order_id })
    //   .populate('user_id', 'name phone_no email') 
    //   .populate('seller_id', 'name phone_no email')
    //   .populate('billing_address_id') 
    //   .populate('shipping_address_id') 
    //   .populate('hub_address_id');

    //   const orderDetails = await Order.findById({ _id: order_id })
    // .populate('user_id', 'name phone_no email') 
    // .populate('seller_id', 'name phone_no email')
    // .populate('billing_address_id') 
    // .populate('shipping_address_id') 
    // .populate({
    //   path: 'mt_track', // Assuming this is the field that refers to mt_track
    //   populate: {
    //     path: 'order_tracking', // Assuming this is the field that refers to order_tracking in mt_track
    //     model: 'order_tracking', // Replace 'order_tracking' with the actual model name if different
    //     populate: [
    //       { path: 'buyer_id', select: 'name phone_no email' },
    //       { path: 'seller_id', select: 'name phone_no email' },
    //       // Add more populate calls as needed for other fields in order_tracking
    //     ]
    //   }
    // });


    const orderDetails = await Track.findById({ _id: track_id })
      .populate('seller_id', 'name phone_no email')
      .populate('billing_address_id')
      .populate('hub_address_id');

    const productdetails = await Userproduct.findById(orderDetails.product_id);

    if (productdetails) {
      const orderData = {
        order_id: orderDetails.track_code,
        order_date: new Date().toISOString(),
        pickup_location: orderDetails.billing_address_id.shiprocket_address,
        channel_id: "",
        comment: "BFS - Bid For Sale",
        billing_customer_name: orderDetails.seller_id.name,
        billing_last_name: "",
        billing_address: orderDetails.billing_address_id.street_name,
        billing_address_2: orderDetails.billing_address_id.address1,
        billing_city: orderDetails.billing_address_id.city_name,
        billing_pincode: orderDetails.billing_address_id.pin_code,
        billing_state: "West Benagal",
        billing_country: "India",
        billing_email: orderDetails.seller_id.email,
        billing_phone: orderDetails.seller_id.phone_no,
        shipping_is_billing: false,
        shipping_customer_name: orderDetails.hub_address_id.name,
        shipping_last_name: "",
        shipping_address: orderDetails.hub_address_id.street_name,
        shipping_address_2: orderDetails.hub_address_id.address1,
        shipping_city: orderDetails.hub_address_id.city_name,
        shipping_pincode: orderDetails.hub_address_id.pin_code,
        shipping_country: "India",
        shipping_state: "West Benagal",
        shipping_email: orderDetails.hub_address_id.email,
        shipping_phone: orderDetails.hub_address_id.phone_no,
        order_items: [
          {
            name: productdetails.name,
            sku: "chakra123",
            units: 1,
            selling_price: productdetails.offer_price,
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
        sub_total: orderDetails.total_price,
        length: productdetails.length,
        breadth: productdetails.breath,
        height: productdetails.height,
        weight: productdetails.weight,
      };
      const shiprocketResponse = await generateOrder(orderData);
      if (shiprocketResponse) {

        const payment_status = '0';

        shiprocket_payment_status = payment_status;
        shiprocket_order_id = shiprocketResponse.order_id;
        shiprocket_shipment_id = shiprocketResponse.shipment_id;
        shiprocket_status_code = shiprocketResponse.status_code;


        orderDetails.shiprocket_payment_status = shiprocket_payment_status;
        orderDetails.shiprocket_order_id = shiprocket_order_id;
        orderDetails.shiprocket_shipment_id = shiprocket_shipment_id;
        orderDetails.shiprocket_status_code = shiprocket_status_code;

        await orderDetails.save();

      }
    }
    else {
      return res.status(404).json({ error: ' product Not found' });
    }
    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }
    else {
      const updatedOrderTracking = await Ordertracking.findOneAndUpdate(
        { tracking_id: track_id }, 
        { $set: { status: 1 } }, 
        { new: true } 
      );
      //res.redirect("/orderlist");
      res.redirect(`/check-Couriresserviceability/${track_id}`);
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};


exports.getAWBnoById = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
  try {
    const trackId = req.params.id;

    const courier_id = req.params.courier_company_id;

    const existingOrder = await Track.findById(trackId);

   

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    if (existingOrder) {
      const shipment_id = existingOrder.shiprocket_shipment_id;
      const shiprocketResponse = await generateAWBno(shipment_id, courier_id);
      if (shiprocketResponse) {

        if(shiprocketResponse.response.data.awb_code)
        {
          existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code;
          existingOrder.shiprocket_delivery_partner = shiprocketResponse.response.data.courier_company_id;
          existingOrder.shiprocket_courier_name = shiprocketResponse.response.data.transporter_name;
  
          await existingOrder.save();

          const shiprocketlabelResponse = await generateLabel(shipment_id);
          const order_id = existingOrder.shiprocket_order_id;
          const shiprocketinvoiceResponse = await generateInvoice(order_id);
          //const shiprocketManifestResponse = await generateManifest(shipment_id);

          const seller_details = await Users.findById(existingOrder.seller_id);

          if(seller_details)
          {
            const receiver_email = seller_details.email;

            if (shiprocketlabelResponse && shiprocketlabelResponse.label_url && shiprocketinvoiceResponse && shiprocketinvoiceResponse.invoice_url) {
              const labelUrl = shiprocketlabelResponse.label_url;
              const invoiceUrl = shiprocketinvoiceResponse.invoice_url;
              //const manifestUrl = shiprocketManifestResponse.manifest_url;
          
              sendEmailWithAttachment(receiver_email, labelUrl, invoiceUrl);
            }
          }

         

          res.redirect("/orderlist");
        }
        else
        {
          existingOrder.pickup_awb = "0";
          existingOrder.shiprocket_delivery_partner = "0";
          existingOrder.shiprocket_courier_name = "0";
  
          await existingOrder.save();

          res.redirect("/orderlist");
        }

      }


    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};


const sendEmailWithAttachment = async (receiverEmail, labelUrl,invoiceUrl) => {
const mailData = {
  from: smtpUser,
  to: receiverEmail,
  subject: 'Shipment Label and Invoice and Manifest',
  html: '<p>Please find the shipment label and invoice attached.</p>',
  attachments: [
    {
      filename: 'label.pdf',
      path: labelUrl,
      contentType: 'application/pdf',
    },
    {
      filename: 'invoice.pdf',
      path: invoiceUrl,
      contentType: 'application/pdf',
    }
  ],
};

  transporter.sendMail(mailData, function (err, info) {
    if (err) console.log(err);
  });

  try {
    await transporter.sendMail(mailData);
  } catch (error) {
    throw error;
  }
};

// module.exports = {
//   sendEmailWithAttachment,
// };


exports.getGenerateLabel = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  try {
    const trackId = req.params.id;
    const existingOrder = await Track.findById(trackId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const shipment_id = existingOrder.shiprocket_shipment_id;
    const shiprocketResponse = await generateLabel(shipment_id);

    if (shiprocketResponse && shiprocketResponse.label_url) {
      const labelUrl = shiprocketResponse.label_url;
      const outputFilePath = path.join(__dirname, 'downloaded_label.pdf');

      const file = fs.createWriteStream(outputFilePath);
      const request = https.get(labelUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            res.download(outputFilePath, 'label.pdf', (err) => {
              if (err) {
                return res.status(500).json({
                  status: "0",
                  message: "Error downloading the file!",
                  respdata: err,
                  isAdminLoggedIn:isAdminLoggedIn
                });
              }
              // File downloaded and response sent successfully
              fs.unlink(outputFilePath, (unlinkErr) => {
                if (unlinkErr) {
                }
              });
            });
          });
        });
      });

      request.on('error', (error) => {
        return res.status(500).json({
          status: "0",
          message: "Error downloading the file!",
          respdata: error,
          isAdminLoggedIn:isAdminLoggedIn
        });
      });
    } else {
      //alert('something went wrong'+ shiprocketResponse.response);

      return res.status(404).json({
        status: "0",
        message: "Label URL not found!",
        respdata: shiprocketResponse,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  } catch (error) {
    alert('something went wrong');
    // res.status(500).json({
    //   status: "0",
    //   message: "Error!",
    //   respdata: error,
    // });
  }
};


exports.getGenerateInvoice = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  try {
    const trackId = req.params.id;
    const existingOrder = await Track.findById(trackId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const order_id = existingOrder.shiprocket_order_id;
    const shiprocketResponse = await generateInvoice(order_id);

    if (!shiprocketResponse || !shiprocketResponse.invoice_url) {
      return res.status(404).json({
        status: "0",
        message: "Invoice not found!",
        respdata: shiprocketResponse,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    const invoiceUrl = shiprocketResponse.invoice_url;
    const outputFilePath = path.join(__dirname, 'downloaded_invoice.pdf');

    const file = fs.createWriteStream(outputFilePath);
    const request = https.get(invoiceUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          res.download(outputFilePath, 'invoice.pdf', (err) => {
            if (err) {
              return res.status(500).json({
                status: "0",
                message: "Error downloading the file!",
                respdata: err,
                isAdminLoggedIn:isAdminLoggedIn
              });
            }
            fs.unlink(outputFilePath, (unlinkErr) => {
              if (unlinkErr) {
              }
            });
          });
        });
      });
    });

    request.on('error', (error) => {
      return res.status(500).json({
        status: "0",
        message: "Error downloading the file!",
        respdata: error,
        isAdminLoggedIn:isAdminLoggedIn
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};



// exports.getCourierServiceability = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   try {
//     const orderId = req.params.id;

//     const existingOrder = await Order.findById(orderId);
//     if (!existingOrder) {
//       return res.status(404).json({
//         status: "0",
//         message: "Order not found!",
//         respdata: {},
//       });
//     }

//     if(existingOrder)
//     {

//       const billingaddress = await AddressBook.findById(existingOrder.billing_address_id);
//       const shippingaddress = await Hublist.findById(existingOrder.hub_address_id);

//       const shipment_id = existingOrder.shiprocket_shipment_id;
//       const pickup_postcode = billingaddress.pin_code;
//       const delivery_postcode = shippingaddress.pin_code;
//       const cod = "1";//for COD

//       const productdeatils = await Userproduct.findById(existingOrder.product_id);

//       let weight = 0; // Default value in case productdetails is null or undefined

//       if (productdeatils && productdeatils.weight) {
//         weight = productdeatils.weight;
//       }




//       const shiprocketResponse = await generateCouriresServiceability(shipment_id,pickup_postcode,delivery_postcode,cod,weight);

//       res.status(200).json({
//         status: "1",
//         message: "Order canceled successfully!",
//         respdata: existingOrder,
//         shiprocketResponse: shiprocketResponse
//       });
//     }
//   } catch (error) {
//     let errorMessage = '';
//     if (error.response && error.response.statusCode === 422) {
//       errorMessage = JSON.parse(error.response.body).message;
//     } else {
//       errorMessage = error.message || 'Unknown error occurred';
//     }

//     req.flash('error', errorMessage); // Store the error message in flash

//     res.redirect('/orderlist'); 
//   }
// };



exports.getCourierServiceability = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  var pageName = "Check Courier Serviceability";
  var pageTitle = req.app.locals.siteName + " - List " + pageName;

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  try {
    const trackId = req.params.id;

    const existingOrder = await Track.findById(trackId);
    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    if (existingOrder) {

      if (!existingOrder.shipping_address_id) {
        const billingaddress = await AddressBook.findById(existingOrder.billing_address_id);
        const shippingaddress = await Hublist.findById(existingOrder.hub_address_id);


        const shipment_id = existingOrder.shiprocket_shipment_id;
        const pickup_postcode = billingaddress.pin_code;
        const delivery_postcode = shippingaddress.pin_code;
        const cod = "1";

        const productdeatils = await Userproduct.findById(existingOrder.product_id);

        //const height = productdeatils.height;
        const weight = productdeatils.weight;
        //const weight = 0.05;

        const shiprocketResponse = await generateCouriresServiceability(pickup_postcode, delivery_postcode, cod, weight);
        if (shiprocketResponse.error) {
          return res.render("pages/order/serviceavabilitylist", {
            status: "0",
            message: "Order canceled successfully!",
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            message: "",
            respdata: existingOrder,
            error: shiprocketResponse.error
          });
        }

        res.render("pages/order/serviceavabilitylist", {
          status: "1",
          message: "Order canceled successfully!",
          siteName: req.app.locals.siteName,
          pageName: pageName,
          pageTitle: pageTitle,
          userFullName:  req.session.admin.name,
          userImage:  req.session.admin.image_url,
          userEmail:  req.session.admin.email,
          year: moment().format("YYYY"),
          requrl: req.app.locals.requrl,
          message: "",
          respdata: existingOrder,
          shiprocketResponse: shiprocketResponse,
          error: null,
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
      else {
        const billingaddress = await Hublist.findById(existingOrder.hub_address_id);
        const shippingaddress = await AddressBook.findById(existingOrder.shipping_address_id);

        const shipment_id = existingOrder.shiprocket_shipment_id;
        const pickup_postcode = billingaddress.pin_code;
        const delivery_postcode = shippingaddress.pin_code;
        const cod = "1";

        const productdeatils = await Userproduct.findById(existingOrder.product_id);

        const weight = productdeatils.weight;

        const shiprocketResponse = await generateCouriresServiceability(pickup_postcode, delivery_postcode, cod, weight);

        if (shiprocketResponse.error) {
          return res.render("pages/order/serviceavabilitylist", {
            status: "0",
            message: "Order canceled successfully!",
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName:  req.session.admin.name,
            userImage:  req.session.admin.image_url,
            userEmail:  req.session.admin.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            message: "",
            respdata: existingOrder,
            error: shiprocketResponse.error,
            isAdminLoggedIn:isAdminLoggedIn
          });
        }

        res.render("pages/order/serviceavabilitylist", {
          status: "1",
          message: "Order canceled successfully!",
          siteName: req.app.locals.siteName,
          pageName: pageName,
          pageTitle: pageTitle,
          userFullName:  req.session.admin.name,
          userImage:  req.session.admin.image_url,
          userEmail:  req.session.admin.email,
          year: moment().format("YYYY"),
          requrl: req.app.locals.requrl,
          message: "",
          respdata: existingOrder,
          shiprocketResponse: shiprocketResponse,
          error: null,
          isAdminLoggedIn:isAdminLoggedIn
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};


exports.getList = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  var pageName = "Schedule pickup";
  var pageTitle = req.app.locals.siteName + " - Schedule Your Pick Up " + pageName;

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  try {
    const orderId = req.params.id;
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.render("pages/order/list", {
        status: "0",
        message: "Order canceled successfully!",
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "not found",
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    if (existingOrder) {

      const billingaddress = await AddressBook.findById(existingOrder.billing_address_id);
      const shippingaddress = await Hublist.findById(existingOrder.hub_address_id);

      const shipment_id = existingOrder.shiprocket_shipment_id;

      res.render("pages/order/schedule", {
        status: "1",
        message: "Order canceled successfully!",
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "",
        respdata: existingOrder,
        billingaddress: billingaddress,
        shippingaddress: shippingaddress,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};

exports.getShipmentPickup = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
      isAdminLoggedIn:isAdminLoggedIn
    });
  }

  try {
    const trackId = req.params.id;

    const existingOrder = await Track.findById(trackId);
    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    if (existingOrder) {
      const shipment_id = existingOrder.shiprocket_shipment_id;
      const shiprocketResponse = await generateRequestShipmentPickup(shipment_id);
      if (shiprocketResponse) {
        existingOrder.pickup_token_number = shiprocketResponse.response.pickup_token_number;
        existingOrder.pickup_dtime = shiprocketResponse.response.pickup_scheduled_date;

        await existingOrder.save();
      }

      // res.status(200).json({
      //   status: "1",
      //   message: "Order canceled successfully!",
      //   respdata: existingOrder,
      //   shiprocketResponse: shiprocketResponse
      // });

      if (shiprocketResponse.error) {
        return res.render("pages/order/list", {
          status: "0",
          message: "Order canceled successfully!",
          siteName: req.app.locals.siteName,
          pageName: pageName,
          pageTitle: pageTitle,
          userFullName:  req.session.admin.name,
          userImage:  req.session.admin.image_url,
          userEmail:  req.session.admin.email,
          year: moment().format("YYYY"),
          requrl: req.app.locals.requrl,
          message: "",
          respdata: existingOrder,
          error: shiprocketResponse.error,
          isAdminLoggedIn:isAdminLoggedIn
        });
      }

      res.render("pages/order/list", {
        status: "1",
        message: "Order canceled successfully!",
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName:  req.session.admin.name,
        userImage:  req.session.admin.image_url,
        userEmail:  req.session.admin.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "",
        respdata: existingOrder,
        shiprocketResponse: shiprocketResponse,
        error: null,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};


exports.huborderplaced = async (req, res) => {
  try {

    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const orderid = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderid)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await Order.findById(orderid);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderTracking = await Ordertracking.findOne({ order_id: orderid, status: 1 })
      .populate('tracking_id');

    const order_id = order._id;
    const order_code = order.order_code;
    const buyer_id = order.user_id;
    // const seller_id = order.seller_id;
    const product_id = order.product_id;
    const shipping_address_id = order.shipping_address_id;
    const total_price = order.total_price;
    const payment_method = order.payment_method;
    const order_status = order.order_status;
    const gst = order.gst;
    const delivery_charges = order.delivery_charges;
    const discount = order.discount;
    const pickup_status = order.pickup_status;
    const delivery_status = order.delivery_status;
    const added_dtime = order.added_dtime;
    const billing_address_id = orderTracking.tracking_id.hub_address_id;

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

    const existingTransactionsCount = 10;

    const incrementedCount = existingTransactionsCount + 1;

    const transactionCode = `BFSTRANS${formattedDate}${incrementedCount.toString().padStart(2, '0')}`;



    const track = new Track({
      track_code: transactionCode,
      buyer_id: buyer_id,
      product_id: product_id,
      shipping_address_id: shipping_address_id,
      hub_address_id: billing_address_id,
      total_price: total_price,
      payment_method: payment_method,
      order_status: order_status,
      gst: gst,
      delivery_charges: delivery_charges,
      discount: discount,
      added_dtime: new Date().toISOString(),
    });

    const savedTrack = await track.save();


    const track_id = savedTrack._id;

    const ordertracking = new Ordertracking({
      order_id: order_id,
      tracking_id: track_id,
      order_code: order_code,
      track_code: transactionCode,
      type: 0,
      added_dtime: new Date().toISOString(),
    });

    const savedOrdertrack = await ordertracking.save();



    const orderDetails = await Track.findById({ _id: track_id })
      .populate('buyer_id', 'name phone_no email')
      .populate('shipping_address_id')
      .populate('hub_address_id');


    const productdetails = await Userproduct.findById(orderDetails.product_id);

    if (productdetails) {
      const orderData = {
        order_id: orderDetails.track_code,
        order_date: new Date().toISOString(),
        pickup_location: orderDetails.hub_address_id.shiprocket_address,
        channel_id: "",
        comment: "BFS - Bid For Sale",
        billing_customer_name: orderDetails.hub_address_id.name,
        billing_last_name: "",
        billing_address: orderDetails.hub_address_id.street_name,
        billing_address_2: orderDetails.hub_address_id.address1,
        billing_city: orderDetails.hub_address_id.city_name,
        billing_pincode: orderDetails.hub_address_id.pin_code,
        billing_state: "West Benagal",
        billing_country: "India",
        billing_email: orderDetails.hub_address_id.email,
        billing_phone: orderDetails.hub_address_id.phone_no,
        shipping_is_billing: false,
        shipping_customer_name: orderDetails.buyer_id.name,
        shipping_last_name: "",
        shipping_address: orderDetails.shipping_address_id.street_name,
        shipping_address_2: orderDetails.shipping_address_id.address1,
        shipping_city: orderDetails.shipping_address_id.city_name,
        shipping_pincode: orderDetails.shipping_address_id.pin_code,
        shipping_country: "India",
        shipping_state: "West Benagal",
        shipping_email: orderDetails.buyer_id.email,
        shipping_phone: orderDetails.buyer_id.phone_no,
        order_items: [
          {
            name: productdetails.name,
            sku: "chakra123",
            units: 1,
            selling_price: orderDetails.total_price,
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
        sub_total: orderDetails.total_price,
        length: productdetails.length,
        breadth: productdetails.breath,
        height: productdetails.height,
        weight: productdetails.weight,
      };

      const shiprocketResponse = await generateOrder(orderData);
      if (shiprocketResponse) {

        const payment_status = '0';

        shiprocket_payment_status = payment_status;
        shiprocket_order_id = shiprocketResponse.order_id;
        shiprocket_shipment_id = shiprocketResponse.shipment_id;
        shiprocket_status_code = shiprocketResponse.status_code;


        orderDetails.shiprocket_payment_status = shiprocket_payment_status;
        orderDetails.shiprocket_order_id = shiprocket_order_id;
        orderDetails.shiprocket_shipment_id = shiprocket_shipment_id;
        orderDetails.shiprocket_status_code = shiprocket_status_code;

        await orderDetails.save();

        const updatedOrderTracking = await Ordertracking.findOneAndUpdate(
          { tracking_id: track_id },
          { $set: { status: 2 } },
          { new: true }
        );

      }
    }
    else {
      return res.status(404).json({ error: ' product Not found' });
    }
    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }
    else {
      res.redirect("/orderlist");
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};

exports.downloadOrderExcel = function (req, res, next) {
  var pageName = "Order List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";

  Order.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'seller_id',
        foreignField: '_id',
        as: 'seller',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'billing_address_id',
        foreignField: '_id',
        as: 'billing_address',
      },
    },
    {
      $lookup: {
        from: 'addressbook_lists',
        localField: 'shipping_address_id',
        foreignField: '_id',
        as: 'shipping_address',
      },
    },
    {
      $lookup: {
        from: 'mt_userproducts',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $lookup: {
        from: 'order_trackings',
        localField: '_id',
        foreignField: 'order_id',
        as: 'trackingDetails',
      },
    },
    {
      $lookup: {
        from: 'mt_tracks',
        localField: 'trackingDetails.tracking_id',
        foreignField: '_id',
        as: 'trackDetails',
      },
    },
    {
      $sort: {
        added_dtime: -1
      }
    }
  ]).exec(async function (error, orderList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {
      try {
        // Create Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Order List');

        // Add headers to the worksheet
        worksheet.addRow([
          'Order ID',
          'User',
          'Seller',
          'Billing Address',
          'Shipping Address',
          'Product Name',
          // 'Product Image',
          'Product Price',
          'ShippingKit Status',
          'Status',
          'Payment Method',
          'Order Date',
        ]);

        orderList.forEach(order => {
          const buyerAddress = order.billing_address && order.billing_address.length > 0 ?
          `${order.billing_address[0].street_name}, ${order.billing_address[0].address1}, ${order.billing_address[0].landmark}, ${order.billing_address[0].city_name}, ${order.billing_address[0].state_name}` : '';
        const sellerAddress = order.shipping_address && order.shipping_address.length > 0 ?
          `${order.shipping_address[0].street_name}, ${order.shipping_address[0].address1}, ${order.shipping_address[0].landmark}, ${order.shipping_address[0].city_name}, ${order.shipping_address[0].state_name}` : '';
          const rowData = [
            order._id,
            order.user && order.user.length > 0 && order.user[0].name || '',
            order.seller && order.seller.length > 0 && order.seller[0].name || '',
            buyerAddress,
            sellerAddress,
            order.product && order.product.length > 0 && order.product[0].name || '',
            // order.productImage && order.productImage.image || '', 
            order.total_price,
            order.trackDetails[0] && order.trackDetails[0].shippingkit_status === 0 ? 'ShippingKit Ordered' : 'Not Ordered',
            order.bid_status === 0 ? 'Buy Now' : 'Won Bid',
            order.payment_method === 0 ? 'COD' : 'Online',
            order.added_dtime,
          ];
          worksheet.addRow(rowData);
        });

        // Set response headers to trigger file download in browser
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=order_list.xlsx');

        // Pipe workbook to response
        await workbook.xlsx.write(res);
        res.end();
      } catch (err) {
        console.error('Error generating Excel file:', err);
        res.status(500).json({ error: 'An error occurred while generating Excel file' });
      }
    }
  });
};

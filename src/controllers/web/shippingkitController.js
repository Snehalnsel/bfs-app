var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
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
const AddressBook = require("../../models/api/addressbookModel");
const Shippingkit = require("../../models/api/shippingkitModel");

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

//methods

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

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Shipping Kit List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Shippingkit.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'buyer_id',
        foreignField: '_id',
        as: 'buyer',
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
        from: 'hub_lists',
        localField: 'hub_address_id',
        foreignField: '_id',
        as: 'hub_address',
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
      $sort: {
        added_dtime: -1
      }
    }
  ]).exec(function (error, orderList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {

      const imagePromises = [];

      orderList.forEach(function (order) {
        if (order.product && order.product.length > 0) {
          const product_id = order.product[0]._id; // Assuming product_id is available in the order
          const imagePromise = Productimage.findOne({ product_id: product_id }).limit(1).exec();
          imagePromises.push(imagePromise);
        }
      });


      Promise.all(imagePromises)
        .then((productImages) => {

          orderList.forEach((order, index) => {
            order.productImage = productImages[index];
          });


          res.render("pages/shippingkit/list", {
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

exports.getShipmentKit = function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  var pageName = "Shipping Kit List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  const shipmentId = req.params.id;

  Shippingkit.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(shipmentId) // Filtering based on the shipment ID
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'buyer_id',
        foreignField: '_id',
        as: 'buyer',
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
        from: 'hub_lists',
        localField: 'hub_address_id',
        foreignField: '_id',
        as: 'hub_address',
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
      $sort: {
        added_dtime: -1
      }
    }
  ]).exec(function (error, orderList) {
    if (error) {
      res.status(500).json({ error: 'An error occurred' });
    } else {

      const imagePromises = [];

      orderList.forEach(function (order) {
        if (order.product && order.product.length > 0) {
          const product_id = order.product[0]._id; // Assuming product_id is available in the order
          const imagePromise = Productimage.findOne({ product_id: product_id }).limit(1).exec();
          imagePromises.push(imagePromise);
        }
      });


      Promise.all(imagePromises)
        .then((productImages) => {

          orderList.forEach((order, index) => {
            order.productImage = productImages[index];
          });


          res.render("pages/shippingkit/shipmentpage", {
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

exports.getHublist = async function (req, res, next) {

  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const pageName = "Select Hub List";
  const pageTitle = req.app.locals.siteName + " - " + pageName;
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const hubdata = await Hublist.find({ flag: 1 });

    const hubaddress = await Shippingkit.findById(orderId)
    .populate('buyer_id', 'name phone_no email')
    .populate('shipping_address_id') 
    .populate('hub_address_id');
  
   
    res.render("pages/shippingkit/details", {
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
        id: orderId,
        hublist: hubdata,
        trackdata : hubaddress
      },
      isAdminLoggedIn:isAdminLoggedIn
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
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
  try {
    const orderID = req.body.order_id;
    const hubAddressID = req.body.hub_address; 
    const shippingKit = await Shippingkit.findById(orderID);
    if (!shippingKit) {
      return res.status(404).json({
        status: "0",
        message: "Shipping kit not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
    shippingKit.hub_address_id = hubAddressID;
    await shippingKit.save();
    res.redirect("/admin/shippingkitlist"); 
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the shipping kit.",
      respdata: {},
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
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
    await Order.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    await Ordertracking.deleteMany({ order_id: req.params.id });

    // Delete the order from the Order table
    await Order.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    res.redirect("/admin/orderlist");
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

exports.kitorderplaced = async (req, res) => {
  try {

    let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
    const order_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const orderDetails = await Shippingkit.findById({ _id: order_id })
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

      }
    }
    else {
      return res.status(404).json({ error: ' product Not found' });
    }
    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }
    else {
      //res.redirect("/admin/orderlist");
      res.redirect(`/admin/couriresserviceability/${order_id}`);
    }


  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};


exports.checkCourierServiceability = async function (req, res, next) {

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
    const orderId = req.params.id;

    const existingOrder = await Shippingkit.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
        isAdminLoggedIn:isAdminLoggedIn
      });
    }

    if (existingOrder) {

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
          return res.render("pages/shippingkit/serviceavabilitylist", {
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

        res.render("pages/shippingkit/serviceavabilitylist", {
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
    const orderID = req.params.id;

    const courier_id = req.params.courier_company_id;

    const existingOrder = await Shippingkit.findById(orderID);

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
      const shiprocketResponse = await generateAWBno(shipment_id,courier_id);
      if (shiprocketResponse) {
        existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code;
        existingOrder.shiprocket_delivery_partner = shiprocketResponse.response.courier_company_id;
        await existingOrder.save();
        res.redirect("/admin/shippingkitlist");
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

exports.getGenerateLabelforkit = async function (req, res, next) {

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
    const orderId = req.params.id;
    const existingOrder = await Shippingkit.findById(orderId);

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
      return res.status(404).json({
        status: "0",
        message: "Label URL not found!",
        respdata: shiprocketResponse,
        isAdminLoggedIn:isAdminLoggedIn
      });
    }
  } catch (error) {
    //alert('something went wrong');
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
      isAdminLoggedIn:isAdminLoggedIn
    });
  }
};


exports.getGenerateInvoiceforkit = async function (req, res, next) {

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
    const orderId = req.params.id;
    const existingOrder = await Shippingkit.findById(orderId);

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
    const orderId = req.params.id;

    const existingOrder = await Shippingkit.findById(orderId);

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
        return res.render("pages/shippingkit/list", {
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

      res.render("pages/shippingkit/list", {
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
      res.redirect("/admin/orderlist");
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};
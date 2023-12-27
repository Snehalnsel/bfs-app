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
        console.error('Error:', response.body);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

async function generateCouriresList() {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        console.log(responseBody);
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Errottr:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });


}

async function generateAWBno(shipment_id, courier_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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

async function generateOrder(data) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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

exports.getOrderList = function (req, res, next) {
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
      console.error(error);
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

           console.log(orderList);

          res.render("pages/shippingkit/list", {
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName: req.session.user.name,
            userImage: req.session.user.image_url,
            userEmail: req.session.user.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            status: 0,
            message: "Found!",
            respdata: {
              list: orderList,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: 'Error fetching product images' });
        });
    }
  });
};

exports.getShipmentKit = function (req, res, next) {
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
      console.error(error);
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

           console.log(orderList);

          res.render("pages/shippingkit/shipmentpage", {
            siteName: req.app.locals.siteName,
            pageName: pageName,
            pageTitle: pageTitle,
            userFullName: req.session.user.name,
            userImage: req.session.user.image_url,
            userEmail: req.session.user.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            status: 0,
            message: "Found!",
            respdata: {
              list: orderList,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: 'Error fetching product images' });
        });
    }
  });
};

exports.getHublist = async function (req, res, next) {
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
      userFullName: req.session.user.name,
      userImage: req.session.user.image_url,
      userEmail: req.session.user.email,
      year: moment().format("YYYY"),
      requrl: req.app.locals.requrl,
      message: "",
      respdata: {
        id: orderId,
        hublist: hubdata,
        trackdata : hubaddress
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};

async function generateLabel(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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

async function generateRequestShipmentPickup(shipment_id) {
  token = await generateToken(email, shipPassword);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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

async function generateCouriresServiceability(pickup_postcode, delivery_postcode, cod, weight) {
  token = await generateToken(email, shipPassword);
  console.log(token);
  if (!token) {
    console.error('Token not available. Call generateToken first.');
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
        //  console.log(responseBody);
        //  console.log("hi");
        const token = responseBody;
        resolve(token);
      } else {
        console.error('Errottr:', response);
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });


}

exports.updateData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
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
      });
    }
    shippingKit.hub_address_id = hubAddressID;
    await shippingKit.save();

    res.redirect("/shippingkitlist"); // Redirect after successful update
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while updating the shipping kit.",
      respdata: {},
    });
  }
};

exports.getShipmentList = function (req, res, next) {
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
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    } else {

      console.log(orderList);
      res.render("pages/order/shipmentlist", {
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        status: 0,
        message: "Found!",
        respdata: {
          list: orderList
        },
      });
    }
  });
};


exports.deleteData = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const order = await Order.findOne({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }

    await Order.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    await OrderTracking.deleteMany({ order_id: req.params.id });

    // Delete the order from the Order table
    await Order.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    res.redirect("/orderlist");
  } catch (error) {

    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the category!",
      respdata: error.message,
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


//         console.log(cartDetails);
//         res.render("pages/order/details", {
//           status: 1,
//           siteName: req.app.locals.siteName,
//           pageName: pageName,
//           pageTitle: pageTitle,
//           userFullName: req.session.user.name,
//           userImage: req.session.user.image_url,
//           userEmail: req.session.user.email,
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
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while fetching cart details' });
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while fetching order details' });
//   });

exports.kitorderplaced = async (req, res) => {
  try {
    const order_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const orderDetails = await Shippingkit.findById({ _id: order_id })
      .populate('buyer_id', 'name phone_no email')
      .populate('shipping_address_id')
      .populate('hub_address_id');

      // console.log(orderDetails.hub_address_id.shiprocket_address);
      // return;

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

      console.log('JSON Response:', shiprocketResponse);

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
      //res.redirect("/orderlist");
      res.redirect(`/couriresserviceability/${order_id}`);
    }


  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};


exports.checkCourierServiceability = async function (req, res, next) {
  const errors = validationResult(req);
  var pageName = "Check Courier Serviceability";
  var pageTitle = req.app.locals.siteName + " - List " + pageName;

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
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
            userFullName: req.session.user.name,
            userImage: req.session.user.image_url,
            userEmail: req.session.user.email,
            year: moment().format("YYYY"),
            requrl: req.app.locals.requrl,
            message: "",
            respdata: existingOrder,
            error: shiprocketResponse.error
          });
        }

        res.render("pages/shippingkit/serviceavabilitylist", {
          status: "1",
          message: "Order canceled successfully!",
          siteName: req.app.locals.siteName,
          pageName: pageName,
          pageTitle: pageTitle,
          userFullName: req.session.user.name,
          userImage: req.session.user.image_url,
          userEmail: req.session.user.email,
          year: moment().format("YYYY"),
          requrl: req.app.locals.requrl,
          message: "",
          respdata: existingOrder,
          shiprocketResponse: shiprocketResponse,
          error: null
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
    const orderID = req.params.id;

    const courier_id = req.params.courier_company_id;

    const existingOrder = await Shippingkit.findById(orderID);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }
    if (existingOrder) {
      const shipment_id = existingOrder.shiprocket_shipment_id;


      const shiprocketResponse = await generateAWBno(shipment_id,courier_id);

      console.log(shiprocketResponse);

      if (shiprocketResponse) {

        existingOrder.pickup_awb = shiprocketResponse.response.data.awb_code;
        existingOrder.shiprocket_delivery_partner = shiprocketResponse.response.courier_company_id;

        await existingOrder.save();

        res.redirect("/shippingkitlist");
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

exports.getGenerateLabelforkit = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
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
                console.error('Error downloading the file:', err);
                return res.status(500).json({
                  status: "0",
                  message: "Error downloading the file!",
                  respdata: err,
                });
              }
              // File downloaded and response sent successfully
              fs.unlink(outputFilePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting the downloaded file:', unlinkErr);
                }
              });
            });
          });
        });
      });

      request.on('error', (error) => {
        console.error('Error downloading the file:', error);
        return res.status(500).json({
          status: "0",
          message: "Error downloading the file!",
          respdata: error,
        });
      });
    } else {
      console.error('shiprocketResponse');
      console.error(shiprocketResponse);
      //alert('something went wrong'+ shiprocketResponse.response);

      return res.status(404).json({
        status: "0",
        message: "Label URL not found!",
        respdata: shiprocketResponse,
      });
    }
  } catch (error) {
    console.error(error);
    //alert('something went wrong');
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getGenerateInvoiceforkit = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
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
      });
    }

    const order_id = existingOrder.shiprocket_order_id;
    const shiprocketResponse = await generateInvoice(order_id);

    if (!shiprocketResponse || !shiprocketResponse.invoice_url) {
      return res.status(404).json({
        status: "0",
        message: "Invoice not found!",
        respdata: shiprocketResponse,
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
              console.error('Error downloading the file:', err);
              return res.status(500).json({
                status: "0",
                message: "Error downloading the file!",
                respdata: err,
              });
            }
            // File downloaded and response sent successfully
            fs.unlink(outputFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting the downloaded file:', unlinkErr);
              }
            });
          });
        });
      });
    });

    request.on('error', (error) => {
      console.error('Error downloading the file:', error);
      return res.status(500).json({
        status: "0",
        message: "Error downloading the file!",
        respdata: error,
      });
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
    const orderId = req.params.id;

    const existingOrder = await Shippingkit.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({
        status: "0",
        message: "Order not found!",
        respdata: {},
      });
    }

    if (existingOrder) {
      const shipment_id = existingOrder.shiprocket_shipment_id;


      // if(date)
      // {
      //   const shiprocketResponse = await generateRequestShipmentPickup(shipment_id,date);

      // }

      const shiprocketResponse = await generateRequestShipmentPickup(shipment_id);

      console.log(shiprocketResponse);

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
          userFullName: req.session.user.name,
          userImage: req.session.user.image_url,
          userEmail: req.session.user.email,
          year: moment().format("YYYY"),
          requrl: req.app.locals.requrl,
          message: "",
          respdata: existingOrder,
          error: shiprocketResponse.error
        });
      }

      res.render("pages/shippingkit/list", {
        status: "1",
        message: "Order canceled successfully!",
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "",
        respdata: existingOrder,
        shiprocketResponse: shiprocketResponse,
        error: null
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


exports.getList = async function (req, res, next) {
  const errors = validationResult(req);
  var pageName = "Schedule pickup";
  var pageTitle = req.app.locals.siteName + " - Schedule Your Pick Up " + pageName;

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const orderId = req.params.id;

    const existingOrder = await Order.findById(orderId);

    console.log(orderId);

    if (!existingOrder) {
      return res.render("pages/order/list", {
        status: "0",
        message: "Order canceled successfully!",
        siteName: req.app.locals.siteName,
        pageName: pageName,
        pageTitle: pageTitle,
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "not found",
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
        userFullName: req.session.user.name,
        userImage: req.session.user.image_url,
        userEmail: req.session.user.email,
        year: moment().format("YYYY"),
        requrl: req.app.locals.requrl,
        message: "",
        respdata: existingOrder,
        billingaddress: billingaddress,
        shippingaddress: shippingaddress
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

exports.huborderplaced = async (req, res) => {
  try {
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

      console.log('JSON Response:', shiprocketResponse);

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
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
};
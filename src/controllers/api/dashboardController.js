var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
// const fs = require("fs");
const fs = require('fs-extra');
const mime = require("mime");
const ejs = require('ejs');
const { CompressImage } = require("../../models/thirdPartyApi/CompressImage");
const helper = require("../../helpers/helper");
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
const Appsettings = require("../../models/api/appSettingsModel");
const Users = require("../../models/api/userModel");
const Category = require("../../models/api/categoryModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
const Banner = require("../../models/api/bannerModel");
const Cart = require('../../models/api/cartModel');
const Notifications = require("../../models/api/notificationModel");
const sendSms = require("../../models/thirdPartyApi/sendSms");
const sendWhatsapp = require("../../models/thirdPartyApi/sendWhatsapp");
const ApiCallHistory = require("../../models/thirdPartyApi/ApiCallHistory");
// const Demo = require("../../models/api/demoModel");
const { create } = require('xmlbuilder2');
const { log } = require("console");

exports.homedetails = async function (req, res) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const requrl = req.protocol + '://' + req.get('host');
    const appSettings = await Appsettings.findOne();
    if (!appSettings) {
      return res.status(404).json({ message: 'App settings not found' });
    }
    const percentageFilter = parseInt(appSettings.best_deal);
    const products = await Userproduct.find({ percentage: { $gte: percentageFilter }, approval_status: 1, flag: 0 }); // Adding approval_status filter
    // if (!products || products.length === 0) {
    //   return res.status(404).json({ message: 'No products meet the percentage filter criteria' });
    // }
    const bestDealProducts = [];
    for (const product of products) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        bestDealProducts.push({
          _id: product._id,
          name: product.name,
          flag: (typeof product.flag != "undefined") ? product.flag : 0, //Added By Palash 13-01-2024
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage.image,
        });
      }
    }
    const hotProducts = await Userproduct.find({ approval_status: 1, flag: 0 }).sort({ hitCount: -1 });
    const whatsHotProducts = [];
    for (const product of hotProducts) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        whatsHotProducts.push({
          _id: product._id,
          name: product.name,
          flag: (typeof product.flag != "undefined") ? product.flag : 0,//Added By Palash 13-01-2024
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage.image,
        });
      }
    }
    const topCategories = await Category.find({ priority_status: 1 });
    const solditems = await Userproduct.find({
      approval_status: 1,
      flag: 1
    });
    const justSoldProducts = [];
    for (const product of solditems) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        justSoldProducts.push({
          _id: product._id,
          name: product.name,
          flag: (typeof product.flag != "undefined") ? product.flag : 0,//Added By Palash 13-01-2024
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage.image,
        });
      }
    }
    res.status(200).json({
      status: "1",
      message: "Dashboard details are here!",
      requrl: req.app.locals.requrl,
      respdata: {
        best_deal: bestDealProducts,
        whats_hot: whatsHotProducts,
        top_categories: topCategories,
        just_sold: justSoldProducts
      },
      isLoggedIn: isLoggedIn,
      helper: helper,
      fs: fs
    });
  } catch (error) {
    //console.error('Error fetching best deal and whats hot products with images:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWhatsHotProducts = async function (req, res) {
  const page = parseInt(req.body.page) || 1; // Current page, default: 1
  const pageSize = parseInt(req.body.pageSize) || 10; // Items per page, default: 10
  try {
    const hotProductsCount = await Userproduct.countDocuments({ approval_status: 1, flag: 0 });
    const totalPages = Math.ceil(hotProductsCount / pageSize);
    const hotProducts = await Userproduct.find({ approval_status: 1, flag: 0 })
      .sort({ hitCount: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const whatsHotProducts = [];
    for (const product of hotProducts) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        whatsHotProducts.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage.image,
        });
      }
    }
    return res.status(200).json({
      status: "1",
      message: "What's hot products",
      pagination: {
        totalItems: hotProductsCount,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize,
      },
      respdata: whatsHotProducts,
    });
  } catch (error) {
    //console.error('Error fetching what\'s hot products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getTopCategories = async function (req, res) {
  try {
    const topCategories = await Category.find({ priority_status: 1 }).sort({ name: 1 });
    return res.status(200).json({
      status: "1",
      message: "Top categories",
      respdata: topCategories,
    });
  } catch (error) {
    //console.error('Error fetching top categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTopCategoriesweb = async function (req, res) {
  try {
    const topCategories = await Category.find({ priority_status: { $in: [1, 2] } }) .sort({ name: 1 }); 

    return res.status(200).json({
      status: "1",
      message: "Top categories",
      respdata: topCategories,
    });
  } catch (error) {
    //console.error('Error fetching top categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getJustSoldProducts = async function (req, res) {
  const page= parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10; // Items per page, default: 10
  try {
    const soldItemsCount = await Userproduct.countDocuments({ approval_status: 1, flag: 1 });
    const totalPages = Math.ceil(soldItemsCount / pageSize);
    const solditems = await Userproduct.find({ approval_status: 1, flag: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const justSoldProducts = [];
    for (const product of solditems) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);
        justSoldProducts.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          offer_price: product.offer_price,
          original_packaging: product.original_packaging,
          original_invoice: product.original_invoice,
          status_name: productCondition ? productCondition._id : '',
          status: productCondition ? productCondition.name : '',
          image: productImage.image,
        });
      }
    }
    return res.status(200).json({
      status: "1",
      message: "Just sold products",
      pagination: {
        totalItems: soldItemsCount,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize,
      },
      respdata: justSoldProducts,
    });
  } catch (error) {

    //console.error('Error fetching just sold products:', error);

    return res.status(500).json({ message: 'Internal server error' });

  }

};

// exports.homedetails = async function (req, res) {

//   try {

//     const sortOrder = parseInt(req.body.sortOrder);



//     const appSettings = await Appsettings.findOne();



//     if (!appSettings) {

//       return res.status(404).json({ message: 'App settings not found' });

//     }



//     const percentageFilter = parseInt(appSettings.best_deal);



//     let products = await Userproduct.find({ percentage: { $gte: percentageFilter } });



//     if (!products || products.length === 0) {

//       return res.status(404).json({ message: 'No products meet the percentage filter criteria' });

//     }



//     console.log('Before Sorting:', products);



//     if (sortOrder === 1) {

//       products.sort((a, b) => parseFloat(b.offer_price) - parseFloat(a.offer_price));

//     } else if (sortOrder === 0) {

//       products.sort((a, b) => parseFloat(a.offer_price) - parseFloat(b.offer_price));

//     } else if (sortOrder === 2) {

//       products.sort((a, b) => new Date(b.added_dtime) - new Date(a.added_dtime));

//     }



//     console.log('After Sorting:', products);



//     const bestDealProducts = [];



//     for (const product of products) {

//       const productImage = await Productimage.findOne({ product_id: product._id });

//       if (productImage) {

//         bestDealProducts.push({

//           _id: product._id,

//           name: product.name,

//           price: product.price,

//           offer_price: product.offer_price,

//           image: productImage.image,

//         });

//       }

//     }



//     const hotProducts = await Userproduct.find().sort({ hitCount: -1 });



//     const whatsHotProducts = [];



//     for (const product of hotProducts) {

//       const productImage = await Productimage.findOne({ product_id: product._id });

//       if (productImage) {

//         whatsHotProducts.push({

//           _id: product._id,

//           name: product.name,

//           price: product.price,

//           offer_price: product.offer_price,

//           image: productImage.image,

//         });

//       }

//     }



//     res.status(200).json({

//       status: '1',

//       message: 'Dashboard details are here!',

//       respdata: {

//         best_deal: bestDealProducts,

//         whats_hot: whatsHotProducts,

//       },

//     });

//   } catch (error) {

//     console.error('Error fetching best deal and whats hot products with images:', error);

//     res.status(500).json({ message: 'Internal server error' });

//   }

// };

function extractFilename(url) {
  const matches = url.match(/\/([^\/?#]+)[^\/]*$/);
  if (matches && matches.length >= 2) {
    return matches[1]; 
  }
  return null;
}

exports.getData = async function (req, res, next) {
  try {
       //await copyAndCompressImageFolders();
    //const requrl = req.protocol + '://' + req.get('host');
    //SEND SMS
      /*await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
        if (err) {
          // return {
          //   status:false,
          //   data:err
          // };
        }
        //let obj = JSON.parse(data);
        let randNumber = Math.floor((Math.random() * 1000000) + 1);
        let smsData = {
          textId:"test",
          toMobile:"917044289770",
          text:"You have been tagged with an invoice "+randNumber+". Please use OTP "+randNumber+" for approving the invoice. Do not share your OTP with anyone. RJSSLT",
        };
        let returnData;
        returnData = await sendSms(smsData);
        const historyData = new ApiCallHistory({
          userId:mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"), 
          called_for:"sms",
          api_link:process.env.SITE_URL,
          api_param:smsData,
          api_response:returnData,
          send_status:'send',
        });
        await historyData.save();
      });*/
    //SEND SMS
    //SEND WHATSAPP
      /*const root = create({ version: '1.0',encoding:"ISO-8859-1" })
      .ele('MESSAGE', { VER: '1.2' })
        .ele('USER',{USERNAME:process.env.WP_SMS_USER_NAME,PASSWORD:process.env.WP_PASSWORD})
          .ele('SMS',{UDH:"0",CODING:"1",TEMPLATEINFO:"",TEXT:"Hi",MEDIADATA:"",MSGTYPE:"1",TYPE:"",CONTENTTYPE:"",PROPERTY:"0",ID:"1",TEMPLATE:"",EMAILTEXT:"", ATTACHMENT:""})
            .ele('ADDRESS',{FROM:process.env.WP_SMS_SENDER_MOBILE,TO:"918017757640",EMAIL:"",SEQ:"1",TAG:""})
        //.up()
      //.up();
    
      // convert the XML tree to string
      const xml = root.end({ prettyPrint: true });
      await fs.readFile('./api_send_message.json', 'utf8', async function (err, data) {
        if (err) {
          // return {
          //   status:false,
          //   data:err
          // };
        }
        //let obj = JSON.parse(data);
        //let randNumber = Math.floor((Math.random() * 1000000) + 1);
        let smsData = xml;
        let returnData;
        returnData = await sendWhatsapp(smsData);
        const historyData = await new ApiCallHistory({
          userId:mongoose.Types.ObjectId("650ae558f7a0625c3a4dcef6"), 
          called_for:"whatsapp",
          api_link:process.env.SITE_URL,
          api_param:smsData,
          api_response:returnData,
          send_status:'send',
        });
        await historyData.save();
      });*/
    //SEND WHATSAPP
    // const allImages = await Demo.find();
    // // Update each document with only the image name and save the changes
    // for (const image of allImages) {
    //   console.log(image.image)
    //   const imageName = extractFilename(image.image);
    //   image.image = imageName ? imageName : '';
    //  await image.save();
    // }
   // return;
    const userId = (typeof req.session.user != "undefined") ? req.session.user.userId : ""
    var cartCount = (userId != "") ? await Cart.countDocuments({ user_id: mongoose.Types.ObjectId(userId) }) : 0;
    const banner = await Banner.find({ status: 1 });
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const html = await ejs.renderFile("views/webpages/list.ejs", {
      helper: helper,
      websiteUrl: process.env.SITE_URL,
      title: "Home Page",
      message: "Welcome to the Dashboard page!",
      respdata: req.session.user,
      banner:banner,
      cart: cartCount,
      isLoggedIn: isLoggedIn,
    }, {async: true});
    res.send(html);
    // res.render("webpages/list", {
    //   title: "Home Page",
    //   websiteUrl: process.env.SITE_URL,
    //   requrl: req.app.locals.requrl,
    //   message: "Welcome to the Dashboard page!",
    //   cart: cartCount,
    //   isLoggedIn: isLoggedIn,
    //   banner:banner
    // });
  } catch (error) {
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};
exports.bannerlist = async function (req, res) {
  try {
    const banner = await Banner.find({ status: 1 });
    return res.status(200).json({
      status: "1",
      message: "Top categories",
      respdata: banner,
    });
  } catch (error) {
    //console.error('Error fetching top categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getHeaderData = async function (req, res, next) {
  try {
       //const requrl = req.protocol + '://' + req.get('host');
        let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
        const userId = (typeof req.session.user != "undefined") ? req.session.user.userId : ""
        var cartCount = (userId != "") ? await Cart.countDocuments({user_id: mongoose.Types.ObjectId(userId)}) : 0;
        var notificationCount = (userId !== "") ? 
        await Notifications.countDocuments({ user_id: mongoose.Types.ObjectId(userId), is_read: 0 }) : 
        0;    
         res.status(200).json({
             status: 1,
             message: "Count Increase",
             cart: cartCount,
             notification:notificationCount,
             isLoggedIn: isLoggedIn,
         });
  } catch (error) {
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while rendering the dashboard.",
      error: error.message,
    });
  }
};






















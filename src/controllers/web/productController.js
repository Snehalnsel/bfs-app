var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const https = require("https");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Category = require("../../models/api/categoryModel");
const Brand = require("../../models/api/brandModel");
const Size = require("../../models/api/sizeModel");
const Productsize = require("../../models/api/catsizeModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const url = require("url");
// var { getAllActiveSessions } = require("../../middlewares/redis");
const { check, validationResult } = require("express-validator");
// var uuid = require("uuid");
var crypto = require("crypto");
var randId = crypto.randomBytes(20).toString("hex");
const multer = require("multer");
const upload = multer({ dest: 'public/images/' });

// exports.getData = function (req, res, next) {
//   var pageName = "Product List";
//   var pageTitle = req.app.locals.siteName + " - " + pageName + " List";


//   Userproduct.aggregate([
//     {
//       $lookup: {
//         from: 'mt_categories',
//         localField: 'category_id',
//         foreignField: '_id',
//         as: 'category',
//       },
//     },
//     {
//       $lookup: {
//         from: 'mt_brands',
//         localField: 'brand_id',
//         foreignField: '_id',
//         as: 'brand',
//       },
//     },
//     {
//       $lookup: {
//         from: 'mt_sizes',
//         localField: 'size_id',
//         foreignField: '_id',
//         as: 'size',
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'user_id',
//         foreignField: '_id',
//         as: 'user',
//       },
//     },
//     {
//       $lookup: {
//         from: 'mt_product_images', 
//         let: { productId: '$_id' },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $eq: ['$product_id', '$$productId'] },
//             },
//           },
//           {
//             $limit: 1, 
//           },
//         ],
//         as: 'productImages',
//       },
//     },    
//     {
//       $lookup: {
//         from: 'mt_productconditions',
//         localField: 'status',
//         foreignField: '_id',
//         as: 'productCondition',
//       },
//     },
//     {
//       $unwind: '$category',
//     },
//     {
//       $lookup: {
//         from: 'mt_categories',
//         localField: 'category.parent_id',
//         foreignField: '_id',
//         as: 'category.parent'
//       }
//     }
//   ]).exec(function (error, productList) {
//     if (error) {
//       return res.status(500).json({ error: 'An error occurred' });
//     }
//     res.render("pages/product/list", {
//       siteName: req.app.locals.siteName,
//       pageName: pageName,
//       pageTitle: pageTitle,
//       userFullName: req.session.user.name,
//       userImage: req.session.user.image_url,
//       userEmail: req.session.user.email,
//       year: moment().format("YYYY"),
//       requrl: req.app.locals.requrl,
//       status: 0,
//       message: "found!",
//       respdata: {
//         list: productList
//       },
//     });
//   });

// };



exports.getData = function (req, res, next) {
  var pageName = "Product List";
  var pageTitle = req.app.locals.siteName + " - " + pageName + " List";

  Userproduct.aggregate([
    {
      $lookup: {
        from: 'mt_categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $lookup: {
        from: 'mt_brands',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand',
      },
    },
    {
      $lookup: {
        from: 'mt_sizes',
        localField: 'size_id',
        foreignField: '_id',
        as: 'size',
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
        from: 'mt_product_images',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$product_id', '$$productId'] },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: 'productImages',
      },
    },
    {
      $lookup: {
        from: 'mt_productconditions',
        localField: 'status',
        foreignField: '_id',
        as: 'productCondition',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'mt_categories',
        localField: 'category.parent_id',
        foreignField: '_id',
        as: 'category.parent',
      },
    },
    {
      $project: {
        product: {
          $cond: {
            if: { $ne: ['$category', null] },
            then: '$$ROOT',
            else: '$$REMOVE',
          },
        },
      },
    },
    {
      $replaceRoot: { newRoot: '$product' },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]).exec(function (error, productList) {
    if (error) {
      return res.status(500).json({ error: 'An error occurred' });
    }

    res.render("pages/product/list", {
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
        list: productList
      },
    });
  });
};


exports.detailsData = async function (req, res, next) {

  
  var pageName = "Product Details";
  var pageTitle = req.app.locals.siteName + " - " + pageName;

  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productdetails = await Userproduct.findOne({ _id: productId })
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .populate('user_id', 'name')
      .populate('status', 'name');

    if (!productdetails) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Fetch the parent category
    if(productdetails.hasOwnProperty("category_id"))
    {
      const CategoryDetails = await Category.findById(productdetails.category_id);

      const parentCategory = await Category.findById(CategoryDetails.parent_id);
    }
  
    const productImages = await Productimage.find({ product_id: productId });
    const brandList = await Brand.find();
    const categoryList = await Category.find({ parent_id: '650444488501422c8bf24bdb' });
    const subcategoryList = await Category.find({ parent_id: { $ne: '650444488501422c8bf24bdb' } });
    const sizeList = await Size.find();
    const productcondition = await Productcondition.find();

    const requrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });


    res.render("pages/product/details", {
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
      respdata: productdetails,
      category: categoryList,
      subcategory: subcategoryList,
      brand: brandList,
      size: sizeList,
      productCondition: productcondition,
      productImages: productImages,
      parentCategory: productdetails.hasOwnProperty("category_id") ? parentCategory : null,
      
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

exports.updatedetailsData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Userproduct.findById(req.body.product_id).then(async (product) => {
    if (!product) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      var updData = {
        name: req.body.product_name,
        description: req.body.description,
        category_id: req.body.subcategory_id,
        brand_id: req.body.brand_id,
        size_id: req.body.size_id,
        status: req.body.status,
        flag: req.body.flag,
        approval_status: req.body.approval_status,
      };
      if (req.body.price) updData.price = req.body.price;
      if (req.body.offer_price) updData.offer_price = req.body.offer_price;
      if (req.body.height) updData.height = req.body.height;
      if (req.body.weight) updData.weight = req.body.weight;
      if (req.body.length) updData.length = req.body.length;
      if (req.body.breath) updData.breath = req.body.breath;
      await Userproduct.findOneAndUpdate({ _id: req.body.product_id }, { $set: updData }, { upsert: true });
      if (req.body.remainingImages.length > 0) {
        const remainingImages = req.body.remainingImages ? JSON.parse(req.body.remainingImages) : [];
        const imagesArray = [];
        for (const image of remainingImages) {
          if (image && image.image) {
            imagesArray.push(image.image);
          } else {
          }
        }
        if (req.files && req.files.length > 0) {
          const allImages = imagesArray.concat(req.files.map(file => {
            const requrl = url.format({
              protocol: req.protocol,
              host: req.get("host"),
            });
            return requrl + "/public/images/" + file.filename;
          }));
          const countAllImages = allImages.length;
          await Productimage.deleteMany({ product_id: req.body.product_id });

          if (allImages && allImages.length > 0) {
            const remainingSlots = 5 - countAllImages;
            const imagesToInsert = allImages.slice(0, Math.min(5, allImages.length));

            const imageDetails = imagesToInsert.map(imageUrl => {
              const productimageDetail = new Productimage({
                product_id: req.body.product_id,
                category_id: req.body.subcategory_id,
                user_id: req.body.user_id,
                image: imageUrl,
                added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
              });

              return productimageDetail.save();
            });

            await Promise.all(imageDetails);
          }
        }
        else {
          // const count = imagesArray.length;
          await Productimage.deleteMany({ product_id: req.body.product_id });
          const imagesToUpload = imagesArray.slice(0, 5);
          for (const image of imagesToUpload) {
            const productimageDetail = new Productimage({
              product_id: req.body.product_id,
              category_id: req.body.subcategory_id,
              user_id: req.body.user_id,
              image: image,
              added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
            });
            await productimageDetail.save();
          }
        }
      }
      else {
        const List = await Productimage.find({ product_id: req.body.product_id });
        const count = await Productimage.countDocuments({ product_id: req.body.product_id });
        if (count !== 5 || count < 5) {
          if (req.files && req.files.length > 0) {
            const imageDetails = req.files.slice(0, 5 - count).map((file) => {
              const requrl = url.format({
                protocol: req.protocol,
                host: req.get("host"),
              });
              const imageUrl = requrl + "/public/images/" + file.filename;

              const productimageDetail = new Productimage({
                product_id: req.body.product_id,
                category_id: req.body.subcategory_id,
                user_id: req.body.user_id,
                image: imageUrl,
                added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
              });

              return productimageDetail.save();
            });

            await Promise.all(imageDetails);
          }
        }

      }

      // if (req.files && req.files.length > 0) {
      //   const imageDetails = req.files.map((file) => {
      //     const requrl = url.format({
      //       protocol: req.protocol,
      //       host: req.get("host"),
      //     });
      //     const imageUrl = requrl + "/public/images/" + file.filename;

      //     const productimageDetail = new Productimage({
      //       product_id: req.body.product_id,
      //       category_id: req.body.subcategory_id,
      //       user_id: req.body.user_id,
      //       image: imageUrl,
      //       added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
      //     });

      //     return productimageDetail.save();
      //   });

      //   await Promise.all(imageDetails);
      // }

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



exports.updateStatusData = async function (req, res, next) {
  const Id = req.params.id;

  Userproduct.findById(Id)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          status: "0",
          message: "Brand not found!",
          respdata: {},
        });
      }

      product.flag = product.flag === 0 ? 1 : 0;

      product.save()
        .then((updatedProduct) => {
          if (!updatedProduct) {
            return res.status(404).json({
              status: "0",
              message: "Product status not updated!",
              respdata: {},
            });
          }
          res.redirect("/productlist");
        })
        .catch((error) => {
          return res.status(500).json({
            status: "0",
            message: "An error occurred while updating the product status.",
            respdata: {},
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "0",
        message: "An error occurred while finding the brand.",
        respdata: {},
      });
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

    const product = await Userproduct.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    }

    await Userproduct.deleteOne(
      { _id: req.params.id },
      { w: "majority", wtimeout: 100 }
    );

    
    res.redirect("/productlist");
  } catch (error) {
   
    return res.status(500).json({
      status: "0",
      message: "Error occurred while deleting the product!",
      respdata: error.message,
    });
  }
};
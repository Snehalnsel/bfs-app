var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
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
const Users = require("../../models/api/userModel");
const Category = require("../../models/api/categoryModel");
const Brand = require("../../models/api/brandModel");
const Size = require("../../models/api/sizeModel");
const Productsize = require("../../models/api/catsizeModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Productcondition = require("../../models/api/productconditionModel");
const multer = require("multer");
const upload = multer({ dest: 'public/images/' }); 

exports.getSizeList = async function (req, res, next) {
  try {
    const { category_id, brand_id } = req.body;

    const sizes = await Productsize.find({
      category_id: category_id, 
      brand_id: brand_id,     
    }).populate('size_id');    

    if (!sizes || sizes.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Sizes not found for the specified category and brand",
        respdata: {},
      });
    }

    const sizeInfo = sizes.map((size) => ({
      size_id: size.size_id._id,
      name: size.size_id.name,
      added_dtime: size.size_id.added_dtime,
    }));

    res.status(200).json({ status: "1", size_list: sizeInfo });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};


exports.getSizeData = async function (req, res, next) {
  try {
    const productsize = await Size.find();

    if (!productsize || productsize.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Size not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", productSize: productsize });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};

exports.getBrandData = async function (req, res, next) {
  try {
    const productbrand = await Brand.find();

    if (!productbrand || productbrand.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Brands not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", productBrand: productbrand });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};


// exports.addData = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//  try {
//     const existingProduct = await Userproduct.findOne({ name: req.body.name });

//     if (existingProduct) {
//       return res.status(404).json({
//         status: "0",
//         message: "Product already exists!",
//         respdata: {},
//       });
//     }

//     const newProduct = new Userproduct({
//       category_id: req.body.category_id,
//       user_id: req.body.user_id,
//       brand_id: req.body.brand_id,
//       size_id: req.body.size_id,
//       name: req.body.name,
//       description: req.body.description,
//       status: req.body.status,
//       price: req.body.price,
//       offer_price: req.body.offerprice,
//       reseller_price: req.body.reseller_price,
//       percentage:  req.body.percentage,
//       added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"), 
//     });

//     const savedProductdata = await newProduct.save();
//     const requrl = url.format({
//       protocol: req.protocol,
//       host: req.get("host"),
//     });

//     const imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       const imageDetails = [];
    
//       req.files.forEach(async (file) => {
//         const imageUrl = requrl + "/public/images/" + file.filename;
    
//         const productimageDetail = new Productimage({
//           product_id: savedProductdata._id,
//           category_id: req.body.category_id,
//           user_id: req.body.user_id,
//           brand_id: req.body.brand_id,
//           image: imageUrl,
//           added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
//         });
    
//         const savedImage = productimageDetail.save();
//       });
    
//       res.status(200).json({
//         status: "1",
//         status: "1",
//         message: "Product and images added!",
//         respdata: savedProductdata
//       });
//     } 
 
//    } catch (error) {
//     res.status(500).json({
//       status: "0",
//       message: "Error!",
//       respdata: error,
//     });
//   }
// };



exports.getProductconditionList = async function (req, res, next) {
  try {
    const productConditions = await Productcondition.find();

    if (!productConditions || productConditions.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Product conditions not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", productConditions: productConditions });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};



exports.addData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    // const existingProduct = await Userproduct.findOne({ name: req.body.name });

    // if (existingProduct) {
    //   return res.status(404).json({
    //     status: "0",
    //     message: "Product already exists!",
    //     respdata: {},
    //   });
    // }

    // let brand_id = req.body.brand_id;
    // let size_id = req.body.size_id;

    // if (!brand_id || !size_id) {
     
    //   if (!brand_id) {
       
    //     const newBrand = new Brand({
    //       name: req.body.brand_name,
    //       category_id :req.body.category_id,
    //       status: 0,
    //       added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     });
    
    //     const savedBrand = await newBrand.save();
    
    //     brand_id = savedBrand._id;
    //   }

    //   if (!size_id) {
       
    //     const newSize = Size({
    //       name: req.body.size_name,
    //       added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"), 
    //     });
  
    //     const savedSize = await newSize.save();
    //     size_id = savedSize._id;
    //   }
    // }

    const newProduct = new Userproduct({
      //category_id: req.body.category_id,
      user_id: req.body.user_id,
      category: req.body.category,
      brand: req.body.brand,
      size: req.body.size,
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      price: req.body.price,
      offer_price: req.body.offerprice,
      reseller_price: req.body.reseller_price,
      percentage:  req.body.percentage,
      original_invoice:  req.body.original_invoice,
      original_packaging:  req.body.original_packaging,
      height: req.body.height || 0,
      weight: req.body.weight || 0,
      length: req.body.length || 0,
      breath: req.body.breath || 0,
      added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"), 
    });

    const savedProductdata = await newProduct.save();
    const requrl = url.format({
      protocol: req.protocol,
      host: req.get("host"),
    });
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      const imageDetails = [];

      req.files.forEach(async (file) => {
        const imageUrl = requrl + "/public/images/" + file.filename;
        //const imageUrl = file.filename;

        const productimageDetail = new Productimage({
          product_id: savedProductdata._id,
          //category_id: req.body.category_id,
          user_id: req.body.user_id,
          // brand_id: brand_id,
          image: imageUrl,
          added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });

        const savedImage = productimageDetail.save();
      });

      res.status(200).json({
        status: "1",
        status: "1",
        message: "Product and images added!",
        respdata: savedProductdata
      });
    }

  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.getProductData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

  const page = req.body.page ? parseInt(req.body.page) : 1;
  const limit = req.body.limit ? parseInt(req.body.limit) : 10;

    let query = {};
    // let query = {
    //   approval_status: 1, 
    // };

    if (req.body.user_id) {
      query.user_id = req.body.user_id;
    }
    const count = await Userproduct.countDocuments(query);

    const userproducts = await Userproduct.find(query)
    .populate('brand_id', 'name', { optional: true })
    .populate('category_id', 'name', { optional: true })
    .populate('user_id', 'name', { optional: true })
    .populate('size_id', 'name', { optional: true })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
    if (!userproducts || userproducts.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: [],
      });
    }

    const formattedUserProducts = [];
 
    for (const userproduct of userproducts) {
      const productImages = await Productimage.find({ product_id: userproduct._id });
      const formattedUserProduct = {
        _id: userproduct._id,
        name: userproduct.name,
        description: userproduct.description,
        category_id: userproduct.category_id ? userproduct.category_id._id: '', 
        category: userproduct.category_id ? userproduct.category : userproduct.category || '', 
        brand: userproduct.brand_id ? userproduct.brand_id.name : userproduct.brand || '',
        brand_id: userproduct.brand_id ? userproduct.brand_id._id : '',
        user_id: userproduct.user_id._id,
        user_name: userproduct.user_id.name,
        size: userproduct.size_id ? userproduct.size_id.name : userproduct.size || '',
        size_id: userproduct.size_id ? userproduct.size_id._id : '',
        price: userproduct.price,
        offer_price: userproduct.offer_price,
        percentage: userproduct.percentage,
        status: userproduct.status,
        height: userproduct.height,
        weight: userproduct.weight,
        length: userproduct.length,
        breath: userproduct.breath,
        flag: userproduct.flag,
        approval_status: userproduct.approval_status,
        original_invoice: userproduct.original_invoice,
        original_packaging: userproduct.original_packaging,
        added_dtime: userproduct.added_dtime,
        __v: userproduct.__v,
        product_images: productImages, 
      };
      formattedUserProducts.push(formattedUserProduct);
    }
    const totalPages = Math.ceil(count / limit);
    if(formattedUserProducts)
    {
      res.status(200).json({
        status: "1",
        message: "Found!",
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: limit,
        respdata: formattedUserProducts,
      });
    }
    
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Server error!",
      respdata: [],
    });
  }
};

exports.getProductDataById = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {

    const page = req.body.page ? parseInt(req.body.page) : 1; // Default page is 1
    const limit = req.body.limit ? parseInt(req.body.limit) : 10; // Default limit is 10
    // let query = {};     
    let query = {
      approval_status: 1, 
      flag : 0
    };

    if (req.body.category_id) {
      query.category_id = req.body.category_id;
    }

    if (req.body.brand_id) {
      query.brand_id = req.body.brand_id;
    }

    if (req.body.size_id) {
      query.size_id = req.body.size_id;
    }

    const count = await Userproduct.countDocuments(query);
    
    const userproducts = await Userproduct.find(query)
      .populate('brand_id', 'name') 
      .populate('category_id', 'name') 
      .populate('user_id', 'name')
      .populate('size_id', 'name')
      .skip((page - 1) * limit) // Skip records based on page number and limit
      .limit(limit)
      .exec();

   

    if (!userproducts || userproducts.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: [],
      });
    }
    const formattedUserProducts = [];
    for (const userproduct of userproducts) {
      
     
      const productImages = await Productimage.find({ product_id: userproduct._id });

      const productCondition = await Productcondition.findById(userproducts.status);

      const formattedUserProduct = {
        _id: userproduct._id,
        name: userproduct.name,
        description: userproduct.description,
        category: userproduct.category_id ? userproduct.category_id.name : '',
        category_id: userproduct.category ? userproduct.category : '', // Check if category_id exists before accessing 'name'
        brand: userproduct.brand_id ? userproduct.brand_id.name : '', // Check if brand_id exists before accessing 'name'
        user_id: userproduct.user_id ? userproduct.user_id._id : '',
        user_name: userproduct.user_id ? userproduct.user_id.name : '',
        size_id: userproduct.size_id ? userproduct.size_id.name : '', // Check if size_id exists before accessing 'name'
        price: userproduct.price,
        offer_price: userproduct.offer_price,
        percentage: userproduct.percentage,
        status: userproduct.status,
        original_invoice: userproduct.original_invoice,
        height: userproduct.height,
        weight: userproduct.weight,
        length: userproduct.length,
        breath: userproduct.breath,
        flag: userproduct.flag,
        original_packaging: userproduct.original_packaging,
        approval_status: userproduct.approval_status,
        satus_name : productCondition ? productCondition.name : '',
        added_dtime: userproduct.added_dtime,
        hitCount: userproduct.hitCount || 0, // Provide a default value if hitCount is undefined
        __v: userproduct.__v,
        product_images: productImages,
      };

      formattedUserProducts.push(formattedUserProduct);
    }

    const totalPages = Math.ceil(count / limit); // Calculate total pages

    res.status(200).json({
      status: "1",
      message: "Found!",
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      itemsPerPage: limit,
      respdata: formattedUserProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Server error!",
      respdata: [],
    });
  }
};


exports.getDetailsById = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    let query = {}; 

    if (req.body.product_id) {
      query._id = req.body.product_id; 
    }
    
    const userproducts = await Userproduct.findById(query)
      .populate('brand_id', 'name') 
      .populate('category_id', 'name') 
      .populate('user_id', 'name')
      .populate('size_id', 'name')
      .exec();

    
    if (!userproducts) {
      return res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: [],
      });
    }

    userproducts.hitCount = (userproducts.hitCount || 0) + 1;

    await userproducts.save();

    const productImages = await Productimage.find({ product_id: userproducts._id });

    // const formattedUserProduct = {
    //   _id: userproducts._id,
    //   name: userproducts.name,
    //   description: userproducts.description,
    //   category: userproducts.category_id.name, 
    //   brand: userproducts.brand_id.name, 
    //   user_id: userproducts.user_id._id,
    //   user_name: userproducts.user_id.name,
    //   size_id: userproducts.size_id.name,
    //   price: userproducts.price,
    //   offer_price: userproducts.offer_price,
    //   percentage: userproducts.percentage,
    //   status: userproducts.status,
    //   flag: userproducts.flag,
    //   approval_status: userproducts.approval_status,
    //   added_dtime: userproducts.added_dtime,
    //   hitCount: userproducts.hitCount, 
    //   __v: userproducts.__v,
    //   product_images: productImages, 
    // };

    const productCondition = await Productcondition.findById(userproducts.status);
    const formattedUserProduct = {
      _id: userproducts._id,
      name: userproducts.name,
      description: userproducts.description,
      category_id: userproducts.category_id ? userproducts.category_id._id: '', 
      category: userproducts.category_id ? userproducts.category_id.name : userproducts.category_id || '', 
      brand: userproducts.brand_id ? userproducts.brand_id.name : userproducts.brand || '',
      brand_id: userproducts.brand_id ? userproducts.brand_id._id : '',
      user_id: userproducts.user_id ? userproducts.user_id._id : '',
      user_name: userproducts.user_id ? userproducts.user_id.name : '',
      size: userproducts.size_id ? userproducts.size_id.name : userproducts.size || '',
      size_id: userproducts.size_id ? userproducts.size_id._id : '',
      price: userproducts.price,
      offer_price: userproducts.offer_price,
      percentage: userproducts.percentage,
      status: userproducts.status,
      original_invoice: userproducts.original_invoice,
      height: userproducts.height,
      weight: userproducts.weight,
      length: userproducts.length,
      breath: userproducts.breath,
      flag: userproducts.flag,
      original_packaging: userproducts.original_packaging,
      approval_status: userproducts.approval_status,
      satus_name : productCondition ? productCondition.name : '',
      satus : productCondition ? productCondition.name : '',
      added_dtime: userproducts.added_dtime,
      hitCount: userproducts.hitCount || 0, 
      __v: userproducts.__v,
      product_images: productImages,
    };
    

    res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: formattedUserProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "Server error!",
      respdata: [],
    });
  }
};

exports.getProduct = async function (req, res, next) {
  try {
    const productId = req.body.product_id; 

    const product = await Userproduct.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    const productImages = await Productimage.find({ product_id: productId });

    const productDetails = {
      ...product.toObject(), 
      images: productImages,
    };

    res.status(200).json({
      status: "1",
      message: "Product details fetched successfully!",
      respdata: productDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


exports.updateProduct = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  try {
    const productId = req.body.product_id;
    const existingProduct = await Userproduct.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    existingProduct.category_id = req.body.category_id || existingProduct.category_id;
    existingProduct.user_id = req.body.user_id || existingProduct.user_id;
    if(req.body.brand)
    {
      existingProduct.brand = ((req.body.brand || existingProduct.brand) ?? null);
    }
    if(req.body.size)
    {
      existingProduct.size = ((req.body.size || existingProduct.size) ?? null);
    }
    
    existingProduct.brand_id = ((req.body.brand_id || existingProduct.brand_id) ?? null);
    existingProduct.size_id = ((req.body.size_id || existingProduct.size_id) ?? null);
    existingProduct.name = req.body.name || existingProduct.name;
    existingProduct.description = req.body.description || existingProduct.description;
    existingProduct.status = req.body.status || existingProduct.status;
    existingProduct.price = req.body.price || existingProduct.price;
    existingProduct.offer_price = req.body.offerprice || existingProduct.offer_price;
    existingProduct.percentage = req.body.percentage || existingProduct.percentage;

    const newProduct = new Userproduct({
      category_id: req.body.category_id,
      user_id: req.body.user_id,
      brand: req.body.brand,
      size: req.body.size,
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      price: req.body.price,
      offer_price: req.body.offerprice,
      reseller_price: req.body.reseller_price,
      percentage:  req.body.percentage,
      original_invoice:  req.body.original_invoice,
      original_packaging:  req.body.original_packaging,
      added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"), 
    });

    existingProduct.updated_dtime = moment().format("YYYY-MM-DD HH:mm:ss");

    if (req.files && req.files.length > 0) {
    
      await Productimage.deleteMany({ product_id: existingProduct._id });

      const imageUrls = [];
      const requrl = url.format({
        protocol: req.protocol,
        host: req.get("host"),
      });

      for (const file of req.files) {
        const imageUrl = requrl + "/public/images/" + file.filename;

        const productImageDetail = new Productimage({
          product_id: existingProduct._id,
          category_id: existingProduct.category_id,
          user_id: existingProduct.user_id,
          brand_id: existingProduct.brand_id,
          image: imageUrl,
          added_dtime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });

        const savedImage = await productImageDetail.save();
      }
    }

    const updatedProduct = await existingProduct.save();

    // Fetch image details for the updated product
    const productImages = await Productimage.find({ product_id: updatedProduct._id });

    const productDetails = {
      ...updatedProduct.toObject(),
      images: productImages,
    };

    res.status(200).json({
      status: "1",
      message: "Product updated!",
      respdata: productDetails,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};



exports.updateProductBidDetails = async (req, res) => {
  const { product_id, final_price, bid_status } = req.body;

  try {
 
    const updatedUserProduct = await Userproduct.findOneAndUpdate(
      { _id: product_id },
      {
        final_price: final_price,
        bid_status: bid_status,
      },
      { new: true } 
    );

    if (!updatedUserProduct) {
      return res.status(404).json({ message: 'Userproduct not found' });
    }

    return res.status(200).json({
      status: "1",
      message: "Userproduct updated successfully",
      respdata: updatedUserProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProduct = async function (req, res, next) {
  try {
    const productId = req.body.product_id;
    
    const product = await Userproduct.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "0",
        message: "Product not found!",
        respdata: {},
      });
    }

    await Productimage.deleteMany({ product_id: productId });

    await Userproduct.findByIdAndDelete(productId);

    res.status(200).json({
      status: "1",
      message: "Product and associated images deleted successfully!",
      respdata: {},
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error,
    });
  }
};


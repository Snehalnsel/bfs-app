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
const Category = require("../../models/api/categoryModel");
const Brand = require("../../models/api/brandModel");
const Size = require("../../models/api/sizeModel");
const Productsize = require("../../models/api/catsizeModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Bestdeal = require("../../models/api/bestdealModel");
const Productcondition = require("../../models/api/productconditionModel");
// const helper = require("../helpers/helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");
const url = require("url");
const { log } = require("console");
var ObjectId = require("mongodb").ObjectId;

//methods

// exports.searchData = async function (req, res, next) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       status: "0",
//       message: "Validation error!",
//       respdata: errors.array(),
//     });
//   }

//   var respDataFinal;

//    // Pagination parameters
//    const page = req.body.page ? parseInt(req.body.page) : 1; 
//    const limit = req.body.limit ? parseInt(req.body.limit) : 10; 

//   if (req.body.type == "category") {
//     Category.find({
//       name: new RegExp(req.body.search, "i"),
//       parent_id: { $ne: '650444488501422c8bf24bdb' } // Exclude documents with this parent_id
//     }).then(
//       async (category) => {
//         if (!category || category.length === 0) {
//           respDataFinal = {
//             status: "0",
//             message: "Not found!",
//             type: "category",
//             data: {},
//           };

//           res.status(200).json({
//             respdata: respDataFinal,
//           });
//         } else {
//           console.log("category_id:", category);

//           try {
//            // const userproducts = await Userproduct.find({ category_id: category._id }).exec();
//            const userproducts = await Userproduct.find({
//             category_id: category._id,
//             approval_status: 1,
//             flag: 0
//           }).exec();
          

//             console.log("product details ", userproducts);

//             respDataFinal = {
//               status: "1",
//               message: "Category found!",
//               type: "category",
//               data: category,
//               userProducts: userproducts,
//             };

//             res.status(200).json({
//               respdata: respDataFinal,
//             });
//           } catch (err) {
//             console.error("Error occurred while finding user products:", err);

//             res.status(500).json({
//               status: "0",
//               message: "Error occurred while finding user products",
//               respdata: {},
//             });
//           }
//         }
//       }
//     );


//   } else if (req.body.type == "brand") {
//     Brand.find({ name: new RegExp(req.body.search, "i") }).then(
//       (brand) => {
//         if (!brand) {
//           respDataFinal = {
//             status: "0",
//             message: "Not found!",
//             type: "brand",
//             data: {},
//           };
//         } else {
//           respDataFinal = {
//             status: "1",
//             message: "Found!",
//             type: "brand",
//             data: brand,
//           };
//         }
//         res.status(200).json({
//           respdata: respDataFinal,
//         });
//       }
//     );
//   } else if (req.body.type == "product") {


//     // Userproduct.find({ name: new RegExp(req.body.search, "i") })
//     const products = await Userproduct.find({
//       name: new RegExp(req.body.search, "i"),
//       approval_status: 1, 
//       flag: 0
//     })
//       .then(async (products) => {
//         if (!products || products.length === 0) {
//           const respDataFinal = {
//             status: "0",
//             message: "Not found!",
//             type: "product",
//             data: [],
//           };
//           res.status(200).json({ respdata: respDataFinal });
//           return;
//         }

//         const productsWithImages = [];

//         for (const product of products) {
//           const productImage = await Productimage.findOne({ product_id: product._id });

//           const productWithImage = {
//             ...product.toObject(),
//             image: productImage,
//           };

//           productsWithImages.push(productWithImage);
//         }

//         const respDataFinal = {
//           status: "1",
//           message: "Found!",
//           type: "product",
//           data: productsWithImages,
//         };

//         res.status(200).json({ respdata: respDataFinal });
//       })
//       .catch((error) => {
//         console.error("Error finding products:", error);
//         res.status(500).json({
//           status: "0",
//           message: "An error occurred while searching for products",
//           type: "product",
//           data: [],
//         });
//       });


//   }
// };

exports.searchData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  var respDataFinal;

  const page = req.body.page ? parseInt(req.body.page) : 1;
  const limit = req.body.limit ? parseInt(req.body.limit) : 10;

  if (req.body.type == "category") {
    try {
      const count = await Category.countDocuments({
        name: new RegExp(req.body.search, "i"),
        parent_id: { $ne: '650444488501422c8bf24bdb' }
      });

      const categories = await Category.find({
        name: new RegExp(req.body.search, "i"),
        parent_id: { $ne: '650444488501422c8bf24bdb' }
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!categories || categories.length === 0) {
        respDataFinal = {
          status: "0",
          message: "Not found!",
          type: "category",
          data: [],
        };
        res.status(200).json({ respdata: respDataFinal });
        return;
      }

      const totalPages = Math.ceil(count / limit);

      respDataFinal = {
        status: "1",
        message: "Found!",
        type: "category",
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        data: categories,
      };

      res.status(200).json({ respdata: respDataFinal });
    } catch (error) {
      console.error("Error finding categories:", error);
      res.status(500).json({
        status: "0",
        message: "An error occurred while searching for categories",
        type: "category",
        data: [],
      });
    }
  } else if (req.body.type == "brand") {
    try {
      const count = await Brand.countDocuments({ name: new RegExp(req.body.search, "i") });

      const brands = await Brand.find({ name: new RegExp(req.body.search, "i") })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!brands || brands.length === 0) {
        respDataFinal = {
          status: "0",
          message: "Not found!",
          type: "brand",
          data: [],
        };
        res.status(200).json({ respdata: respDataFinal });
        return;
      }

      const totalPages = Math.ceil(count / limit);

      respDataFinal = {
        status: "1",
        message: "Found!",
        type: "brand",
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        data: brands,
      };

      res.status(200).json({ respdata: respDataFinal });
    } catch (error) {
      console.error("Error finding brands:", error);
      res.status(500).json({
        status: "0",
        message: "An error occurred while searching for brands",
        type: "brand",
        data: [],
      });
    }
  } else if (req.body.type == "product") {
    try {
      const count = await Userproduct.countDocuments({
        name: new RegExp(req.body.search, "i"),
        approval_status: 1,
        flag: 0,
      });

      const products = await Userproduct.find({
        name: new RegExp(req.body.search, "i"),
        approval_status: 1,
        flag: 0,
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!products || products.length === 0) {
        respDataFinal = {
          status: "0",
          message: "Not found!",
          type: "product",
          data: [],
        };
        res.status(200).json({ respdata: respDataFinal });
        return;
      }

      const productsWithImages = [];

      for (const product of products) {
        const productImage = await Productimage.findOne({ product_id: product._id });

        const productWithImage = {
          ...product.toObject(),
          image: productImage,
        };

        productsWithImages.push(productWithImage);
      }

      const totalPages = Math.ceil(count / limit);

      respDataFinal = {
        status: "1",
        message: "Found!",
        type: "product",
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        data: productsWithImages,
      };

      res.status(200).json({ respdata: respDataFinal });
    } catch (error) {
      console.error("Error finding products:", error);
      res.status(500).json({
        status: "0",
        message: "An error occurred while searching for products",
        type: "product",
        data: [],
      });
    }
  }
};



exports.getProductListByValue = async function (reqBody, res) {
  try {
    const query = {};

    for (const key in reqBody) {
      if (reqBody.hasOwnProperty(key)) {

        if (key === 'original_invoice' || key === 'original_packaging' || key === 'hitCount') {
          query[key] = reqBody[key];
        } else if (key === 'status') {
          query[key] = reqBody[key];
        }
      }
    }

    const userProducts = await Userproduct.find(query)
      .populate('category_id')
      .populate('brand_id')
      .populate('size_id')
      .populate('status')
      .exec();

    res.status(200).json({
      respdata: userProducts,
    });
  } catch (error) {
    console.error("Error fetching Userproducts:", error);
    res.status(500).json({
      status: "0",
      message: "Error fetching Userproducts",
      respdata: {},
    });
  }
};


exports.filterData = async function (req, res, next) {
  const { id, type, min, max } = req.body;
  try {
    let filterQuery = {
      approval_status: 1,
      flag: 0
    };

    const types = type.split(',');
    var ids = (typeof id !== "undefined") ? (id.length > 1) ? id.split(',') : id : "";
    console.log(ids);
    // const max = 5000;
    // const min = 1000;

    // if (types.length !== ids.length) {
    //   return res.status(400).json({
    //     status: '0',
    //     message: 'Mismatch in types and IDs',
    //   });
    // }
    for (let i = 0; i < types.length; i++) {
      let condID = (ids.length >= 1) ? ids[i] : "";
      switch (types[i]) {
        case 'brand':
          filterQuery = { ...filterQuery };
          if (condID.length > 0) filterQuery.brand_id = condID;
          break;
        case 'size':
          filterQuery = { ...filterQuery };
          if (condID.length > 0) filterQuery.size_id = condID;
          break;
        case 'condition':
          filterQuery = { ...filterQuery };
          if (condID.length > 0) filterQuery.status = condID;
          break;
        case 'price':
          if (min && max) {
            filterQuery = {
              ...filterQuery,
                "offer_price": {
                  "$gte": min,
                  "$lte": max
                }
              ,
            };
          }
          break;
        default:
          return res.status(400).json({ status: '0', message: 'Invalid type' });
      }
    }

    console.log('Hello###################');
    console.log(filterQuery);
    const products = await Userproduct.find(filterQuery);

    //console.log(products);

    if (!products || products.length === 0) {
      return res.status(200).json({
        respdata: {
          status: '0',
          message: 'No products found for the specified filter',
          type,
          data: [],
        },
      });
    }

    const productsWithImages = [];
    const maxVal = typeof max !== "undefined" ? parseInt(max) : 0;
    const minVal = typeof min !== "undefined" ? parseInt(min) : 0;

    for (const product of products) {
      let offerPrice = parseInt(product.offer_price);
      // console.log("offerprice");
      // console.log(offerPrice,maxVal);
      if (max > 0 && min > 0) {
        if (offerPrice <= maxVal && offerPrice >= minVal) {

          // console.log(minVal);
          // console.log(maxVal);
          const productImage = await Productimage.findOne({ product_id: product._id });

          var productWithImage = {
            ...product.toObject(),
            image: productImage,
          };
          productsWithImages.push(productWithImage);
        }
      } else {
        const productImage = await Productimage.findOne({ product_id: product._id });

        var productWithImage = {
          ...product.toObject(),
          image: productImage,
        };

        productsWithImages.push(productWithImage);
      }

     
    }


    // productsWithImages = productsWithImages.filter(product => !hasNull(product));
    // console.log(productsWithImages);

    return res.status(200).json({
      respdata: {
        status: '1',
        message: 'Products found!',
        type,
        data: productsWithImages,
      },
    });

  } catch (error) {
    console.error('Error filtering products:', error);
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while filtering products',
      data: [],
    });
  }
};

exports.getBestDealList = async function (req, res, next) {
  try {
    const deals = await Bestdeal.find();
    if (!deals || deals.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Hubs not found",
        respdata: {},
      });
    }
    res.status(200).json({ status: "1", best_deal_list: deals });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};

exports.filterByOfferPrice = async function (req, res, next) {
  const { maxPrice, page, pageSize } = req.body;

  try {
    if (!maxPrice || !page || !pageSize) {
      return res.status(400).json({
        status: '0',
        message: 'Please provide maximum price, page, and pageSize for filtering.',
        data: []
      });
    }

    //const sanitizedMaxPrice = parseFloat(maxPrice.replace(/,/g, ''));

    // const filteredProducts = await Userproduct.find({
    //   approval_status: 1,
    //   flag: 0
    // });

    const filteredProducts = await Userproduct.find({
      approval_status: 1,
      flag: 0,
      offer_price: { $lt: parseInt(maxPrice) }
    });


    console.log(filteredProducts);
    // const filteredProducts = allProducts.filter(product => {
    //   const offerPrice = parseFloat(product.offer_price.replace(/,/g, ''));
    //   return offerPrice <= sanitizedMaxPrice;
    // });

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (page - 1) * pageSize;

    const paginatedProducts = filteredProducts.slice(skip, skip + pageSize);

    if (!paginatedProducts || paginatedProducts.length === 0) {
      return res.status(200).json({
        respdata: {
          status: '0',
          message: 'No products found for the specified page',
          data: []
        }
      });
    }

    const bestDealProducts = [];
    for (const product of paginatedProducts) {
      const productImage = await Productimage.findOne({ product_id: product._id });
      if (productImage) {
        const productCondition = await Productcondition.findById(product.status);

        bestDealProducts.push({
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

    if (bestDealProducts.length === 0) {
      return res.status(200).json({
        respdata: {
          status: '0',
          message: 'No products found for the specified page with images',
          data: []
        }
      });
    }

    return res.status(200).json({
      respdata: {
        status: '1',
        message: 'Products found for the specified page with images',
        totalPages: totalPages,
        currentPage: page,
        data: bestDealProducts
      }
    });

  } catch (error) {
    console.error('Error filtering products by offer price:', error);
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while filtering products by offer price',
      data: []
    });
  }
};

exports.searchByKeyword = async function (req, res, next) {
  try {
    let reqBody = req.body;
    let searchBy = reqBody.searchBy;
    let allProductName = await Userproduct.find({
      name: { $regex: new RegExp(`${searchBy}`, 'i') },
      approval_status: 1,
      flag: 0
    }).limit(10);
    
    let allBrandName = await Brand.find({ name: { $regex: new RegExp(`${searchBy}`, 'i') } }).limit(10);
    let allData = [];
    let siteUrl = process.env.SITE_URL;
    //if(allProductName.length >= 5) {
      let i = 0;
      for(let element of allProductName) {
        if(i < 5) {
          let name = element.name;
          let link = "/api/productdeatils/" + element._id.toString();
          let newElement = {
            name: name,
            link: link,
            siteUrl: siteUrl
          };
          allData.push(newElement);
          i++;
        }
      }
    //}
    for(let element of allBrandName) {
      if(allData.length < 10) {
        let name = element.name;
        let link = "/api/websubcategoriesproducts/"+element._id.toString();
        let newElement = {
          name: name,
          link: link
        };
        allData.push(newElement);
      } else {
        break;
      }
    }
    res.status(200).json({
      status: "1",
      message: "successfully search your result!",
      siteUrl: process.env.SITE_URL,
      respdata: {
        allData: allData
      },
    });
  } catch (error) {
    //console.log(error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while searching the result.",
      error: error.message,
    });
  }
};
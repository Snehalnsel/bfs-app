var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Category = require("../../models/api/categoryModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
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

//methods

// exports.getData = async function (req, res, next) {
//   try {
//     const categoriesWithProducts = await Category.aggregate([
//       {
//         $lookup: {
//           from: 'mt_userproducts', 
//           localField: '_id',
//           foreignField: 'category_id',
//           as: 'products',
//         },
//       },
//       {
//         $match: {
//           'products': { $exists: true, $not: { $size: 0 } },
//         },
//       },
//     ]);

//     if (!categoriesWithProducts || categoriesWithProducts.length === 0) {
//       return res.status(404).json({
//         status: "0",
//         message: "No categories found with associated products.",
//         respdata: {},
//       });
//     }

//     return res.status(200).json({
//       status: "1",
//       message: "Categories with associated products found.",
//       respdata: categoriesWithProducts,
//     });
//   } catch (error) {
   
//     return res.status(500).json({
//       status: "0",
//       message: "An error occurred while fetching categories with products.",
//       error: error.message,
//     });
//   }
// };


exports.getnewData = async function (req, res, next) {
  try {
    const categoriesWithProducts = await Category.aggregate([
      {
        $match: {
          status: 1
        }
      },
      {
        $lookup: {
          from: 'mt_userproducts', 
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$category_id', '$$categoryId'] },
                    { $eq: ['$approval_status', 1] }
                  ]
                }
              }
            }
          ],
          as: 'products',
        },
      },
      {
        $match: {
          'products': { $exists: true, $not: { $size: 0 } },
        },
      }
    ]);

    if (!categoriesWithProducts || categoriesWithProducts.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No categories found with associated products.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Categories with associated products found.",
      respdata: categoriesWithProducts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching categories with products.",
      error: error.message,
    });
  }
};


exports.getAllData = async function (req, res, next) {
  try {
    const parentCategoryId = "650444488501422c8bf24bdb"; 
    const categoriesWithParentId = await  Category.find({ parent_id: parentCategoryId});

    if (!categoriesWithParentId || categoriesWithParentId.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No categories found with the specified parent_id.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Categories with the specified parent_id found.",
      respdata: categoriesWithParentId,
    });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching categories with the specified parent_id.",
      error: error.message,
    });
  }
};


exports.viewData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Category.findOne({ _id: req.body.category_id }).then((category) => {
    if (!category) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      res.status(200).json({
        status: "1",
        message: "Found!",
        respdata: category,
      });
    }
  });
};

exports.addData = async function (req, res, next) {

  Category.findOne({ name: req.body.category_name }).then((category) => {
    if (category) {
      res.status(404).json({
        status: "0",
        message: "Already exists!",
        respdata: {},
      });
    } else {
      const requrl = req.protocol + '://' + req.get('host');
      const imagePath = requrl + '/public/images/' + req.file.filename;
     
      const newCat = Category({
        name: req.body.category_name,
        description: req.body.description,
        image: imagePath,
        added_dtime: dateTime,
      });

      newCat
        .save()
        .then((category) => {
          res.status(200).json({
            status: "1",
            message: "Added!",
            respdata: category,
          });
        })
        .catch((error) => {
          res.status(400).json({
            status: "0",
            message: "Error!",
            respdata: error,
          });
        });
    }
  });
};

exports.editData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Category.findOne({ _id: req.body.category_id }).then((category) => {
    if (!category) {
      res.status(404).json({
        status: "0",
        message: "Not found!",
        respdata: {},
      });
    } else {
      const requrl = url.format({
        protocol: req.protocol,
        host: req.get("host"),
      });
      var image_url = requrl + "/public/images/no-image.jpg";

      var updData = {
        name: req.body.category_name,
        description: req.body.description,
        image: image_url,
      };
      Category.findOneAndUpdate(
        { _id: req.body.category_id },
        { $set: updData },
        { upsert: true },
        function (err, doc) {
          if (err) {
            throw err;
          } else {
            Category.findOne({ _id: req.body.category_id }).then((category) => {
              res.status(200).json({
                status: "1",
                message: "Successfully updated!",
                respdata: category,
              });
            });
          }
        }
      );
    }
  });
};

exports.deleteData = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  Category.findByIdAndDelete({ _id: ObjectId(req.body.category_id) }).then(
    (category) => {
      if (!category) {
        res.status(404).json({
          status: "0",
          message: "Not found!",
          respdata: {},
        });
      } else {                               
        res.status(200).json({
          status: "1",
          message: "Deleted!",
          respdata: category,
        });
      }
    }
  );
};


exports.getSubcatData = async function (req, res, next) {
  try {
    const parentId = req.body.category_id;

    const subcategories = await Category.find({ parent_id: parentId }).exec();

    if (!subcategories || subcategories.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No subcategories found for the given parent_id.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Data found!",
      respdata: subcategories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the data.",
      respdata: {},
    });
  }
};

exports.getCategoryWithParent = async function (req, res, next) {
  try {
    const categoryId = req.body.category_id; 

    const category = await Category.findById(categoryId).populate('parent_id').exec();

    if (!category) {
      return res.status(404).json({
        status: "0",
        message: "Category not found.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Data found!",
      respdata: category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching the data.",
      respdata: {},
    });
  }
};


exports.getSubAllData = async function (req, res, next) {
  try {
    const parentCategoryId = "650444488501422c8bf24bdb";
    const categoriesWithoutParentId = await Category.find({ parent_id: { $ne: parentCategoryId } });

    if (!categoriesWithoutParentId || categoriesWithoutParentId.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No categories found without the specified parent_id.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Categories without the specified parent_id found.",
      respdata: categoriesWithoutParentId,
    });
  } catch (error) {
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching categories without the specified parent_id.",
      error: error.message,
    });
  }
};


exports.getData = async function (req, res, next) {
  try {
    const parentCategories = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'parentCategory',
        },
      },
      {
        $unwind: "$parentCategory" // Unwind the array created by the $lookup
      },
      {
        $match: {
          'approval_status': 1, // Filter based on the product approval status being 1
        },
      },
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'parentCategory.parent_id',
          foreignField: '_id',
          as: 'parentDetails',
        },
      },
      {
        $project: {
          _id: 1,
          name: '$parentCategory.name',
          description: '$parentCategory.description',
          image: '$parentCategory.image',
          parent_id: '$parentCategory.parent_id',
          status: '$parentCategory.status',
          priority_status: '$parentCategory.priority_status',
          added_dtime: '$parentCategory.added_dtime',
          parentDetails: {
            $arrayElemAt: ['$parentDetails', 0],
          },
        },
      },
    ]);

    if (!parentCategories || parentCategories.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No parent categories found with associated approved products.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: parentCategories,
    });
  } catch (error) {
    console.error('Error fetching parent categories with parent details:', error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching parent categories with parent details.",
      error: error.message,
    });
  }
}

exports.getCategories = async function (req, res, next) {
  try {
    const parentCategories = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'parentCategory',
        },
      },
      {
        $unwind: "$parentCategory" // Unwind the array created by the $lookup
      },
      {
        $match: {
          'approval_status': 1, // Filter based on the product approval status being 1
        },
      },
      {
        $group: {
          _id: "$parentCategory._id", // Grouping by parent category ID
          name: { $first: "$parentCategory.name" }, // Retrieve the first name encountered
        },
      },
    ]);

    if (!parentCategories || parentCategories.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No parent categories found with associated approved products.",
        respdata: {},
      });
    }

    return res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: parentCategories,
    });
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching parent categories.",
      error: error.message,
    });
  }
}

exports.getParentCategories = async function (req, res, next) {
  try {
    const parentCategories = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'parentCategory',
        },
      },
      {
        $unwind: "$parentCategory"
      },
      {
        $match: {
          'approval_status': 1,
        },
      },
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'parentCategory.parent_id',
          foreignField: '_id',
          as: 'parentDetails',
        },
      },
      {
        $unwind: "$parentDetails"
      },
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'parentDetails.parent_id',
          foreignField: '_id',
          as: 'grandParentDetails',
        },
      },
      {
        $project: {
          parentDetails: 1,
          parentCategory: 1,
        },
      },
      {
        $group: {
          _id: '$grandParentDetails._id',
          parentCategories: {
            $addToSet: {
              parent_id: '$parentDetails._id',
              parentDetails: '$parentDetails',
              parentImage: '$parentDetails.image', 
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          parentCategories: 1,
        },
      },
    ]);

    if (!parentCategories || parentCategories.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No unique parent details found with associated approved products.",
        respdata: [],
      });
    }

    const extractedCategories = parentCategories.reduce((acc, item) => {
      acc.push(...item.parentCategories);
      return acc;
    }, []);

    return res.status(200).json({
      status: "1",
      message: "Found!",
      respdata: extractedCategories,
    });
  } catch (error) {
    console.error('Error fetching unique parent details:', error);
    return res.status(500).json({
      status: "0",
      message: "An error occurred while fetching unique parent details.",
      error: error.message,
    });
  }
};


exports.getCategoriesWithMatchingParentId = async function (req, res, next) {
  try {
    const { id } = req.body;

    const categoriesWithMatchingParentId = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'matchedCategories',
        },
      },
      {
        $unwind: '$matchedCategories'
      },
      {
        $match: {
          'matchedCategories.parent_id': mongoose.Types.ObjectId(id),
          'approval_status': 1,
        },
      },
      {
        $group: {
          _id: '$matchedCategories._id',
          name: { $first: '$matchedCategories.name' },
          description: { $first: '$matchedCategories.description' },
          images: { $first: '$matchedCategories.image' },
          product_ids: { $push: '$_id' }, // Collect product IDs in an array
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          images: 1, // Include the 'images' field
          product_ids: 1,
        },
      },
    ]);

    if (!categoriesWithMatchingParentId || categoriesWithMatchingParentId.length === 0) {
      return res.status(404).json({
        status: '0',
        message: 'No categories found matching the criteria.',
        respdata: {},
      });
    }

    return res.status(200).json({
      status: '1',
      message: 'Found!',
      respdata: categoriesWithMatchingParentId,
    });
  } catch (error) {
    console.error('Error fetching categories with matching parent_id:', error);
    return res.status(500).json({
      status: '0',
      message: 'An error occurred while fetching categories with matching parent_id.',
      error: error.message,
    });
  }
};





exports.getAllSubcategoriesWithProducts = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const subcategoriesWithProducts = await Userproduct.aggregate([
      {
        $lookup: {
          from: 'mt_categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'matchedCategories',
        },
      },
      {
        $unwind: '$matchedCategories'
      },
      {
        $match: {
          'approval_status': 1,
        },
      },
      {
        $group: {
          _id: '$matchedCategories._id',
          name: { $first: '$matchedCategories.name' },
          description: { $first: '$matchedCategories.description' },
          images: { $first: '$matchedCategories.image' },
          product_ids: { $push: '$_id' }, // Collect product IDs in an array
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          images: 1, // Include the 'images' field
          product_ids: 1,
        },
      },
    ]);

    if (!subcategoriesWithProducts || subcategoriesWithProducts.length === 0) {
        return res.status(404).json({
            status: '0',
            message: 'No subcategories found with associated products.',
            respdata: {},
        });
    }

    // console.log(subcategoriesWithProducts);
    
    // return res.status(200).json({
    //   status: '1',
    //   message: 'Subcategories with associated products found!',
    //   respdata: subcategoriesWithProducts,
    // });
    
    // res.render("webpages/productsubcategories", {
    //     title: "Wish List Page",
    //     message: "Welcome to the Wish List page!",
    //     respdata: subcategoriesWithProducts,
    // });

    return res.status(200).json({
        status: '1',
        message: 'Subcategories with associated products found!',
        respdata: subcategoriesWithProducts,
        isLoggedIn: isLoggedIn,
    });

    // let response = () => {
    //     return res.status(200).json({
    //         status: '1',
    //         message: 'Subcategories with associated products found!',
    //         respdata: subcategoriesWithProducts,
    //     });
    // }


    
  } catch (error) {
    console.error('Error fetching subcategories with associated products:', error);
    return res.status(500).json({
        status: '0',
        message: 'An error occurred while fetching subcategories with associated products.',
        error: error.message,
    });
  }
};












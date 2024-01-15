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
const Cart = require('../../models/api/cartModel');
const CartDetail = require('../../models/api/cartdetailsModel');
const Users = require("../../models/api/userModel");
const Userproduct = require("../../models/api/userproductModel");
const Productimage = require("../../models/api/productimageModel");
const Cartremove = require("../../models/api/cartremoveModel");

// exports.addToCart = async (req, res) => {
//   try {
//     const { user_id, product_id, qty } = req.body;

//     const existingCart = await Cart.findOne({ user_id: req.body.user_id, status: 0 });

//     console.log(existingCart);

//     if (existingCart) {
//       const existingCartItem = await CartDetail.findOne({
//         cart_id: existingCart._id,
//         product_id,
//         status: 0,
//       });

//       if (existingCartItem) {
//         console.log(existingCartItem.qty);
//         existingCartItem.qty = parseInt(existingCartItem.qty) + parseInt(qty);
//         await existingCartItem.save();
//       } else {
//         const cartDetail = new CartDetail({
//           cart_id: existingCart._id,
//           product_id,
//           qty,
//           check_status: 0,
//           status: 0,
//           added_dtime: dateTime,
//         });
//         await cartDetail.save();
//       }

//       const user = await Users.findById(user_id);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       const product = await Userproduct.findById(product_id);
//       if (!product) {
//         return res.status(404).json({ error: 'Product not found' });
//       }

//       const cartResponse = {
//         _id: existingCart._id,
//         user_id: existingCart.user_id,
//         status: existingCart.status,
//         check_status: existingCartItem.check_status,
//         qty: existingCartItem.qty,
//         user_name: user.name,
//         product_name: product.name,
//         added_dtime: existingCart.added_dtime,
//         __v: existingCart.__v,
//       };

//       return res.status(200).json({
//         message: 'Item added to existing cart successfully',
//         cart: cartResponse,
//       });
//     } else {
//       const newCart = new Cart({
//         user_id,
//         status: 0,
//         added_dtime: dateTime,
//       });

//       const savedCart = await newCart.save();

//       const cartDetail = new CartDetail({
//         cart_id: savedCart._id,
//         product_id,
//         qty,
//         check_status : 0,
//         status: 0,
//         added_dtime: dateTime,
//       });

//       const savedata = await cartDetail.save();
//       console.log(savedata);

//       const user = await Users.findById(user_id);
//       const product = await Userproduct.findById(product_id);
     
//       const cartResponse = {
//         _id: savedCart._id,
//         user_id: savedCart.user_id,
//         status: savedCart.status,
//         check_status: cartDetail.check_status,
//         qty: cartDetail.qty,
//         user_name: user.name,
//         product_name: product.name,
//         added_dtime: savedCart.added_dtime,
//         __v: savedCart.__v,
//       };

//       res.status(200).json({
//         message: 'Item added to new cart successfully',
//         cart: cartResponse,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while adding to cart' });
//   }
// };


// exports.addToCart = async (req, res) => {
//   try {
//     const { user_id, product_id, qty } = req.body;

//     const existingCart = await Cart.findOne({ user_id: req.body.user_id, status: 0 });

//     console.log(existingCart);

//     if (existingCart) {
//       const existingCartItem = await CartDetail.findOne({
//         cart_id: existingCart._id
//       });

//       if (existingCartItem) {
//         existingCartItem.product_id = product_id;
//         existingCartItem.qty = parseInt(qty);
//         await existingCartItem.save();
//       }else {
        
//         const cartDetail = new CartDetail({
//           cart_id: existingCart._id,
//           product_id,
//           qty,
//           check_status: 0,
//           status: 0,
//           added_dtime: dateTime,
//         });
//         await cartDetail.save();
//       }

//       const user = await Users.findById(user_id);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       const product = await Userproduct.findById(product_id);
//       if (!product) {
//         return res.status(404).json({ error: 'Product not found' });
//       }

//       const cartResponse = {
//         _id: existingCart._id,
//         user_id: existingCart.user_id,
//         status: existingCart.status,
//         check_status: existingCartItem.check_status,
//         qty: existingCartItem.qty,
//         user_name: user.name,
//         product_name: product.name,
//         added_dtime: existingCart.added_dtime,
//         __v: existingCart.__v,
//       };

//       return res.status(200).json({
//         message: 'Item added to existing cart successfully',
//         cart: cartResponse,
//       });
//     } else {

//       console.log("new");
//       const newCart = new Cart({
//         user_id,
//         status: 0,
//         added_dtime: dateTime,
//       });

//       const savedCart = await newCart.save();

//       const cartDetail = new CartDetail({
//         cart_id: savedCart._id,
//         product_id,
//         qty,
//         check_status: 0,
//         status: 0,
//         added_dtime: dateTime,
//       });

//       const savedata = await cartDetail.save();
//       console.log(savedata);

//       const user = await Users.findById(user_id);
//       const product = await Userproduct.findById(product_id);

//       const cartResponse = {
//         _id: savedCart._id,
//         user_id: savedCart.user_id,
//         status: savedCart.status,
//         check_status: cartDetail.check_status,
//         qty: cartDetail.qty,
//         user_name: user.name,
//         product_name: product.name,
//         added_dtime: savedCart.added_dtime,
//         __v: savedCart.__v,
//       };

//       res.status(200).json({
//         message: 'Item added to new cart successfully',
//         cart: cartResponse,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while adding to cart' });
//   }
// };



exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, qty } = req.body;

    const existingCart = await Cart.findOne({ user_id: req.body.user_id, status: 0 });

    console.log(existingCart);

    if (existingCart) {
      const existingCartItem = await CartDetail.findOne({
        cart_id: existingCart._id
      });

      if (existingCartItem) {
        existingCartItem.product_id = product_id;
        existingCartItem.qty = parseInt(qty);
        await existingCartItem.save();
      }else {
        
        const cartDetail = new CartDetail({
          cart_id: existingCart._id,
          product_id,
          qty,
          check_status: 0,
          status: 0,
          added_dtime: dateTime,
        });
        await cartDetail.save();
      }

      const user = await Users.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const product = await Userproduct.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const cartResponse = {
        _id: existingCart._id,
        user_id: existingCart.user_id,
        status: existingCart.status,
        check_status: existingCartItem.check_status,
        qty: existingCartItem.qty,
        user_name: user.name,
        product_name: product.name,
        added_dtime: existingCart.added_dtime,
        __v: existingCart.__v,
      };

      setTimeout(() => {
        removeItemAfterTime(existingCart._id); // savedata._id contains the ID of the added item
      }, 20 * 60 * 1000);

      return res.status(200).json({
        message: 'Item added to existing cart successfully',
        cart: cartResponse,
      });
    } 
    else {

      console.log("new");
      const newCart = new Cart({
        user_id,
        status: 0,
        added_dtime: dateTime,
      });

      const savedCart = await newCart.save();

      const cartDetail = new CartDetail({
        cart_id: savedCart._id,
        product_id,
        qty,
        check_status: 0,
        status: 0,
        added_dtime: dateTime,
      });

      const savedata = await cartDetail.save();
      console.log(savedata);

      const user = await Users.findById(user_id);
      const product = await Userproduct.findById(product_id);

      const cartResponse = {
        _id: savedCart._id,
        user_id: savedCart.user_id,
        status: savedCart.status,
        check_status: cartDetail.check_status,
        qty: cartDetail.qty,
        user_name: user.name,
        product_name: product.name,
        added_dtime: savedCart.added_dtime,
        __v: savedCart.__v,
      };

      const cartRemove = await Cartremove.findOne({}, { name: 1, _id: 0 });

      const durationInSeconds = cartRemove.name; // Assuming 'name' holds a duration in seconds

      console.log("removal time");
      console.log(durationInSeconds);

      // Convert duration from seconds to milliseconds
      const durationInMilliseconds = durationInSeconds * 60 * 1000;

      console.log("removal time in miliseond");
      console.log(durationInMilliseconds);

      setTimeout(() => {
        removeItemAfterTime(savedCart._id); // savedata._id contains the ID of the added item
       console.log('welcome')
      }, durationInMilliseconds);
      
      res.status(200).json({
        message: 'Item added to new cart successfully',
        cart: cartResponse,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while adding to cart' });
  }
};


exports.getCartListByUserId = async (req, res) => {
  try {
    const { user_id } = req.body;

    const existingCart = await Cart.findOne({ user_id, status: 0 });

    if (!existingCart) {
      return res.status(200).json({
        message: 'Cart is empty',
        cartList: [],
      });
    } 
    else 
    {
      const cartList = await CartDetail.find({ cart_id: existingCart._id, status: 0 })
        .populate({
          path: 'product_id',
          model: Userproduct,
          select: 'name images',
        })
        .exec();

      const user = await Users.findById(existingCart.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const formattedCartList = await Promise.all(cartList.map(async (cartItem) => {
      const product = await Userproduct.findOne({ _id: cartItem.product_id._id }).populate('category_id', 'name');
      const productImages = await Productimage.find({ product_id: cartItem.product_id._id }).limit(1);

        return {
          _id: cartItem._id,
          quantity: cartItem.qty,
          product_id: cartItem.product_id._id,
          product_name: cartItem.product_id.name,
          product_price : product.offer_price,
          category_name: product.category_id.name,
          images: productImages.length > 0 ? productImages[0].image : null,
          user_name: user.name,
          added_dtime: cartItem.added_dtime,
          status: cartItem.status,
        };

      }));

      res.status(200).json({
        message: 'Cart details retrieved successfully',
        cartList: formattedCartList,
      });
    }
  } catch (error) {
    console.error('Error while fetching cart list:', error);
    res.status(500).json({ error: 'An error occurred while fetching cart list' });
  }
};


const removeItemAfterTime = async (cartId) => {
  console.log('hi'+cartId)
  try {
    console.log("Timer expired for cart:", cartId);

    await Cart.findByIdAndDelete(cartId);
    // Perform logic to remove items from the cart after 1 minute (for testing purposes)
    const cartItems = await CartDetail.find({ cart_id: cartId, status: 0 });

    for (const cartItem of cartItems) {
      await CartDetail.findByIdAndDelete(cartItem._id);
      console.log(`Item ${cartItem._id} removed from the cart after 1 minute (test).`);
    }
  } catch (error) {
    console.error('Error while removing item from cart:', error);
  }
};

exports.deleteProductFromCart = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const existingCart = await Cart.findOne({ user_id, status: 0 });

    if (!existingCart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    const cartDetail = await CartDetail.findOne({
      cart_id: existingCart._id,
      product_id,
      status: 0,
    });

    if (!cartDetail) {
      return res.status(404).json({
        message: 'Product not found in cart',
      });
    }
    await cartDetail.remove();

    const cartDetailsCount = await CartDetail.countDocuments({ cart_id: existingCart._id });

    if (cartDetailsCount === 0) {
      await existingCart.remove();
    }

    res.status(200).json({
      message: 'Product removed from cart successfully',
    });
  } catch (error) {
    console.error('Error while deleting product from cart:', error);
    res.status(500).json({
      error: 'An error occurred while deleting product from cart',
    });
  }
};


exports.removeProductItem = async (req, res) => {
  try {
    const { cartdeatils_id } = req.body;

    const cartItem = await CartDetail.findById(cartdeatils_id);

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cartItem.qty -= 1;

    if (cartItem.qty === 0) {
      await cartItem.remove();
      return res.status(200).json({ message: 'Product is removed from the cart', respData: [] });
    } else {
      await cartItem.save();
    }

    return res.status(200).json({ message: 'Product deleted from cart successfully', respData: cartItem });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while removing item from cart' });
  }
};

exports.getCartProductChange = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "0",
        message: "Validation error!",
        respdata: errors.array(),
      });
    }

    const { cartdeatils_id } = req.body;

    const details = await CartDetail.findById(cartdeatils_id); 

    if (!details) {
      return res.status(404).json({
        status: "0",
        message: "Cart details not found!",
        respdata: {},
      });
    }

    details.check_status = details.check_status === 0 ? 1 : 0;

    const updateddetails = await details.save(); 

    res.status(200).json({
      status: "1",
      message: "Product details status updated successfully!",
      respdata: updateddetails,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Error!",
      respdata: error.message,
    });
  }
};




var express = require("express");
const Userproduct = require("../models/api/userproductModel");
const shippingchrgsModel = require("../models/api/shippingchrgsModel");
const Cart = require('../models/api/cartModel');
const CartDetail = require('../models/api/cartdetailsModel');
exports.ordercalculte = async (productid,userid, paymentmethod) => {
  try {
    console.log(productid,userid, paymentmethod);
    let taxable_value = 0;
    let pay_now = 0;
    let remaining_amount = 0;
    let cash_handling_charges = 0;
    let bid_price = 0;
    let booking_amount = 0;
    let total_price = 0;
    let gst = 0;
    const productdata = await Userproduct.findOne({ _id: productid });
    
    const existingCart = await Cart.findOne({ userid, status: 0 });
    const cartItem = await CartDetail.findOne({ cart_id: existingCart._id, status: 0 })
      .populate({
        path: 'product_id',
        model: Userproduct
      })
      .exec();
      let productprice;
    if(typeof cartItem.finalBidPrice != "undefined" && cartItem.finalBidPrice){
      productprice = cartItem.finalBidPrice;
      bid_price =  cartItem.finalBidPrice;
    }else{
      productprice =productdata.offer_price;
    }
    const valueofPHC = await shippingchrgsModel.findById({ _id: productdata.shipping_charges_id });
    const packing_handling_charge =  parseFloat(valueofPHC.amount);
    taxable_value = packing_handling_charge;
    gst = Number(taxable_value) * 28 / 100;
    if(paymentmethod == 0) {
      pay_now = parseFloat(productprice) * 0.10;
      remaining_amount = parseFloat(productprice) - parseFloat(pay_now);
      cash_handling_charges = parseFloat(productprice) * 0.05;
      taxable_value = packing_handling_charge + cash_handling_charges;
      gst = Number(taxable_value) * 28 / 100;
      booking_amount = parseFloat(pay_now) + parseFloat(cash_handling_charges) + packing_handling_charge + gst;
    }
    total_price = productprice + taxable_value + gst;
    const retValue = {
      bid_price: bid_price,
      packing_handling_charge: packing_handling_charge,
      cash_handling_charges : cash_handling_charges,
      taxable_value : taxable_value,
      pay_now: pay_now,
      remaining_amount : remaining_amount,
      gst: gst,   
      booking_amount: booking_amount,
      total_price: total_price,
      payement_method : paymentmethod
    }
    console.log("retValue",retValue);
    return retValue;
  } catch(e) {
    return ''; 
  }
};

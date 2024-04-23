const Userproduct = require("../../models/api/userproductModel");
const shippingchrgsModel = require("../../models/api/shippingchrgsModel");
const Cart = require('../../models/api/cartModel');
const CartDetail = require('../../models/api/cartdetailsModel');
exports.ordercalculte = async (productid,userid, paymentmethod) => {
  try {
    let taxable_value = 0;
    let pay_now = 0;
    let remaining_amount = 0;
    let cash_handling_charges = 0;
    const productdata = await Userproduct.findOne({ _id: productid });
    //const productprice = productdata.price;
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
  }else{
    productprice =productdata.price;
  }
    const valueofPHC = await shippingchrgsModel.findOne({ _id: productdata.productdata });
    const gst = parseFloat(productprice * 28) / 100;
    const packing_handling_charge =  parseFloat(valueofPHC.amount);
    taxable_value = packing_handling_charge;
    if(paymentmethod == 0) {
      pay_now = parseFloat(productprice) * 0.10;
      remaining_amount = parseFloat(productprice) - parseFloat(booking_amount);
      cash_handling_charges = parseFloat(productprice) * 0.05;
      const booking_amount = parseFloat(booking_amount) + parseFloat(cash_handling_charges) + valueofPHC + gst;
      taxable_value = packing_handling_charge + cash_handling_charges;
    }
    const total_price = productprice + taxable_value + gst;
    const retValue = {
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
    return retValue;
  } catch(e) {
    return ''; 
  }
};

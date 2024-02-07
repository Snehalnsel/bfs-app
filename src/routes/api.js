var express = require("express");
const app = express();
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const rounds = 10;
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
//controllers, models, services, helpers
const auth = require("../middlewares/auth");
const UserController = require("../controllers/api/userController");
const CategoryController = require("../controllers/api/categoryController");
const SubCategoryController = require("../controllers/api/subCategoryController");
const SearchController = require("../controllers/api/searchController");
const CartController = require("../controllers/api/cartController");
const WishlistController = require("../controllers/api/wishlistController");
const BrandController = require("../controllers/api/brandController");
const UserproductController = require("../controllers/api/userproductController");
const AddressBookController = require("../controllers/api/addressbookController");
const BidController = require("../controllers/api/bidController");
const DashboardController = require("../controllers/api/dashboardController");
const OrderController = require("../controllers/api/orderController");
const ShiprocketController = require("../controllers/api/shiprocketController");
const WebsiteController = require("../controllers/api/websiteController");
const HubController = require("../controllers/api/hubController");
const NotificationsController = require("../controllers/api/notificationsController");
const ShippingkitController = require("../controllers/api/shippingkitController");
// const helper = require("../helpers/helper");
//others
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");

//apis

router.get("/", function (req, res) {
  res.status(401).json({
    status: "0",
    message: "401 - Unauthorised!",
    respdata: {},
  });
});

router.post(
  "/signup",
  [
    check("email", "Email length should be 10 to 30 characters!")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
    check("password", "Password length should be 8 to 10 characters!").isLength(
      {
        min: 8
      }
    ),
    check("name", "This is a required field!").not().isEmpty().trim().escape(),
    check("phone_no", "This is a required field!").not().isEmpty().trim().escape(),
    check("deviceid", "This is a required field!").not().isEmpty().trim().escape(),
    check("devicename", "This is a required field!").not().isEmpty().trim().escape(),
    check("fcm_token", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserController.signUp
);

// router.post(
//   "/login",
//   [
//     check("email", "Email length should be 10 to 30 characters")
//       .isEmail()
//       .isLength({ min: 10, max: 30 }),
//     check("password", "Password length should be 8 to 10 characters").isLength({
//       min: 8,
//       max: 10,
//     }),
//     check("deviceid", "This is a required field!").not().isEmpty().trim().escape(),
//     check("devicename", "This is a required field!").not().isEmpty().trim().escape(),
//     check("fcm_token", "This is a required field!").not().isEmpty().trim().escape(),
//   ],
//   UserController.getLogin
// );

router.post(
  "/login",
  [
    check('email', 'Invalid email').optional().isEmail(),
    check('phone_no', 'Invalid phone number').optional().isMobilePhone(),
    check("password", "Password length should be 8 to 10 characters").isLength({
      min: 8,
      max: 10,
    }),
    check("deviceid", "This is a required field!").not().isEmpty().trim().escape(),
    check("devicename", "This is a required field!").not().isEmpty().trim().escape(),
    check("fcm_token", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserController.getLogin
);
//  auth routes
router.get("/users", auth.isAuthorized, UserController.getUsers);

router.post(
  "/profile",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  UserController.getProfile
);

router.post(
  "/edit-profile",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check("email", "Email length should be 10 to 30 characters!").isEmail().isLength({ min: 10, max: 30 }),
    // check("password", "Password length should be 8 to 10 characters!").isLength(
    //   {
    //     min: 8,
    //     max: 10,
    //   }
    // ),
    //check("title", "This is a required field!").not().isEmpty().trim().escape(),
    //check("name", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserController.editProfile
);

router.post(
  "/upload-image",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("img_base64", "This is a required field!").not().isEmpty(),
  ],
  UserController.uploadImage
);

router.post(
  "/logout",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  UserController.getLogout
);

router.post(
  "/forgot-password",
  [check("email", "This is a required field!").not().isEmpty().isEmail()],
  UserController.forgotPassword
);

router.post(
  "/reset-password",
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("otp", "This is a required field!").not().isEmpty(),
    check(
      "new_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
    check(
      "repeat_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
  ],
  UserController.resetPassword
);

router.post(
  "/change-password",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check(
      "old_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
    check(
      "new_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
  ],
  UserController.changePassword
);

router.post(
  "/delete-users",
  UserController.deleteuser
);

//category
router.get("/categories", CategoryController.getParentCategories);
router.post("/subcategories", CategoryController.getCategoriesWithMatchingParentId);
router.post("/subcategory", CategoryController.getAllSubcategoriesWithProducts);
router.get("/all-categories", CategoryController.getAllData);

router.post(
  "/view-category",
  [
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  CategoryController.viewData
);

router.post(
  "/subcategory-list",
  [
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  CategoryController.getSubcatData
);

router.post(
  "/view-subcategory",
  [
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  CategoryController.getCategoryWithParent
);

const storage = multer.diskStorage({
  destination: './public/images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + fileExtension);
  },
});

// const upload = multer({ storage: storage });
const upload = multer({ storage: storage, limits: { files: 5 } });
const firstSetUpload = multer({ storage: storage, limits: { files: 5 } }).array('firstSetFiles', 5);
const secondSetUpload = multer({ storage: storage, limits: { files: 5 } }).array('secondSetFiles', 5);

router.post(
  "/add-category",
  auth.isAuthorized,
  [],
  upload.single('image'),
  CategoryController.addData
);

router.post(
  "/edit-category",
  auth.isAuthorized,
  [
    check("category_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("category_name", "This is a required field!").not().isEmpty().trim().escape(),
    check("description", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  CategoryController.editData
);

router.post(
  "/delete-category",
  auth.isAuthorized,
  [
    check("category_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  CategoryController.deleteData
);

//sub category
router.get("/sub-categories", SubCategoryController.getData);

router.post(
  "/view-sub-category",
  [
    check("sub_category_id", "This is a required field!").not().isEmpty().trim()
      .escape(),
  ],
  SubCategoryController.viewData
);

router.post(
  "/get-sub-category",
  [
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  SubCategoryController.getSubCatData
);

router.post(
  "/add-sub-category",
  auth.isAuthorized,
  upload.single('image'), 
  SubCategoryController.addData
);

router.post(
  "/edit-sub-category",
  auth.isAuthorized,
  [
    check("sub_category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("sub_category_name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("description", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  SubCategoryController.editData
);

router.post(
  "/delete-sub-category",
  auth.isAuthorized,
  [
    check("sub_category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  SubCategoryController.deleteData
);

router.post("/add-users", (req, res) => {

  var data = req.body;
  db.collection("users").insertMany(data, function (err, result) {
    if (err) {
      res.status(400).json({
        status: "1",
        message: "Not added!",
        respdata: err,
      });
    } else {
      res.status(200).json({
        status: "1",
        message: "Added!",
        respdata: result,
      });
    }
  });
});

router.post("/add-setting", (req, res) => {

  var data = req.body;
  db.collection("app_settings").insertOne(data, function (err, result) {
    if (err) {
      res.status(400).json({
        status: "1",
        message: "Not added!",
        respdata: err,
      });
    } else {
      res.status(200).json({
        status: "1",
        message: "Added!",
        respdata: result,
      });
    }
  });
});

router.post(
  "/global-search",
  [
    check("search", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("type", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isIn(["category", "brand", "product"])
      .withMessage("Type mismatch!"),
  ],
  SearchController.searchData
);

router.post(
  "/filter-search",
  [],
  SearchController.filterData
);

router.post("/filter-bestdeal",   [],SearchController.filterByOfferPrice );

router.post(
  "/delete-user",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  UserController.deleteData
);

router.post(
  "/add-to-cart",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("product_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("qty", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("status", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.addToCart
);

router.post(
  "/cart-list",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.getCartListByUserId
);

router.post(
  "/cart-productstatus",
  auth.isAuthorized,
  [
    check("cart_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.getCartProductChange
);

router.post(
  "/remove-cart-product",
  auth.isAuthorized,
  [
    check("cartdeatils_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.removeProductItem
);

router.post(
  "/delete-cart-product",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("product_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.deleteProductFromCart
);

router.post(
  "/checked-cart-product",
  auth.isAuthorized,
  [
    check("cartdeatils_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  CartController.getCartProductChange
);

router.post(
  "/add-to-wishlist",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("product_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  WishlistController.addToWishlist
);

router.post(
  "/wish-list",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  WishlistController.getWishlistByUserId
);

router.post(
  "/delete-wishlist-product",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("product_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  WishlistController.deleteProductFromWishlist
);

router.post(
  "/add-brand",
  auth.isAuthorized,
  [],
  upload.single('image'),
  BrandController.addData
);

router.post(
  "/delete-brand",
  auth.isAuthorized,
  [
    check("brand_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  BrandController.deleteBrand
);

const checkLogin = (req, res, next) => {
    
    console.log('Check Login>>>>>>>>>>');
    console.log(req.isAuthenticated());
  // Check if the user is authenticated/logged in
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware
    return next();
  } else {
    // User is not authenticated, handle accordingly (e.g., redirect to login page)
    return res.redirect('/userlogin'); // Redirect to your login route
  }
};

router.post(
  "/add-product",
  //checkLogin,
  auth.isAuthorized,
  [],
  upload.array('image', 5), 
  UserproductController.addData
);



router.post(
  "/productcondition-list",
  [],
  UserproductController.getProductconditionList
);

router.post(
  "/get-sizelist",
  auth.isAuthorized,
  [ check("category_id", "This is a required field!")
  .not()
  .isEmpty()
  .trim()
  .escape(),
check("brand_id", "This is a required field!")
  .not()
  .isEmpty()
  .trim()
  .escape()],
  UserproductController.getSizeList
);

router.post(
  "/sizelist",[],
  UserproductController.getSizeData
);


router.post(
  "/brandlist",[],
  UserproductController.getBrandData
);

router.post(
  "/myproductlist",
  [],
  UserproductController.getProductData
);

router.post(
  "/productlistbyid",
  [],
  UserproductController.getProductDataById
);

router.post(
  "/productdetailsbyid",
  [
    check("product_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserproductController.getDetailsById
);


router.post(
  "/fetch-product",
  [
    check("product_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserproductController.getProduct
);

router.post(
  "/update-product",
  [],
  upload.array('image', 5), 
  UserproductController.updateProduct
);


router.post(
  "/delete-product",
  [
    check("product_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UserproductController.deleteProduct
);

router.post(
  "/update-productbid",
  [],
  UserproductController.updateProductBidDetails
);

// router.post(
//   "/get-brandlist",
//   auth.isAuthorized,
//  [],
//   BrandController.getBrandList
// );


router.post(
  "/get-brandlist",
  auth.isAuthorized,
 [],
  BrandController.getBrandList
);

router.post(
  "/add-addressbook",
  auth.isAuthorized,
  [
    check("user_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("street_name", "This is a required field!").not().isEmpty(),
    check("address_name", "This is a required field!").not().isEmpty(),
    check("address1", "This is a required field!").not().isEmpty(),
    check("city_name", "This is a required field!").not().isEmpty().trim().escape(),
    check("state_name", "This is a required field!").not().isEmpty().trim().escape(),
    check("pin_code", "This is a required field!").not().isEmpty().trim().escape(),
    check("flag", "This is a required field!").not().isEmpty().trim().escape()
  ],
  OrderController.addAddress
);


router.post(
  "/useraddressbooklist",
  auth.isAuthorized, 
  [
    check("user_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  AddressBookController.getAddressesByUser
);

router.post(
  "/get-addressbookdetails",
  auth.isAuthorized, 
  [
    check("addressbook_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  AddressBookController.getAddressdetails
);


router.post(
  "/update-addressbook",
  auth.isAuthorized, 
  [
    check("addressbook_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("user_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("street_name", "This is a required field!").not().isEmpty(),
    check("address1", "This is a required field!").not().isEmpty(),
    check("city_name", "This is a required field!").not().isEmpty().trim().escape(),
    check("state_name", "This is a required field!").not().isEmpty().trim().escape(),
    check("pin_code", "This is a required field!").not().isEmpty().trim().escape(),
    check("flag", "This is a required field!").not().isEmpty().trim().escape()
  ],
  AddressBookController.updateAddress
);

router.post(
  "/delete-addressbook",
  auth.isAuthorized, 
  [
    check("addbook_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  AddressBookController.deleteAddress
);


router.post(
  "/setdefault-address",
  auth.isAuthorized, 
  [
    check("user_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("addbook_id", "This is a required field!").not().isEmpty().trim().escape()
  ],
  AddressBookController.toggleDefaultStatus
);

router.get(
  "/app-home",
  [],
  DashboardController.homedetails
);



router.get(
  "/whats-hot",
  [],
  DashboardController.getWhatsHotProducts
);


router.get(
  "/top-categories",
  [],
  DashboardController.getTopCategories
);

router.get(
  "/just-sold",
  [],
  DashboardController.getJustSoldProducts
);

router.post(
  "/start-bidding",
  auth.isAuthorized, 
  [
    check("buyer_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("seller_id", "This is a required field!").not().isEmpty().trim().escape(),
    check("product_id", "This is a required field!").not().isEmpty().trim().escape(),
    // check("price", "This is a required field!").not().isEmpty().trim().escape(),
    //check("seller_price", "This is a required field!").not().isEmpty().trim().escape(),
    check("status", "This is a required field!").not().isEmpty().trim().escape(),
    check("chat_status", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  BidController.addData
);

router.post(
  "/seller-listing",
  auth.isAuthorized, 
  [
    check("buyer_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  BidController.sellerlistData
);

router.post(
  "/buyer-listing",
  auth.isAuthorized, 
  [
    check("seller_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  BidController.buyerlistingData
);



router.post(
  "/update-biddetails",
  auth.isAuthorized, 
  [
    check("bid_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  BidController.updateBid
);

router.post(
  "/biddetails",
  auth.isAuthorized, 
  [
    check("bid_id", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  BidController.getbiddetails
);

router.post(
  "/checkout",
  auth.isAuthorized, 
  [],
  OrderController.checkout
);

router.post(
  "/update-order",
  auth.isAuthorized, 
  [
    check("order_id", "This is a required field!").not().isEmpty(),
  ],
  OrderController.updateOrderById
);

router.post(
  "/cancel-order",
  OrderController.cancelOrderById
);

router.get(
  "/cancelorderbybuyer/:order_id",
  OrderController.cancelOrderByBuyer
);


router.post(
  "/orderlist",
  //auth.isAuthorized, 
  [],
  OrderController.getOrderListByUser
);


router.post(
  "/selllist",
  //auth.isAuthorized, 
  [],
  OrderController.getOrdersBySeller
);

router.post(
  "/orderdetails",
  auth.isAuthorized, 
  [],
  OrderController.getOrderDetails
);

router.post(
  "/update-pickuploaction",
  auth.isAuthorized, 
  [],
  OrderController.updatePickupAddessByOrderId
);

router.post(
  "/update-deliveryloaction",
  auth.isAuthorized, 
  [],
  OrderController.updateDeliveryaddressByOrderId
);

router.post(
  "/generate-awbno",
  auth.isAuthorized, 
  [
    check("order_id", "This is a required field!").not().isEmpty(),
  ],
  ShiprocketController.getAWBnoById
);

router.post(
  "/courierslist",
  auth.isAuthorized, 
  [],
  ShiprocketController.getListOfCourires
);

router.post(
  "/check-Couriresserviceability",
  auth.isAuthorized, 
  [],
  ShiprocketController.getCourierServiceability
);

router.post(
  "/generate-pickup",
  auth.isAuthorized, 
  [],
  ShiprocketController.getShipmentPickup
);

router.post(
  "/get-allorderlist",
  auth.isAuthorized, 
  [],
  ShiprocketController.getAllOrderList
);

router.post(
  "/get-orderdetails",
  auth.isAuthorized, 
  [],
  ShiprocketController.getOrderDetail
);

router.post(
  "/ordertrackbyawb",
  auth.isAuthorized, 
  [],
  ShiprocketController.getTrackByAWB
);

router.post(
  "/trackbyorderid",
  auth.isAuthorized, 
  [],
  ShiprocketController.getTrackByorderid
);

router.post(
  "/cancelshipment",
  auth.isAuthorized, 
  [],
  ShiprocketController.getCancelShipment
);

router.post(
  "/specificshipmentdetails",
  auth.isAuthorized, 
  [],
  ShiprocketController.getParticularShipmentDetails
);

router.post(
  "/allshipmentdetails",
  auth.isAuthorized, 
  [],
  ShiprocketController.getAllShipmentDetails
);

router.post(
  "/generate-manifest",
  auth.isAuthorized, 
  [],
  ShiprocketController.getGenerateManifest
);

router.post(
  "/generate-label",
  auth.isAuthorized, 
  [],
  ShiprocketController.getGenerateLabel
);

router.post(
  "/generate-invoice",
  auth.isAuthorized, 
  [],
  ShiprocketController.getGenerateInvoice
);


router.post(
  "/all-sublist",
  [],
  CategoryController.getSubAllData
);

router.post(
  "/generate-sellerpickup",
  auth.isAuthorized, 
  [],
  OrderController.generatepickupforseller
);

router.get("/best-deal",[],SearchController.getBestDealList);

//hub list
router.get("/hublist",[],HubController.getHubList);

//notification 
router.post("/add-notifications", auth.isAuthorized,[],NotificationsController.addData);
router.post("/notificationslist", auth.isAuthorized, [],NotificationsController.listofNotification);
router.post("/readnotification", auth.isAuthorized, [],NotificationsController.getNotificationById);
router.post("/updatenotification", auth.isAuthorized, [],NotificationsController.updateNotificationById);
router.post("/deletenotification", auth.isAuthorized, [],NotificationsController.deleteNotificationById);


// generate 
router.post("/get-shipmentkit", auth.isAuthorized,[],ShippingkitController.addShipmentData);

router.get("/get-shipmentkitweb/:id",[],WebsiteController.addShipmentData);


// WEBSITE API'S
router.get("/home",[],DashboardController.getData);


router.get(
  "/top-categoriesweb",
  [],
  DashboardController.getTopCategoriesweb
);

router.get("/bestdeal",[],WebsiteController.getBestDealProductsweb);
router.get("/whatshot",[],WebsiteController.getWhatsHotProductsweb);
router.get("/justsold",[],WebsiteController.getJustSoldProductsweb);
router.get("/productdeatils/:id",[],WebsiteController.productData);
router.get("/privacy-policy",[],WebsiteController.privacypolicyData);
router.get("/trems",[],WebsiteController.tremsandconditionData);
router.get("/registration",[],WebsiteController.registration);

router.get("/headerData",[],DashboardController.getHeaderData);

router.post(
  "/signin",
  [
    check("name", "This is a required field!").not().isEmpty().trim().escape(),
    check("phone_no", "This is a required field!").not().isEmpty().trim().escape(),
    check("email", "Email length should be 10 to 30 characters!")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
    check("password", "Password length should be 8 to 10 characters!").isLength(
      {
        min: 8
      }
    ),
    check("confirmpassword", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  WebsiteController.signin
);

router.post("/userlogin",cors(),[check("email", "Email length should be 10 to 30 characters")
.isEmail(),
check("password", "Password length should be 8 to 10 characters").isLength({
min: 8,
max: 10,
}),
  ],
  WebsiteController.getUserLogin
);

router.post("/sign-out",[],WebsiteController.signOut);


// // Web user Profile API's

router.get("/my-account",[],WebsiteController.myAccount);
router.get("/edit-profile",[],WebsiteController.editProfile);
router.get("/add-address",[],WebsiteController.addAddress);

// Product API's
router.get("/webSubCategories", WebsiteController.getParentCategories);
router.get("/subcategory",CategoryController.getAllSubcategoriesWithProducts);
// router.get("/websubcategories/:id",[],WebsiteController.getSubCategoriesWithMatchingParentId);

router.get("/websubcategoriesproducts/:id", cors(), (req, res) => {
  const page = req.query.page;
  WebsiteController.getSubCategoriesProducts(page, req, res);
});

router.get("/websubcategoriesproductswithsort/:id/:sortid", cors(), (req, res) => {
  const page = req.query.page;
  WebsiteController.getSubCategoriesProductswithSort(page, req, res);
});
// Profile Edit API's
router.post("/useredit",
    [
      check("name", "This is a required field!").not().isEmpty().trim().escape(),
      check("phone_no", "This is a required field!").not().isEmpty().trim().escape(),
      check("email", "Email length should be 10 to 30 characters!")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
  ],WebsiteController.userUpdate
);

router.post("/user-new-checkout-address",[],WebsiteController.userNewCheckOutAddressAdd);

router.post("/adduseraddress",[],WebsiteController.userAddressAdd);

router.get("/delete-address/:id",[],WebsiteController.deleteUserAddress);

router.get("/my-post/:id",[],WebsiteController.userWisePost);

router.get("/add-post",[],WebsiteController.addPostView);

router.post("/addnewpost",[], upload.array('image', 5),WebsiteController.addNewPost);

router.get("/edit-mypost/:id",[],WebsiteController.editUserWisePost);

router.post("/updatepostdata",[],upload.fields([{
  name: 'img0', maxCount: 1
}, {
  name: 'img1', maxCount: 1
},{
  name: 'img2', maxCount: 1
},{
  name: 'img3', maxCount: 1
},{
  name: 'img4', maxCount: 1
},]),WebsiteController.updatePostData);

// Add To cart 
router.post("/addtocart/:id",[],WebsiteController.addToCart);

// Show Cart Details
router.get("/show-cart-details",[],WebsiteController.viewCartListByUserId);

router.get("/delete-cart/:id",[],WebsiteController.deleteCart); //auth.isAuthorized

// Wishlist Web Start
router.post("/add-to-wishlist-web/:id",[],WebsiteController.addToWishlistWeb);

router.get("/show-wishlist-details",[],WebsiteController.viewWishListByUserId);

router.get("/remove-wishlist-web/:id",[],WebsiteController.removeWishlistWeb);

// Wishlist Web End

// Web Order List

router.get("/web-my-order",WebsiteController.myOrderWeb);

router.get("/web-myorder-details/:id",WebsiteController.myOrderDetailsWeb);

router.get("/bannerlist",[],DashboardController.bannerlist);

router.post("/change-profile-image-web",[],upload.array('image', 1),WebsiteController.changeProfileImgWeb);

router.get("/checkout-web",WebsiteController.checkoutWeb);

router.post("/placed-order",WebsiteController.userPlacedOrder);



//Routes Added By Palash

router.get(
  "/bid-for-product/:bid_id",
  [],
  BidController.bidListProduct
);
router.get(
  "/bid-for-product",
  [],
  BidController.bidListProduct
);
router.post(
  "/bid-check-exist-reccord",
  [],
  BidController.bidExistReccord
);
router.post(
  "/search-by-keyword",
  [],
  SearchController.searchByKeyword
);

router.post("/ajax-userlogin",cors(),[check("email", "Email length should be 10 to 30 characters"),
// .isEmail(),
check("password", "Password length should be 8 to 10 characters").isLength({
min: 8,
max: 10,
}),
  ],
  WebsiteController.ajaxGetUserLogin
);


router.post("/user-relogin",cors(),
  WebsiteController.userRelogin
);
router.post("/user-filter",cors(),
  WebsiteController.userFilter
);

router.get("/forgot-password",cors(),
  WebsiteController.forgotPassword
);

router.post("/forgotpassword-sendotp",cors(),
  WebsiteController.sendotp
);


router.post(
  "/resetpassword",
  [
    check(
      "old_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
    check(
      "new_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
    check(
      "repeat_password",
      "Password length should be 8 to 10 characters!"
    ).isLength({
      min: 8,
      max: 10,
    }),
  ],
  WebsiteController.changePassword
);

module.exports = router;

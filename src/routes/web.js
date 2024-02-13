var express = require("express");
var router = express.Router();
var moment = require("moment");
const cors = require("cors");
const mongoose = require("mongoose");
const db = mongoose.connection;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenSecret = "a2sd#Fs43d4G3524Kh";
const url = require("url");
const { check, validationResult } = require("express-validator");
const multer = require('multer');
// const upload = multer({ dest: 'public/images/' }); 
const path = require('path');
const rounds = 10;
//controllers, models, services, helpers
const auth = require("../middlewares/auth");
const DashboardController = require("../controllers/web/dashboardController");
const AdminUserController = require("../controllers/web/adminUserController");
const AppusersController = require("../controllers/web/appUsersController");
const UsersController = require("../controllers/web/usersController");
const BodyFocusController = require("../controllers/web/bodyFocusController");
const SubFilterController = require("../controllers/web/subFilterController");
const SizeController = require("../controllers/web/sizeController");
const BestDealController = require("../controllers/web/bestdealController");
const ShippingchargesController = require("../controllers/web/ShippingchargesController");
const BrandController = require("../controllers/web/brandController");
const CatsizeController = require("../controllers/web/catsizeController");
const ProductController = require("../controllers/web/productController");
const BidController = require("../controllers/web/bidController");
const AppSettingController = require("../controllers/web/appSettingsController");
const OrderController = require("../controllers/web/orderController");
const ProductconditionController = require("../controllers/web/productconditionController");
const HubController = require("../controllers/web/hubController");
const ShippingkitController = require("../controllers/web/shippingkitController");
const CartremoveController = require("../controllers/web/cartremoveController");
const BannerController = require("../controllers/web/bannerController");
const GenderController = require("../controllers/web/genderController");
const IpaddressController = require("../controllers/web/ipaddressController");

var session = require("express-session");
router.use(
  session({
    secret: "fd$e43W7ujyDFw(8@tF",
    // store: redisStore,
    saveUninitialized: true,
    resave: true,
  })
);

router.get("/", cors(), function (req, res) {
  // res.send("Front end!");
  let isAdminLoggedIn = (typeof req.session.admin != "undefined") ? req.session.admin.userId : "";
  const requrl = url.format({
    protocol: req.protocol,
    host: req.get("host"),
    // pathname: req.originalUrl,
  });
  req.app.locals.requrl = requrl;


  if (!req.session.admin) {
    var pageTitle = req.app.locals.siteName + " - Login";

    res.render("pages/index.ejs", {
      status: 1,
      siteName: req.app.locals.siteName,
      pageTitle: pageTitle,
      year: moment().format("YYYY"),
      isAdminLoggedIn:isAdminLoggedIn
    });
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/dashboard", cors(), DashboardController.getData);

router.get("/profile", cors(), UsersController.getProfile);

router.post(
  "/edit-profile",
  [
    check("fullName", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check(
    //   "newPassword",
    //   "Password length should be 8 to 10 characters"
    // ).isLength({
    //   min: 8,
    //   max: 10,
    // }),
  ],
  UsersController.editProfile
);
router.post("/admin-relogin",cors(),
UsersController.adminRelogin
);
router.post(
  "/ajax-userlogin",
  cors(),
  [
    check("email", "Email length should be 10 to 30 characters")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
    check("password", "Password length should be 8 to 10 characters").isLength({
      min: 8,
    }),
  ],
  UsersController.ajaxAdminLogin
);

/*router.post(
  "/login",
  cors(),
  [
    check("email", "Email length should be 10 to 30 characters")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
    check("password", "Password length should be 8 to 10 characters").isLength({
      min: 8,
    }),
  ],
  UsersController.getLogin
);*/

router.post(
  "/signup",
  cors(),
  [
    check("email", "Email length should be 10 to 30 characters!")
      .isEmail()
      .isLength({ min: 10, max: 30 }),
    check("password", "Password length should be 8 to 10 characters!").isLength(
      {
        min: 8,
        max: 10,
      }
    ),
    check("name", "This is a required field!").not().isEmpty().trim().escape(),
  ],
  UsersController.signUp
);

router.post(
  "/sign-out",
  cors(),
  // auth.isAuthorized,
  // [
  //   check("user_id", "This is a required field!")
  //     .not()
  //     .isEmpty()
  //     .trim()
  //     .escape(),
  // ],
  UsersController.signOut
);

// Admin Users

router.get("/admin-users", cors(), AdminUserController.getData);
router.get("/add-admin-users", cors(), AdminUserController.addData);


router.post(
  "/create-admin-users",
  cors(),
  [
    check("name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("email", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("pwd", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  AdminUserController.createData
);

router.get("/edit-admin-users/:id", cors(), AdminUserController.editData);

router.post(
  "/update-admin-users/:user_id",
  cors(),
  [
    check("name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  AdminUserController.updateData
);

router.get("/delete-admin-users/:user_id", cors(), AdminUserController.deleteData);

// router.post(
//   "/delete-admin-users/:user_id",
//   [
//     check("user_id", "This is a required field!")
//       .not()
//       .isEmpty()
//       .trim()
//       .escape(),
//   ],
//   AdminUserController.deleteData
// );

//app users
router.get("/app-users", cors(), AppusersController.getData);
router.get("/add-app-users", cors(), AppusersController.addData);


router.post(
  "/create-app-users",
  cors(),
  [
    check("name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  AppusersController.createData
);

router.get("/edit-app-users/:id", cors(), AppusersController.editData);


router.post(
  "/update-app-users/:user_id",
  cors(),
  [
    check("name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  AppusersController.updateData
);

router.get(
  "/delete-app-users/:id",
  [
    check("id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  AppusersController.deleteData
);
//category APIS
router.get("/body-focus", cors(), BodyFocusController.getData);
router.get("/add-body-focus", cors(), BodyFocusController.addData);


const storage = multer.diskStorage({
  destination: './public/images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create-body-focus",
  cors(),
  [],
  upload.single('image'),
  BodyFocusController.createData
);
router.get("/edit-body-focus/:id", cors(), BodyFocusController.editData);
router.post('/update-body-focus', cors(), [], upload.single('image'), BodyFocusController.updateData);
router.get("/body-focus-statu-change/:id", cors(), BodyFocusController.updateStatusData);
router.get("/body-focus-status/:id", cors(), BodyFocusController.statusData);
//SUB CATEGORY APIS

// router.get("/body-focus-subcat/:page", cors(), BodyFocusController.getSubcatData);

router.get("/body-focus-subcat", cors(), (req, res) => {
  const page = req.query.page;
  const searchType = req.query.searchType;
  const searchValue = req.query.searchValue;
  BodyFocusController.getSubcatData(page, searchType, searchValue, req, res);
});

router.get("/sreach-subcat/:sreach_category/:sreach_product/:page", cors(), BodyFocusController.getSubcatDataBySearches);

router.get("/edit-sub-cat/:id", cors(), BodyFocusController.editSubCatData);

router.post(
  "/update-sub-cat",
  cors(),
  [],
  upload.single('image'),
  BodyFocusController.updateSubCatData
);

router.get(
  "/delete-body-focus/:id",
  [
    check("id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  BodyFocusController.deleteData
);

router.get("/brand", cors(), BrandController.getData);
router.get("/add-brand", cors(), BrandController.addData);
router.post(
  "/create-brand",
  cors(),
  [],
  upload.single('image'),
  BrandController.createData
);
router.get("/edit-brand/:id", cors(), BrandController.editData);

router.post(
  "/update-brand",
  cors(),
  [],
  upload.single('image'),
  BrandController.updateData
);
router.get("/brand-statu-change/:id", cors(), BrandController.updateStatusData);
router.get(
  "/delete-brand/:id",
  [], BrandController.deleteData
);

router.get("/size", cors(), SizeController.getData);
router.get("/add-size", cors(), SizeController.addData);
router.post(
  "/create-size",
  cors(),
  [
    check("size_name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  SizeController.createData
);
// router.get("/edit-size/:id", cors(), SizeController.editData);
// router.post(
//   "/update-size",
//   cors(),
//   [],
//   SizeController.updateData
// );
router.get("/size-status-change/:id", cors(), SizeController.updateStatusData);
router.get("/delete-size/:id", cors(), SizeController.deleteData);

router.get("/catbrand", cors(), CatsizeController.getData);
router.get("/add-catbrand", cors(), CatsizeController.addData);
router.post(
  "/create-catbrand",
  cors(),
  [
    check("category_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("brand_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("size_id", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  CatsizeController.createData
);

router.get("/editdetails/:id", cors(), CatsizeController.editData);
router.post("/updatedata", cors(), CatsizeController.updateData);

router.get("/productsize-status-change/:id", cors(), CatsizeController.updateStatusData);

router.get("/deleteproductsize/:id", cors(), CatsizeController.deleteData);

// product list 
// router.get("/productlist", cors(), (req, res) => {
//   const page = req.query.page;
//   const searchType = req.query.searchType;
//   const searchValue = req.query.searchValue;
//   ProductController.getData(page, searchType, searchValue, req, res);
// });
router.get("/productlist", cors(), ProductController.getData);
router.get("/productdetails/:id", cors(), ProductController.detailsData);
router.post("/updateproductdetails", cors(), upload.array('images[]'), ProductController.updatedetailsData);

router.get("/status-change/:id", cors(), ProductController.updateStatusData);
router.get("/delete-product/:id", cors(), ProductController.deleteData);

//app settings
router.get("/app-settings", cors(), AppSettingController.getData);

router.get("/add-app-settings", cors(), AppSettingController.addData);


router.post(
  "/create-app-settings",
  cors(),
  [],
  AppSettingController.createData
);

router.get("/app-details/:id", cors(), AppSettingController.editData);
router.post("/update-app-details", cors(), AppSettingController.updateData);
router.get("/delete-appsettings/:id", cors(), AppSettingController.deleteData);

//Bid Management
router.get("/bid-listing", cors(), BidController.getData);
router.get("/biddetails/:id", cors(), BidController.detailsData);
router.post("/updatebiddetails", cors(), [check("bid_id", "This is a required field!").not().isEmpty().trim().escape(),], BidController.updatedetailsData);
router.get("/delete-biddetails/:id", cors(), BidController.deleteData);

//Order Management
router.get("/orderlist", cors(), OrderController.getOrderList);
router.get("/orderdetails/:id", cors(), OrderController.getOrderDetails);
router.post("/update-orderdetails", cors(), [], OrderController.updateData);
router.get("/shipmentdetails/:id", cors(), OrderController.getShipmentList);
router.get("/delete-orderdetails/:id", cors(), OrderController.deleteData);
router.get("/orderplace/:id", cors(), OrderController.orderplaced);
// router.get("/generateawb/:id", cors(),OrderController.getAWBnoById);
router.get("/generateawb/:id/:courier_company_id", cors(), OrderController.getAWBnoById);
router.get("/generatelabel/:id", cors(), OrderController.getGenerateLabel);
router.get("/generateinvoice/:id", cors(), OrderController.getGenerateInvoice);
router.get("/check-Couriresserviceability/:id", cors(), OrderController.getCourierServiceability);
router.get("/check-schedule/:id", cors(), OrderController.getList);
router.get("/schedule-pickup/:id", cors(), OrderController.getShipmentPickup);


//Product Condition
router.get("/productcondition", cors(), ProductconditionController.getData);
router.get("/add-productcondition", cors(), ProductconditionController.addData);
router.post(
  "/create-productcondition",
  cors(),
  [],
  ProductconditionController.createData
);
router.get("/productcondition-status-change/:id", cors(), ProductconditionController.updateStatusData);
router.get("/edit-productcondition/:id", cors(), ProductconditionController.editData);
router.post("/updateproductcondition", cors(), [], ProductconditionController.updateData);
router.get("/delete-productcondition-status/:id", cors(), ProductconditionController.deleteData);

//HUB LIST

router.get("/hublist", cors(), HubController.getData);
router.get("/add-hubdata", cors(), HubController.addData);
router.post("/create-hubdata", cors(), [], HubController.createData);
router.get("/edit-hubdata/:id", cors(), HubController.editData);
router.get("/hub-status-change/:id", cors(), HubController.updateStatusData);

// Best Deal Master (Add List)

router.get("/bestdeal", cors(), BestDealController.getData);
router.get("/add-bestdeal", cors(), BestDealController.addData);
router.post(
  "/create-bestdeal",
  cors(),
  [
    check("size_name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  BestDealController.createData
);
// Shipping Charges Master (Add List)
router.get("/shippingchrgs", cors(), ShippingchargesController.getData);
router.get("/add-shippingchrgs", cors(), ShippingchargesController.addData);
router.post(
  "/create-shippingchrgs",
  cors(),
  [
    check("shipping_name", "This is a required field!")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  ShippingchargesController.createData
);
//  SHIPPING KIT MASTER
router.get("/shippingkitlist", cors(), ShippingkitController.getOrderList);
router.get("/shippingkitdetails/:id", cors(), ShippingkitController.getShipmentKit);
router.get("/hubselect/:id", cors(), ShippingkitController.getHublist);
router.post("/add-hubaddress", cors(), [], ShippingkitController.updateData);
router.get("/shipmentplace/:id", cors(), ShippingkitController.kitorderplaced);
router.get("/couriresserviceability/:id", cors(), ShippingkitController.checkCourierServiceability);
router.get("/generateawbforkit/:id/:courier_company_id", cors(), ShippingkitController.getAWBnoById);
router.get("/generatelabelforkit/:id", cors(), ShippingkitController.getGenerateLabelforkit);
router.get("/generateinvoiceforkit/:id", cors(), ShippingkitController.getGenerateInvoiceforkit);
router.get("/schedule-pickupforkit/:id", cors(), ShippingkitController.getShipmentPickup);
//Cart Remove Time
router.get("/carttime", cors(), CartremoveController.getData);
router.get("/add-carttime", cors(), CartremoveController.addData);
router.post(
  "/create-carttime",
  cors(),
  [],
  CartremoveController.createData
);
router.get("/carttime-details/:id", cors(), CartremoveController.editData);
router.post("/update-carttime", cors(), CartremoveController.updateData);
//Banner
router.get("/banner-list", cors(), BannerController.getData);
router.get("/add-banner", cors(), BannerController.addData);
router.post(
  "/create-banner",
  cors(),
  upload.single('image'),
  BannerController.createData
);
router.get("/banner/:id", cors(), BannerController.editData);
router.post("/update-banner", cors(), upload.single('image'), BannerController.updateData);
router.get("/delete-banner/:id", cors(), BannerController.deleteData);
router.get("/banner-status-change/:id", cors(), BannerController.updateStatusData);
//Gender
router.get("/genderlist", cors(), GenderController.getData);
router.get("/add-gender", cors(), GenderController.addData);
router.post("/create-gender",GenderController.createData);
router.get("/delete-gender/:id", cors(), GenderController.deleteData);

//IP Address LIST
router.get("/iplist", cors(), IpaddressController.getList);

//download product excel
router.get("/download-product-excel", cors(), ProductController.downloadProductExcel);
router.get("/download-order-excel", cors(), OrderController.downloadOrderExcel);

module.exports = router;
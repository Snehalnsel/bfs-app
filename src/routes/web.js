var express = require("express");
var router = express.Router();
var moment = require("moment");
const cors = require("cors");

const url = require("url");


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
    res.redirect("/admin/dashboard");
  }
});

module.exports = router;
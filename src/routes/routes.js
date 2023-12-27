var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", function (req, res) {
  var mascots = [
    { name: "John", organization: "Java", birth_year: 2016 },
    { name: "Smith", organization: "Linux", birth_year: 1995 },
    { name: "Coby", organization: "Docker", birth_year: 2014 },
  ];
  var tagline = "Hello World!";

  res.render("pages/index", {
    mascots: mascots,
    tagline: tagline,
    moment: moment,
  });
});

router.get("/about", function (req, res) {
  res.render("pages/about", {
    moment: moment,
  });
});

router
  .route("/book")
  .get(function (req, res) {
    res.send("Get a random book");
  })
  .post(function (req, res) {
    res.send("Add a book");
  })
  .put(function (req, res) {
    res.send("Update the book");
  });

router.get("/things/:id([0-9]{5})", function (req, res) {
  // console.log(req.params);
  res.send("id: " + req.params.id);
});

module.exports = router;

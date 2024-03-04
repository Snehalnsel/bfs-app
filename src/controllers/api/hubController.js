var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Hub = require("../../models/api/hubModel");
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


exports.getHubList = async function (req, res, next) {
  try {
    const hubs = await Hub.find();
    if (!hubs || hubs.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Hubs not found",
        respdata: {},
      });
    }
    res.status(200).json({ status: "1", hub_list: hubs });
  } catch (error) {
    // Handle errors
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};








  
var express = require("express");
var router = express.Router();
var moment = require("moment");
const mongoose = require("mongoose");
const db = mongoose.connection;
const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const Notifications = require("../../models/api/notificationModel");
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


exports.addData = async function (req, res, next) {
try {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "0",
      message: "Validation error!",
      respdata: errors.array(),
    });
  }

  // const existingNotifications = await Notifications.findOne({ name: req.body.title });
  // if (existingNotifications) {
  //   return res.status(409).json({
  //     status: "0",
  //     message: "Notifications already exists!",
  //     respdata: {},
  //   });
  // }
  // else{
         const newNotifications = new Notifications({
          title: req.body.title,
          content: req.body.content,
          user_id : req.body.user_id,
          added_dtime: dateTime,
          data: req.body.data
        });
    
        const savedNotifications = await newNotifications.save();
    
        res.status(201).json({
          status: "1",
          message: "Notifications added successfully!",
          respdata: savedNotifications,
        });
  // }
} catch (error) {
  res.status(500).json({
    status: "0",
    message: "Error!",
    respdata: error.message,
  });
}
};

exports.listofNotification = async function (req, res, next) {
  try {
    const { user_id } = req.body;

    const notifications = await Notifications.find({ user_id }).sort({ added_dtime: -1 });
    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "Notifications not found",
        respdata: {},
      });
    }
    res.status(200).json({ status: "1", notification_data: notifications });
  } catch (error) {
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};

exports.getNotificationById = async function (req, res, next) {
  try {
    const { notification_id } = req.body; 

    const notification = await Notifications.findById(notification_id);
    if (!notification) {
      return res.status(404).json({
        status: "0",
        message: "Notification not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", notification_data: notification });
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
exports.updateNotificationById = async function (req, res, next) {
  try {
    const { notification_id, title, content } = req.body; 

    const updateData = { title, content}; 

    const updatedNotification = await Notifications.findByIdAndUpdate(notification_id, updateData, { new: true });
    
    if (!updatedNotification) {
      return res.status(404).json({
        status: "0",
        message: "Notification not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", message: "Notification updated successfully", updated_notification: updatedNotification });
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


exports.deleteNotificationById = async function (req, res, next) {
  try {
    const { notification_id } = req.body; 

    const deletedNotification = await Notifications.findByIdAndDelete(notification_id);
    if (!deletedNotification) {
      return res.status(404).json({
        status: "0",
        message: "Notification not found",
        respdata: {},
      });
    }

    res.status(200).json({ status: "1", message: "Notification deleted successfully" });
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

exports.listofWebNotification = async function (req, res, next) {
  try {
    let isLoggedIn = (typeof req.session.user != "undefined") ? req.session.user.userId : "";
    const userId = (typeof req.session.user != "undefined") ? req.session.user.userId : "";

    const notifications = await Notifications.find({ userId }).sort({ added_dtime: -1 ,is_read: 0 ,status : 0});
    const notificationCount = await Notifications.countDocuments({ userId, is_read: 0 ,status : 0});
      res.render("webpages/notificationlist",
      {
        title: "Users Notificartion List",
        message: "Users Data of the Notifications!",
        respdata: notifications,
        notificationCount: notificationCount,
        websiteUrl: process.env.SITE_URL,
        isLoggedIn: isLoggedIn,
      });
  } catch (error) {
    //console.error(error);
    res.status(500).json({
      status: "0",
      message: "Internal server error",
      respdata: error,
    });
  }
};

exports.markNotificationAsRead = async function (req, res, next) {
  const notificationId = req.body.notificationId;
  try {
      const notification = await Notifications.findById(notificationId);
      if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
      }
      notification.is_read = 1;
      await notification.save();
      res.status(200).json({
        message: 'Notification marked as read',
        notification : true
      });
  } catch (error) {
    return {
      message: 'Notification not marked as read',
      notification : false
    };
  }
};



  
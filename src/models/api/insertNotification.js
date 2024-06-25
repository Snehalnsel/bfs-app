const Notifications = require("../../models/api/notificationModel");
const mongoose = require("mongoose");
const moment = require("moment");
// const dateTime = moment().format("YYYY-MM-DD h:mm:ss");

const insertNotification = async (title, content, userId, link, addedDtime) => {
    const dateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    try {
        let serObj = {
            title: title,
            content: content,
            user_id: userId,
            link: link,
            added_dtime: dateTime
        };
        const notification = new Notifications(serObj)
        await notification.save();

        return true;
    } catch (error) {
        return false;
    }
};

module.exports = insertNotification;

const Notifications = require("../../models/api/notificationModel");
const mongoose = require("mongoose");
const moment = require("moment");
const dateTime = moment().format("YYYY-MM-DD h:mm:ss");
const insertNotification = async (title, content, userId, link, addedDtime) => {
    try {
        const notification = new Notifications({
            title: title,
            content: content,
            user_id: userId,
            link: link,
            added_dtime: dateTime
        });

        await notification.save();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = insertNotification;

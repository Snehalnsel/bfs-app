const Notifications = require("../../models/api/notificationModel");
const mongoose = require("mongoose");

const insertNotification = async (title, content, userId, link, addedDtime) => {
    try {
        const notification = new Notifications({
            title: title,
            content: content,
            user_id: userId,
            link: link,
            added_dtime: addedDtime
        });

        await notification.save();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = insertNotification;

const axios = require("axios");
const fs = require('fs');
const sendWhatsapp = async (reqData) => {
    try {
        const smsURL = process.env.WP_SMS_API + "?username="+process.env.SMS_USER_NAME+"&password="+process.env.SMS_PASSWORD+"&to="+reqData.toMobile+"&from="+process.env.SMS_SENDER_ID+"&text="+reqData.text;
        return await axios.post(smsURL).then(async response => {
            return {
                status:true,
                //data:response,
                data:"Success"
            };
        }).catch(async (err) => {
            return {
                status:false,
                //data:response,
                data:"Can Not Send"
            };
        });
    } catch (error) {
        return {
            status:false,
            //data:response,
            data:"Error While API Call"
        };
    };
};
module.exports = sendWhatsapp;
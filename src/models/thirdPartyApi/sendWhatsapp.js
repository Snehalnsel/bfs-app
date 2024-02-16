const axios = require("axios");
const fs = require('fs');
const sendWhatsapp = async (reqData) => {
    try {
        const wpURL = process.env.WP_SMS_API;
        const config = {
            headers: {'Content-Type': 'text/xml'}
        };
        return await axios.post(wpURL,reqData,config).then(async response => {
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
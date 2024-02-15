const axios = require("axios");
const fs = require('fs');
const sendSms = async (reqData) => {
    try {
        let obj;
        fs.readFile('../../../api_send_message.json', 'utf8', async function (err, data) {
            if (err) {
                    return {
                    status:false,
                    data:err
                };
            }
            obj = JSON.parse(data);
            await axios.get(process.env.SMS_API, {
                params: {}
            }).then(async response => {
                return {
                    status:true,
                    data:response
                };
            }).catch(async (err) => {
                return {
                    status:false,
                    data:err
                };
            });
        });
    } catch (error) {
        return {
            status:false,
            data:error
        };
    };
};
module.exports = sendSms;
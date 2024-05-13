const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const path = require("path");

const request = require('request');
const email = 'sneha.lnsel@gmail.com';
const shipPassword = 'Jalan@2451';
const baseUrl='https://apiv2.shiprocket.in/v1/external';
/*function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
}*/

exports.checkImageExist = async (url) => {
  let retValue = "/public/";
  try {
    const res = await readFileAsync(path.resolve(__dirname,'../../public/compress_images/'+url));
    retValue = '/public/compress_images/'+url;
  } catch(e) {
    retValue = '/public/images/'+url;
  }
  return retValue;
};
exports.trackbyawbid = async(pickup_awb)=> {
  console.log("pickup_awb--",pickup_awb)
  token = await generateToken(email, shipPassword);
  if (!token) {
    return Promise.reject('Token not available. Call generateToken first.');
  }

  const options = {
    method: 'GET',
    url: `${baseUrl}/courier/track/awb/${pickup_awb}`, 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}

function generateToken(email, password) {
  const options = {
    method: 'POST',
    url: baseUrl+'/auth/login',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode === 200) {
        const responseBody = JSON.parse(body);
        const token = responseBody.token;
        resolve(token);
      } else {
        reject(new Error(`Error: ${response.statusCode}`));
      }
    });
  });
}
  
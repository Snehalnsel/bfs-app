const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const path = require("path");

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
  
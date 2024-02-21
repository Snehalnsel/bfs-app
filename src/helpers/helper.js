const fs = require('fs');

/*function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
}*/
exports.checkImageExist = async (url) => {
  let retValue = "";
  await fs.access("./public/compress_images/"+url, fs.constants.F_OK, (err) => {
   retValue = err ? '/public/images/'+url : '/public/compress_images/'+url;
  });
  return retValue;
};
  
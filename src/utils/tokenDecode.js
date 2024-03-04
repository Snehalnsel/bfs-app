const jwt = require("jsonwebtoken");
const tokenDecode = async (token,privateKey) => {

    return new Promise((resolve, reject) => {
        jwt.verify(token, privateKey, (err, tokenDetails) => {
            if (err)
                return reject({ error: true, message: "Invalid refresh token" });
            resolve({
                tokenDetails,
                error: false,
                message: "Valid refresh token",
            });
        });
    });
};

module.exports = tokenDecode;
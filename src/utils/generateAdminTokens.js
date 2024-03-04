const UserToken = require("../models/web/UserToken");
const jwt = require("jsonwebtoken");

const generateAdminTokens = async (user, cookieRefreshToken) => {
    try {
        const payload = user;
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
        );
        let refreshToken = "";
        if(cookieRefreshToken != "") {
            refreshToken =  cookieRefreshToken;
        } else {
            refreshToken = jwt.sign(
                payload,
                process.env.REFRESH_TOKEN_PRIVATE_KEY,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
            );
        }
        const userToken = await UserToken.findOne({ userId: user.userId,refresh_token:cookieRefreshToken });
        if (userToken) await userToken.remove();

        await new UserToken({ userId: user.userId, refresh_token: refreshToken,access_token:accessToken }).save();
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};
module.exports = generateAdminTokens;
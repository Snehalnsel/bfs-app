$(document).ready(async function() {
    let reCookieAccessToken = await getCookieFunc(accessTokenVar);
    let reCookieRefreshToken = await getCookieFunc(refreshTokenVar);
    if((reCookieRefreshToken != "") && ($("#userReloggedIn").val() == "")) {
        await userReLogin(reCookieAccessToken, reCookieRefreshToken);
    }
});
async function userReLogin(reCookieAccessToken, reCookieRefreshToken) {
    //Check Or Login
    $.ajax({
        type: 'POST',
        url:  webSiteUrl + "/user-relogin",
        data: {
            cookieRefreshToken:reCookieRefreshToken
        },
        success: async function(obj){
            let error_success = obj.status;
            if(error_success == 'success'){
                //Set Coockie in the local machine
                await setCookeiFunc(accessTokenVar,obj.accessToken,obj.accessTokenExpires);
                await setCookeiFunc(refreshTokenVar,obj.refreshToken,obj.refreshTokenExpires);
                location.reload();
            } else {
                //Write something for occuring the error
            }
        },
        error: function(response){
            location.reload()
        }
    });
}
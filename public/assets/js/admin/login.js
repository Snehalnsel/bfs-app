let webSiteUrl = "https://localhost:3000";
let accessTokenVar = "adminAccessToken";
let refreshTokenVar = "adminRefreshToken";
let adminCookieAccessToken = "";
let adminCookieRefreshToken = "";
$(document).ready(async function(){
    adminCookieAccessToken = await getCookieFunc(accessTokenVar);
    adminCookieRefreshToken = await getCookieFunc(refreshTokenVar);
    $('#loginForm').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            email:{
                required:true,
                maxlength: 70
            },
            password:{
                required:true,
                maxlength:15,
                minlength:8
            }
        },
        messages:{
            email:{
                required:"Please enter your email.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            password:{
                required:"Please enter password.",
                maxlength:"You can enter maximum of 15 characters.",
                minlength: "You can enter minimum of 8 characters.",
            }
        },
        submitHandler: function() {
            // let form_data = new FormData();
            // form_data.append("password", $('#pwd').val());
            // form_data.append("email", $('#email').val());
            $.ajax({
                type: 'POST',
                url:  webSiteUrl + "/ajax-userlogin",
                data: {
                    email: $('#email').val(),
                    password:$('#password').val(),
                    cookieAccessToken:adminCookieAccessToken,
                    cookieRefreshToken:adminCookieRefreshToken
                },
                success: async function(obj){
                    let error_success = obj.status;
                    if(error_success == 'success'){
                        $('#success-msg').html(obj.message);
                        $('#success-msg').show();
                        //Set Coockie in the local machine
                        await setCookeiFunc(accessTokenVar,obj.respdata.accessToken,obj.respdata.accessTokenExpires);
                        await setCookeiFunc(refreshTokenVar,obj.respdata.refreshToken,obj.respdata.refreshTokenExpires);
                        setTimeout(function(){
                            $('#success-msg').fadeOut();
                            $('#loginForm')[0].reset();
                        }, 500);
                        if((typeof obj.respdata.refreshReset != "undefined") && (obj.respdata.refreshReset)) {
                            location.reload();
                        }
                    } else {
                        $('#error-msg').html(obj.message);
                        $('#error-msg').show();
                        setTimeout(function(){ 
                            $('#error-msg').fadeOut();
                        }, 5000);
                    }
                },
                error: function(response){
                    let obj = response.responseJSON;
                    $('#error-msg').html(obj.message);
                    $('#error-msg').show();
                    setTimeout(function(){ 
                        $('#error-msg').fadeOut();
                    }, 5000);
                }
            });
        }
    });
});
const setCookeiFunc = async (name,value,days) => {
    let now = new Date();
    let expires="";
    now.setTime(now.getTime()+(parseInt(days)*24*60*60*1000));
    expires = "; expires="+now.toGMTString();
    document.cookie = name+"="+value+expires+"; path=/";
};
const getCookieFunc = async (name) => {
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
      let split = el.split('=');
      cookie[split[0].trim()] = split.slice(1).join("=");
    });
    return (typeof cookie[name] != "undefined") ? cookie[name] : "" ;
};
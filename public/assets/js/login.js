let webSiteUrl = "https://localhost:3000";
let accessTokenVar = "accessToken";
let refreshTokenVar = "refreshToken";
let cookieAccessToken = "";
let cookieRefreshToken = "";
$(document).ready(async function(){
    cookieAccessToken = await getCookieFunc(accessTokenVar);
    cookieRefreshToken = await getCookieFunc(refreshTokenVar);
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
                maxlength:10,
                minlength:8
            }
        },
        messages:{
            email:{
                required:"Please enter your email/phone.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            password:{
                required:"Please enter password.",
                maxlength:"You can enter maximum of 10 characters.",
                minlength: "You can enter minimum of 8 characters.",
            }
        },
        submitHandler: function() {
            // let form_data = new FormData();
            // form_data.append("password", $('#pwd').val());
            // form_data.append("email", $('#email').val());
            $.ajax({
                type: 'POST',
                url:  webSiteUrl + "/api/ajax-userlogin",
                data: {
                    email: $('#email').val(),
                    password:$('#pwd').val(),
                    cookieAccessToken:cookieAccessToken,
                    cookieRefreshToken:cookieRefreshToken
                },
                success: async function(obj){
                    // let obj = response.responseJSON;
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
                            let pathArray = window.location.pathname.split( '/' );
                            if(pathArray[2] != "registration") {
                                location.reload();
                            } else {
                                location.href= webSiteUrl + "/api/home";
                            }
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
$(document).ready(async function(){

    $('#registerForm').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            name:{
                required:true,
            },
            remail:{
                required:true,
                maxlength: 70,
                email: true  
            },
            password:{
                required:true,
                maxlength:10,
                minlength:8
            },
            confirmpassword: {
                required: true,
                equalTo: "#password"  
            },
            phoneno: {
                required: true,
                minlength:10
            }
        },
        messages:{
            name:{
                required:"Please enter your full name.",
            }, 
            remail:{
                required:"Please enter your email.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            password:{
                required:"Please enter password.",
                maxlength:"You can enter maximum of 10 characters.",
                minlength: "You can enter minimum of 8 characters.",
            },
            confirmPassword: {
                equalTo: "Passwords do not match"
            },
            phoneno: {
                required: "Contract number is required"
            }
        },
        submitHandler: function() {
         
            $.ajax({
                type: 'POST',
                url:  webSiteUrl + "/api/signin",
                data: {
                    name:$('#name').val(),
                    phone_no: $('#phoneno').val(),
                    email: $('#remail').val(),
                    password:$('#password').val(),
                    confirmpassword:$('#confirmpassword').val(),
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
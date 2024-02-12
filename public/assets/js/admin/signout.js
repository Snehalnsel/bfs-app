$(document).ready(async function(){
    $(document).on('click', '.signout',async function() {
        $.ajax({
            type: 'POST',
            url:  webSiteUrl + "/sign-out",
            success: async function(obj){                
                let error_success = obj.status;
                //return false;
                if(error_success == 'success'){
                    await setCookeiFunc(accessTokenVar,'',0);
                    await setCookeiFunc(refreshTokenVar,'',0);
                    location.href = webSiteUrl;
                } else {

                    
                }
            },
            error: function(response){
                // let obj = response;
                // $('#error-msg').html(obj.message);
                // $('#error-msg').show();
                // setTimeout(function(){ 
                //     $('#error-msg').fadeOut();
                // }, 5000);
            }
        });
    })
});
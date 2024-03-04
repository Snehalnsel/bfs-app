$(document).ready(function(){
    $('#chat-form').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            msg:{
                required:true,
                number:true,
                maxlength: 10
            }
        },
        messages:{
            msg:{
                required:"Please enter valid amount.",
                number: "Enter numeric digits only.",
                maxlength: "You can enter maximum of 10 digits."
            }
        },
    });
});
$(document).ready(async function() {
    $('#checkoutForm').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            address1:{
                required:true,
                maxlength: 70
            },
            address2:{
                required:true,
                maxlength: 70
            },
            landmark:{
                required:true,
                maxlength: 70
            },
            city_name:{
                required:true,
                maxlength: 50
            },
            state_name:{
                required:true,
                maxlength: 50
            },
            pin_code:{
                required:true,
                number:true,
                minlength:6,
                maxlength: 6
            },
        },
        messages:{
            address1:{
                required:"Please enter your address.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            address2:{
                required:"Please enter your address.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            landmark:{
                required:"Please enter landmark.",
                maxlength: "You can enter maximum of 70 charecters."
            },
            city_name:{
                required:"Please enter city.",
                maxlength: "You can enter maximum of 50 charecters."
            },
            state_name:{
                required:"Please enter city.",
                maxlength: "You can enter maximum of 50 charecters."
            },
            pin_code:{
                required:"Please enter pincode.",
                number:"Enter numeric values only.",
                minlength:"Please enter valid pincode.",
                maxlength:"Please enter valid pincode.",
            },
        },
    });
})
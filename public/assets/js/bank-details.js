$(document).ready(async function(){
    $('#editBankDetails').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            bankname:{
                required:true,
                maxlength:100
            },
            branchname:{
                required:true,
                maxlength:100
            },
            accountname:{
                required:true,
                maxlength:100
            },
            accountnumber:{
                required:true,
                maxlength:100
            },
            ifsccode:{
                required:true,
                maxlength:100
            },
            accounttype:{
                required:true,
            },
            upiid:{
                required:true,
                maxlength:100
            },
            upiscaner:{
                required:true,
            },
        },
        messages:{
            bankname:{
                required:"Please enter bank name.",
                maxlength:"Please enter valid name."
            },
            branchname:{
                required:"Please enter branch name.",
                maxlength:"Please enter valid name."
            },
            accountname:{
                required:"Please enter account holder name.",
                maxlength:"Please enter valid name."
            },
            accountnumber:{
                required:"Please enter bank account no.",
                maxlength:"Please enter valid account number."
            },
            ifsccode:{
                required:"Please enter bank ifsc.",
                maxlength:"Please enter valid input."
            },
            accounttype:{
                required:"Please select a option",
            },
            upiid:{
                required:"Please enter upi id.",
                maxlength:"Please enter valid upi id."
            },
            upiscaner:{
                required:"Please enter a upi ",
            },
        },
        submitHandler: function() {
            $.ajax({
                type: 'POST',
                url:  webSiteUrl + "/edit-bank-details",
                data: {
                    bankname:$('#name').val(),
                    phone_no: $('#phoneno').val(),
                    email: $('#remail').val(),
                    password:$('#password').val(),
                    confirmpassword:$('#confirmpassword').val(),
                },
                success: async function(obj){
                    // let obj = response.responseJSON;
                    let error_success = obj.status;
                    if(error_success == 'success'){
                        $('#success-bank-msg').html(obj.message);
                        $('#success-bank-msg').show();
                        setTimeout(function(){ 
                            $('#success-bank-msg').fadeOut();
                        }, 5000);
                    } else {
                        $('#error-bank-msg').html(obj.message);
                        $('#error-bank-msg').show();
                        setTimeout(function(){ 
                            $('#error-bank-msg').fadeOut();
                        }, 5000);
                    }
                },
                error: function(response){
                    let obj = response;
                    $('#error-bank-msg').html(obj.message);
                    $('#error-bank-msg').show();
                    setTimeout(function(){ 
                        $('#error-bank-msg').fadeOut();
                    }, 5000);
                }
            });
        }
    });
    
});
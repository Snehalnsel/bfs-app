$(document).ready(async function(){

    $("#changePasswordLink").click(function() {
        $("#changePasswordForm").toggle(); 
    });
    
    $('#resetpasswordfrom').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            oldpassword:{
                required:true,
                maxlength:10,
                minlength:8
            },
            newpassword:{
                required:true,
                maxlength:10,
                minlength:8
            },
            cnewpassword: {
                required: true,
                equalTo: "#newpassword"  
            }
        },
        messages:{
            oldpassword:{
                required:"Please enter password.",
                maxlength:"You can enter maximum of 10 characters.",
                minlength: "You can enter minimum of 8 characters.",
            },
            newpassword:{
                required:"Please enter password.",
                maxlength:"You can enter maximum of 10 characters.",
                minlength: "You can enter minimum of 8 characters.",
            },
            cnewpassword: {
                equalTo: "Passwords do not match"
            },
        },
        submitHandler: function() {
            $.ajax({
                url: '/api/resetpassword',
                method: 'POST',
                data:{
                    old_password :$('.oldpassword').val(),
                    new_password :$('.newpassword').val(),
                    repeat_password :$('.cnewpassword').val()
                },
                success: function (data) {
                    if (data.is_passwordchnage == 'true') {
                      Swal.fire({
                         html: data.message,
                         confirmButtonText: "OK",
                         customClass: { confirmButton: 'alert-box-button' },
                      }).then(function () {
                        $('#resetpasswordfrom')[0].reset();
                      });
                      
                    } else {
                         Swal.fire({
                            html: data.message,
                            confirmButtonText: "OK",
                            customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
                         }).then(function () {
                            $('#resetpasswordfrom')[0].reset();
                          });
                        
                    }
                },
                error: function (err) {
                    console.error('Error:', err);
                }
            });
        }
    });
    
});
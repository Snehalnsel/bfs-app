jQuery.validator.addMethod("customupiid", function (value, element, params) {
    var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+$/i;
    return re.test(value);
}, "Please enter a valid upiid address.");

$(document).ready(async function(){
    $('#editBankDetails').validate({
        debug:false,
        errorElement:"p",
        errorClass:"errorMsgClass",
        rules:{
            bankname:{
                //required:true,
                maxlength:150
            },
            branch:{
                required:{
                    depends:function(){
                      if ($('#bankname').val() != '' ){
                        return true;  
                      }else{
                        return false;
                      }
                    }
                },
            },
            accountname:{
                required:{
                    depends:function(){
                      if ($('#bankname').val() != '' ){
                        return true;  
                      }else{
                        return false;
                      }
                    }
                },
                maxlength:160
            },
            accountnumber:{
                required:{
                    depends:function(){
                      if ($('#bankname').val() != '' ){
                        return true;  
                      }else{
                        return false;
                      }
                    }
                },
                maxlength:100
            },
            ifsccode:{
                required:{
                    depends:function(){
                      if ($('#bankname').val() != '' ){
                        return true;  
                      }else{
                        return false;
                      }
                    }
                },
                maxlength:150
            },
            accounttype:{
                required:{
                    depends:function(){
                      if ($('#bankname').val() != '' ){
                        return true;  
                      }else{
                        return false;
                      }
                    }
                },
            },
            upiid:{
                required:function() {
                    return $('#bankname').val() == '' && $('#upiscaner').val() == '';
                },
                maxlength:100,
                customupiid: true,
            },
            upiscaner:{
                required:function() {
                    return $('#bankname').val() == '' && $('#upiid').val() != '';
                }
            },
        },
        messages:{
            bankname:{
                maxlength:"Please enter valid name."
            },
            branch:{
                required:"Please enter branch name.",
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
                maxlength:"Please enter valid upi id.",
                customupiid:"Please enter valid upidid"
            },
            upiscaner:{
                required:"Please enter a upi scanner",
            },
        },
        submitHandler: function() {
            let form_data = new FormData();
            let files = $('#upiscaner')[0].files;
			let error = '';
			for(let count = 0; count<files.length; count++) {
			    let name = files[count].name;
			    let extension = name.split('.').pop().toLowerCase();
			    if(jQuery.inArray(extension, ['jpg','jpeg','png','gif']) == -1) {
				    error += "Invalid " + count + " Image File"
			    } else {
				    form_data.append("image", files[count]);
			    }
			}
            form_data.append("bankname", $('#bankname').val());
            form_data.append("branchname", $('#branch').val());
            form_data.append("accountname", $('#accountname').val());
            form_data.append("accountnumber", $('#accountnumber').val());
            form_data.append("ifsccode", $('#ifsccode').val());
            form_data.append("accounttype", $('#accounttype').val());
            form_data.append("upiid", $('#upiid').val());
            $.ajax({
                type: 'POST',
                url:  "/edit-bank-details",
                data: form_data,
                processData: false,
                contentType: false,
                cache: false,
                success: async function(obj){
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
                },
            });
        }
    });
    
});
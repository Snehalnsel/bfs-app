let productId = "";
let isLoggedIn2 = $("#userReloggedIn").val();
$(document).on("click",".bidNowAmountBtn",function() {
    let bidAmount = $("#bid_amount").val();
    if(productId !== "" && bidAmount != "") {
        $.ajax({
        url: '/api/bid-check-exist-reccord', // Request to bid for first time or update the bid amount
        data: {productId:productId,bidAmount:bidAmount},
        method: 'POST',
        success: function(data) {
            window.location.href = "/api/bid-for-product/"+data.bidId;
            //console.log('Danger Alert');
        },
        error: function(err) {
                console.error('Error:', err);
        } 
    });
    }
});
$(document).on("click",".bidButton",function() {
    if(isLoggedIn2 != "") {
        productId = $(this).siblings('a').data("id");
        $('#bid_modal').modal('show'); 
        //window.location.href = "/api/bid-for-product";
    } else {
        //$('.loginModal').trigger('click');
        $('#login_modal').modal('show'); 
    }
});
$(document).on('click', ".buy-btn", function(e){
    if(isLoggedIn2 != "") {
       var id = $(this).data('id');
       //console.log(id);
       $.ajax({
            url: '/api/addtocart/'+id.trim(), 
            method: 'POST',
            success: function(data) 
            {
                if (data.is_added) {
                    Swal.fire({
                            html: data.message,  
                            confirmButtonText: "OK",
                            customClass: { confirmButton: 'alert-box-button' }
                            
                            });
                getHeaderData();
                } else {
                    Swal.fire({
                            html: "You can add one item at a time",  
                            confirmButtonText: "OK",
                            customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
                            });
                }
            },
            error: function(err) 
            {
                console.error('Error:', err);
            } 
        });
    } else {
       $('#login_modal').modal('show'); 
    }
});
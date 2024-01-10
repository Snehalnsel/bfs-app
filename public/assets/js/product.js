let productId = "";
let isLoggedIn = $("#isLoggedIn").val();
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
    if(isLoggedIn != "") {
        productId = $(this).siblings('a').data("id");
        $('#bid_modal').modal('show'); 
        //window.location.href = "/api/bid-for-product";
    } else {
        //$('.loginModal').trigger('click');
        $('#login_modal').modal('show'); 
    }
});
   
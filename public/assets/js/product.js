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

$(document).on('click', ".wish-btn", async function (e) {
    if(isLoggedIn2 != "") {
        let wishlistreCookieAccessToken = await getCookieFunc(accessTokenVar);
        let wishlistreCookieRefreshToken = await getCookieFunc(refreshTokenVar);
        await userReLogin(wishlistreCookieAccessToken, wishlistreCookieRefreshToken);

        var id = $(this).data('id');
        console.log(id);
        $.ajax({
            url: '/api/add-to-wishlist-web/' + id.trim(),
            method: 'POST',
            success: function (data) {
                if (data.is_wishlisted) {
                Swal.fire({
                    html: data.message,
                    confirmButtonText: "OK",
                    customClass: { confirmButton: 'alert-box-button' }
                });
                $(".wish-btn").addClass("wish-rem-btn").find("i").removeClass("fa fa-heart-o").addClass("fa fa-heart");
                setTimeout(() => {
                    $(".wish-rem-btn").removeClass("wish-btn");
                }, 200);
                } else {
                Swal.fire({
                    html: data.message,
                    confirmButtonText: "OK",
                    customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
                });
                }
            },
            error: function (err) {
                console.error('Error:', err);
            }
        });
    } else {
        $('#login_modal').modal('show'); 
    }
});


$(document).on('click', ".wish-rem-btn", async function (e) {
    if(isLoggedIn2 != "") {
        let wishlistreagCookieAccessToken = await getCookieFunc(accessTokenVar);
        let wishlistreagCookieRefreshToken = await getCookieFunc(refreshTokenVar);
        await userReLogin(wishlistreagCookieAccessToken, wishlistreagCookieRefreshToken);

        var id = $(this).data('id');
        console.log(id);
        $.ajax({
            url: '/api/remove-wishlist-web/' + id.trim(),
            method: 'GET',
            success: function (data) {
                if (data.success) {
                Swal.fire({
                    html: data.message,
                    confirmButtonText: "OK",
                    customClass: { confirmButton: 'alert-box-button' }
                });
                $(".wish-rem-btn").addClass("wish-btn").find("i").removeClass("fa fa-heart").addClass("fa fa-heart-o");
                setTimeout(() => {
                    $(".wish-btn").removeClass("wish-rem-btn");
                }, 200);

                } else {
                Swal.fire({
                    html: data.message,
                    confirmButtonText: "OK",
                    customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
                });
                }
            },
            error: function (err) {
                console.error('Error:', err);
            }
        });
    } else {
        $('#login_modal').modal('show'); 
    }
});

$(document).on('click', ".wish-rem-button", async function (e) {
    let src = "/public/assets/images/bfs-logo.png";
    Swal.fire({
        title: "Do you want to delete the item?",
        iconHtml: '<img src="'+ src +'">',
        customClass: {  
            icon: 'alert-logo-item',
            popup: "bid-alert-modal"
        },
        //customClass:"bid-alert-modal",
        showCancelButton: true,
        confirmButtonText: "Ok",
      }).then(async (result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            let wishlistCookieAccessToken = await getCookieFunc(accessTokenVar);
            let wishlistCookieRefreshToken = await getCookieFunc(refreshTokenVar);
            await userReLogin(wishlistCookieAccessToken, wishlistCookieRefreshToken);

            var divid = $(this).closest('.bids-row').attr('id');
            console.log(divid);

            var id = $(this).data('id');
            $.ajax({
            url: '/api/remove-wishlist-web/' + id.trim(),
            method: 'GET',
            success: function (data) {
                if (data.success) {
                    Swal.fire({
                        html: data.message,
                        confirmButtonText: "OK",
                        customClass: { confirmButton: 'alert-box-button' }
                    });
                    $("#" + divid).remove();
                    updateWishlistCount(data);
                    //Edited By Palash 17-01-2024
                    //location.reload();
                } else {
                    Swal.fire({
                        html: data.message,
                        confirmButtonText: "OK",
                        customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
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

function updateWishlistCount(data) {
    var itemCount = data.count;
    //console.log(itemCount);
    $(".wishlist-count").text(`(${itemCount})`);
}

$(document).on('click', ".share-product-icon", async function (e) {
    $(".share-linksbox").addClass("icon-show");
});
$(document).on('click', ".slc-btn", async function (e) {
    $(".share-linksbox").removeClass("icon-show");
});

$(document).on('click', ".close-icon", async function (e) {
    $(".share-linksbox").removeClass("icon-show");
});
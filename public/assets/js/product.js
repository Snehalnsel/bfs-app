let productId = "";
let isLoggedIn2 = $("#userReloggedIn").val();

$(document).on("click",".bidNowAmountBtn",function() {
    $(".valid-amount").html("");
    let bidAmount = $("#bid_amount").val();
    if(productId !== "" && bidAmount != "") {
        $.ajax({
            url: '/api/bid-check-exist-reccord', // Request to bid for first time or update the bid amount
            data: {productId:productId,bidAmount:bidAmount},
            method: 'POST',
            success: function(data) {
                if(typeof data.message != "undefined") {
                    $(".valid-amount").html(data.message);
                }
                if(data.status == "success") {
                    window.location.href = "/api/bid-for-product/"+data.bidId;
                } else {
                    setTimeout(function(){ 
                        $(".valid-amount").html("");
                    }, 3000);
                }
                //console.log('Danger Alert');
            },
            error: function(err) {
                setTimeout(function(){ 
                    $(".valid-amount").html("");
                }, 5000);
            } 
        });
    }
});

$(document).on("click",".bidButton",function() {
    if(isLoggedIn2 != "") {
        productId = $(this).siblings('a').data("id");
        $('#bid_modal').modal('show'); 
    } else {
        $('#login_modal').modal('show'); 
    }
});

$(document).on('click', ".buy-btn", function(e){
    if(isLoggedIn2 != "") {
       var id = $(this).data('id');
       $.ajax({
            url: '/api/addtocart/'+id.trim(), 
            method: 'POST',
            success: function(data) 
            {
                if (data.is_added) {
                    Swal.fire({
                        title: data.message,
                        iconHtml: '<img src="'+ src +'">',
                        customClass: {  
                            icon: 'alert-logo-item',
                            popup: "bid-alert-modal"
                        },
                        confirmButtonText: "OK",
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
                    title: data.message,
                    iconHtml: '<img src="'+ src +'">',
                    customClass: {  
                        icon: 'alert-logo-item',
                        popup: "bid-alert-modal"
                    },
                    confirmButtonText: "OK",
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
                        title: data.message,
                        iconHtml: '<img src="'+ src +'">',
                        customClass: {  
                            icon: 'alert-logo-item',
                            popup: "bid-alert-modal"
                        },
                        confirmButtonText: "OK",
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
    Swal.fire({
        title: "Do you want to remove this product from your wishlist?",
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
                        title: data.message,
                        iconHtml: '<img src="'+ src +'">',
                        customClass: {  
                            icon: 'alert-logo-item',
                            popup: "bid-alert-modal"
                        },
                        confirmButtonText: "OK",
                      });
                    $("#" + divid).remove();
                    if(data.count == 0)
                    {
                        // window.reload();
                        location.reload();
                    }
                    updateWishlistCount(data);
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
    $(".wishlist-count").text(`(${itemCount})`);
}

$(document).on('click', "#share-product-icon", async function (e) {
    $(".share-linksbox").addClass("icon-show");
});
$(document).on('click', ".slc-btn", async function (e) {
    $(".share-linksbox").removeClass("icon-show");
});

$(document).on('click', ".close-icon", async function (e) {
    $(".share-linksbox").removeClass("icon-show");
});

$(document).on('click', "#share-product-icon-wish", async function (e) {
    var index = $(this).data('index');
    $(this).closest(".cart-list").find(".share-linksbox").addClass("icon-show");
    console.log("Clicked on share icon for item with index: " + index);
});

$(document).on('click', ".slc-btn-wish", async function (e) {
    $(this).closest(".cart-list").find(".share-linksbox").removeClass("icon-show");
});

$(document).on('click', ".close-icon", async function (e) {
    $(this).closest(".cart-list").find(".share-linksbox").removeClass("icon-show");
});


const rangeInput = document.querySelectorAll(".range-input input"),
priceInput = document.querySelectorAll(".price-input input"),
range = document.querySelector(".slider .progress");
let priceGap = 1000;

priceInput.forEach((input) => {
    input.addEventListener("input", (e) => {
    let minPrice = parseInt(priceInput[0].value),
        maxPrice = parseInt(priceInput[1].value);

    if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
        if (e.target.className === "input-min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
        } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
        }
    }
    });
});

rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
        if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
        } else {
        rangeInput[1].value = minVal + priceGap;
        }
    } else {
        priceInput[0].value = minVal;
        priceInput[1].value = maxVal;
        range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
        range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
    }
    });
});
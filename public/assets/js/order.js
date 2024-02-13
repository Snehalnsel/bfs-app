let productId3 = "";
let isLoggedIn3 = $("#userReloggedIn").val();

$(document).on('click', ".remove-order", async function (e) {
    let src = "/public/assets/images/bfs-logo.png";
    Swal.fire({
        title: "Do you want to delete the order?",
        iconHtml: '<img src="'+ src +'">',
        customClass: {  
            icon: 'alert-logo-item',
            popup: "bid-alert-modal"
        },
        showCancelButton: true,
        confirmButtonText: "Ok",
      }).then(async (result) => {
        if (result.isConfirmed) {
            let deletecartCookieAccessToken = await getCookieFunc(accessTokenVar);
            let deletecartCookieRefreshToken = await getCookieFunc(refreshTokenVar);
            await userReLogin(deletecartCookieAccessToken, deletecartCookieRefreshToken);
            var orderid = $(this).closest('.cart-list').data('orderid');
            let deleteby = $(this).closest('.cart-list').data('userby');
            $.ajax({
            url: '/api/cancel-order',
            method: 'POST',
            data: {
                orderid:orderid,
                deleteby:deleteby
            },
            success: function (data) {
                if (data.is_cancelorder == true) {
                    Swal.fire({
                        title: data.message,
                        iconHtml: '<img src="'+ src +'">',
                        customClass: {  
                            icon: 'alert-logo-item',
                            popup: "bid-alert-modal"
                        },
                        confirmButtonText: "OK",
                      });
                    // $(e.target).closest('.remove-cart').hide();
                    $(e.target).closest('.remove-cart').hide().after('<p>Order canceled</p>');
                   
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
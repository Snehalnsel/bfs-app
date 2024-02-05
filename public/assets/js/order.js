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
        //customClass:"bid-alert-modal",
        showCancelButton: true,
        confirmButtonText: "Ok",
      }).then(async (result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            let deletecartCookieAccessToken = await getCookieFunc(accessTokenVar);
            let deletecartCookieRefreshToken = await getCookieFunc(refreshTokenVar);
            await userReLogin(deletecartCookieAccessToken, deletecartCookieRefreshToken);

            var orderid = $(this).closest('.cart-list').data('orderid');
            console.log(orderid);

            var id = $(this).data('id');
            // $.ajax({
            // url: '/api/cancel-order/' + orderid.trim(),
            // method: 'GET',
            // success: function (data) {
            //     if (data.is_cancelorder) {
            //         Swal.fire({
            //             html: data.message,
            //             confirmButtonText: "OK",
            //             customClass: { confirmButton: 'alert-box-button' }
            //         });
            //         $("#" + divid).remove();
            //         updateWishlistCount(data);
            //         //Edited By Palash 17-01-2024
            //         //location.reload();
            //     } else {
            //         Swal.fire({
            //             html: data.message,
            //             confirmButtonText: "OK",
            //             customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
            //         });
            //     }
            // },
            // error: function (err) {
            //     console.error('Error:', err);
            // }
            // });
        }
    });
});
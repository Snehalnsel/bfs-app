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
            url: '/cancel-order',
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


$(document).on('click', ".return-order", async function (e) {
    const orderId = $(this).data('id');
    let src = "/public/assets/images/bfs-logo.png";
    $.ajax({
        url: '/reason-list',
        method: 'GET',
        success: function (data) {
            let reasonsHtml = '';
            data.forEach(reason => {
                reasonsHtml += `
                    <div class="rd-select">
                        <input type="radio" id="reason_${reason._id}" name="reason" value="${reason._id}">
                        <label for="reason_${reason._id}">${reason.reason}</label>
                    </div>
                `;
            });
            const swalHtml = `
                <img src="${src}">
                <div class="modal-select">${reasonsHtml}</div>
            `;
            Swal.fire({
                title: "Do you want to return the order?",
                html: swalHtml,
                customClass: {  
                    icon: 'alert-logo-item',
                    popup: "bid-alert-modal",
                    content: 'swal2-content-size' 
                },
                showCancelButton: true,
                confirmButtonText: "Return",
                cancelButtonText: "Cancel",
                preConfirm: () => {
                    const reasonId = document.querySelector('input[name="reason"]:checked').value;
                    return { orderId: orderId, reasonId: reasonId };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { orderId, reasonId } = result.value;
                    console.log("Order ID:", orderId);
                    console.log("Selected Reason ID:", reasonId);
                    // Send orderId and reasonId to the server
                    // $.ajax({
                    //     url: '/cancel-order',
                    //     method: 'POST',
                    //     data: {
                    //         orderid: orderId,
                    //         reasonid: reasonId
                    //     },
                    //     success: function (data) {
                    //         if (data.is_cancelorder == true) {
                    //             Swal.fire({
                    //                 title: data.message,
                    //                 iconHtml: '<img src="'+ src +'">',
                    //                 customClass: {  
                    //                     icon: 'alert-logo-item',
                    //                     popup: "bid-alert-modal"
                    //                 },
                    //                 confirmButtonText: "OK",
                    //             });
                    //             $(e.target).closest('.remove-cart').hide().after('<p>Order canceled</p>');
                    //         } else {
                    //             Swal.fire({
                    //                 html: data.message,
                    //                 confirmButtonText: "OK",
                    //                 customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
                    //             });
                    //         }
                    //     },
                    //     error: function (err) {
                    //         console.error('Error:', err);
                    //     }
                    // });
                }
            });
        },
        error: function (err) {
            console.error('Error:', err);
        }
    });
});





// $(document).on('click', ".return-order", async function (e) {
//     const orderId = $(this).data('id');
//     let src = "/public/assets/images/bfs-logo.png";
//     Swal.fire({
//         title: "Do you want to return the order?",
//         html: '<input id="comment" class="swal2-input" placeholder="Enter your comment here...">' + '<img src="'+ src +'">',
//         customClass: {  
//             icon: 'alert-logo-item',
//             popup: "bid-alert-modal",
//             content: 'swal2-content-size' 
//         },
//         showCancelButton: true,
//         confirmButtonText: "Return",
//         cancelButtonText: "Cancel",
//         preConfirm: () => {
//             const comment = document.getElementById('comment').value;
//             if (!comment) {
//                 Swal.showValidationMessage('Comment is required');
//             }
//             return { comment: comment };
//         }
//     }).then(async (result) => {
//         if (result.isConfirmed) {
//             let deletecartCookieAccessToken = await getCookieFunc(accessTokenVar);
//             let deletecartCookieRefreshToken = await getCookieFunc(refreshTokenVar);
//             await userReLogin(deletecartCookieAccessToken, deletecartCookieRefreshToken);
//             var orderid = orderId;
//             let comment = result.value.comment; 

//             console.log(orderid);
//             console.log(comment);
//             // $.ajax({
//             //     url: '/cancel-order',
//             //     method: 'POST',
//             //     data: {
//             //         orderid: orderid,
//             //         deleteby: deleteby,
//             //         comment: comment // Pass the comment to the server
//             //     },
//             //     success: function (data) {
//             //         if (data.is_cancelorder == true) {
//             //             Swal.fire({
//             //                 title: data.message,
//             //                 iconHtml: '<img src="'+ src +'">',
//             //                 customClass: {  
//             //                     icon: 'alert-logo-item',
//             //                     popup: "bid-alert-modal"
//             //                 },
//             //                 confirmButtonText: "OK",
//             //             });
//             //             $(e.target).closest('.remove-cart').hide().after('<p>Order canceled</p>');
//             //         } else {
//             //             Swal.fire({
//             //                 html: data.message,
//             //                 confirmButtonText: "OK",
//             //                 customClass: { confirmButton: 'alert-box-button', popup: 'swal2-popup' }
//             //             });
//             //         }
//             //     },
//             //     error: function (err) {
//             //         console.error('Error:', err);
//             //     }
//             // });
//         }
//     });
// });




$(document).ready(async function () {
    $(document).on("click", ".filterByChecked", async function () {
        const max = $('.input-max').val();
        const min = $('.input-min').val();
        let priceList = min + '-' + max;
        if ($('.filterByChecked').is(':checked')) {
            searchByFilter(priceList);
        } else {
            location.reload(priceList);
        }
    });

    $(document).on("mouseup",".price_range_filter", async function () {
        const max = $('.input-max').val();
        const min = $('.input-min').val();
        let priceList = min + '-' + max;

        searchByFilter(priceList)
    });

    $(document).on("onch",".price_range_input", async function () {
        const max = $('.input-max').val();
        const min = $('.input-min').val();
        let priceList = min + '-' + max;

        searchByFilter(priceList)
    });


});
async function searchByFilter(priceList = '',pageId = '') {
    let brandList = [];
    let sizeList = [];
    let conditionList = [];
    let optionId = $("#sortBy").val();
    let productcategoryId = $("#product_category_id").val();
    let pageNo = (pageId != "") ? pageId : 1;

    //get all selected brand name
    $(".searchByBrand:checked").each(function () {
        brandList.push($(this).data("id"));
    });
    //get all selected size
    $(".searchBySize:checked").each(function () {
        sizeList.push($(this).data("id"));
    });
    //get all condition
    $(".searchByCondition:checked").each(function () {
        conditionList.push($(this).data("id"));
    });
    //get all price
    // $(".searchByPrice:checked").each(function() {
    //     priceList.push($(this).data("id"));
    // });


    $.ajax({
        type: 'POST',
        url: webSiteUrl + "/api/user-filter",
        data: {
            brandList: brandList,
            sizeList: sizeList,
            conditionList: conditionList,
            priceList: priceList ? priceList : null,
            optionId: optionId,
            productcategoryId: productcategoryId,
            pageNo: pageNo
        },
        success: async function (obj) {
            let error_success = obj.status;
            if (error_success == 'success') {
                let htmlContent = '';
                if (obj && obj.respdata && obj.respdata.length > 0) {
                    // console.log(obj.respdata.length);
                    let totalPages = obj.totalPages;
                    let currentPage = obj.currentPage;
                    let categoryId = productcategoryId;
                    let webUrl = obj.webUrl;
                    htmlContent = await makeHtml(obj, totalPages, currentPage, categoryId, webUrl, brandList, sizeList, conditionList, priceList,optionId);
                    // console.log(htmlContent)
                } else {
                    htmlContent = '<p>No products found yet.</p>';
                }
                $('.sortdata').html(htmlContent);
                $('.show-count').html(`Showing ${(obj.respdata.length > 0 ? obj.respdata.length : 0)} products`);
            } else {
                $('.sortdata').html(`No Products Found!!`);
                $('.show-count').html(`Showing 0 product`);
                //Write something for occuring the error
            }
        },
        error: function (response) {
            $('.sortdata').html(`No Products Found!!`);
            $('.show-count').html(`Showing 0 product`);
        }
    });
}
$(document).on('change', ".sortBy", function (e) {

    if ($('.filterByChecked').is(':checked') || ($('.input-max').val() && $('.input-min').val())) {
        searchByFilter();
    } else {
        let categoryId = $("#product_category_id").val();
        if (categoryId === "whatshot") {
            categoryId = "whatshot";
        } else if (categoryId === "justsold") {
            categoryId = "justsold";
        } else if (categoryId === "bestDeal") {
            categoryId = "bestDeal";
        } else {
            categoryId = categoryId;
        }

        let checkOption = $("#sortBy").val();
        let optionId = "";
        if (checkOption != "Choose") {
            optionId = checkOption;
        } else {
            optionId = 0;
        }
        $.ajax({
            url: `/api/websubcategoriesproductswithsort/${categoryId}/${optionId.trim()}`,
            method: 'GET',
            success: async function (data) {
                // console.log(data);

                //data, totalPages, currentPage, product_category_id
                let htmlContent = '';
                if (data && data.respdata && data.respdata.length > 0) {
                    htmlContent = await makeHtml(data);
                } else {
                    htmlContent = '<p>No products found yet.</p>';
                }

                $('.sortdata').html(htmlContent);
            },
            error: function (err) {
                console.error('Error:', err);
            }
        });
    }
});

async function clearAllAndReload() {
    location.reload();
}

$(document).on('click', ".ajax_pagination", function (e) {
    let pageId = $(this).data("id");
    const max = $('.input-max').val();
    const min = $('.input-min').val();
    let priceList = min + '-' + max;
    searchByFilter(priceList,pageId)
});

async function makeHtml(data,totalPages, currentPage, categoryId, webUrl, brandList, sizeList, conditionList, priceList,optionId) {
    let htmlContent = ``;
    data.respdata.forEach(function (item) {
        htmlContent += `
            <div class="product-box">
                <div class="product-image">
                    <a href="/api/productdeatils/${item._id}">
                        <img src="${item.product_images[0].image}" alt="images" class="img-fluid">
                    </a>
                </div>
                <div class="prd-short-info">
                    <div class="prd-name">
                        <a href="/api/productdeatils/${item._id}">${item.name}</a>
                    </div>
                    <div class="prd-price">
                        <span><i class="fa fa-inr" aria-hidden="true"></i></span>${item.offer_price}
                    </div>
                    <div class="rtl-price">
                        <span>Est. Retail:</span>${item.price}
                    </div>
                    <div class="prd-batch">${item.status_name}</div>                 
                </div> 
            </div>`;
    });

    // Add pagination links
    // htmlContent += `<div class="pagination">`;
    // for (let i = 1; i <= totalPages; i++) {
    //     htmlContent += `<a href="/api/${webUrl}/${product_category_id}?page=${i}" class="${(i === currentPage) ? 'active' : ''}">${i}</a>`;
    // }
    // htmlContent += `</div>`;

    htmlContent += `<div class="pagination custome-pagination">`;
    for (let i = 1; i <= totalPages; i++) {
        htmlContent += `<a class="ajax_pagination" data-id="${i}" href="javascript:void(0)">${i}</a>`;
    }
    htmlContent += `</div>`;


    return htmlContent;
}

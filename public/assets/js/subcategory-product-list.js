$(document).ready(async function () {
    $(document).on("click", ".filterByChecked", async function () {
        const max = $('.input-max').val();
        const min = $('.input-min').val();
        let priceList = min + '-' + max;
        if ($('.filterByChecked').is(':checked')) {
            searchByFilter(priceList);
        } else {
            //location.reload(priceList);
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
    let genderList = [];
    let optionId = $("#sortBy").val();
    let productcategoryId = $("#product_category_id").val();
    let pageNo = (pageId != "") ? pageId : 1;

    $(".searchByBrand:checked").each(function () {
        brandList.push($(this).data("id"));
    });
   
    $(".searchBySize:checked").each(function () {
        sizeList.push($(this).data("id"));
    });
 
    $(".searchByCondition:checked").each(function () {
        conditionList.push($(this).data("id"));
    });

    $(".searchByGender:checked").each(function () {
        genderList.push($(this).data("id"));
    });
   
   
    $.ajax({
        type: 'POST',
        url: webSiteUrl + "/user-filter",
        data: {
            brandList: brandList,
            sizeList: sizeList,
            conditionList: conditionList,
            genderList: genderList,
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
                    let websiteUrl = obj.websiteUrl;
                    htmlContent = await makeHtml(obj, totalPages, currentPage, categoryId, websiteUrl, brandList, sizeList, conditionList, priceList,optionId);
                    // console.log(htmlContent)
                } else {
                    htmlContent = '<p>No products found yet.</p>';
                }
                $('.sortdata').html(htmlContent);
                $('.show-count').html(`Showing ${(obj.respdata.length > 0 ? obj.respdata.length : 0)} products of  ${(obj.totalProduct > 0 ? obj.totalProduct : 0)}`);
            } else {
                $('.sortdata').html(`No Products Found!!`);
                $('.show-count').html(`Showing 0 product`);
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
        const max = $('.input-max').val();
        const min = $('.input-min').val();
        let priceList = min + '-' + max;
        searchByFilter(priceList);
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
            url: `/websubcategoriesproductswithsort/${categoryId}/${optionId.trim()}`,
            method: 'GET',
            success: async function (data) {
                let htmlContent = '';
                if (data && data.respdata && data.respdata.length > 0) {
                    let websiteUrl = data.websiteUrl;
                    htmlContent = await makeHtml(data,websiteUrl);
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
async function makeHtml(data,totalPages, currentPage, categoryId, websiteUrl, brandList, sizeList, conditionList, priceList,optionId) {
    let htmlContent = ``;
    data.respdata.forEach(function (item) {
        htmlContent += `
            <div class="product-box">
                <div class="product-image">
                    <a href="/productdeatils/${item._id}">
                    <img src="${item.product_images && item.product_images.length > 0 && item.product_images[0].image ? 
                        `${websiteUrl}/public/compress_images/${item.product_images[0].image}` : 
                        `${websiteUrl}/public/images/no-product.webp`}" 
               alt="images" class="img-fluid">
          
                    </a>
                </div>
                <div class="prd-short-info">
                    <div class="prd-name">
                        <a href="/productdeatils/${item._id}">${item.name}</a>
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

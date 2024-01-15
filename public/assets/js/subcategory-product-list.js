$(document).ready(async function() {
    $(document).on("click",".filterByChecked",async function() {
        if( $('.filterByChecked').is(':checked') ){
            searchByFilter();
        } else {
            location.reload();
        }
    });
});
async function searchByFilter() {
    let brandList = [];
    let sizeList = [];
    let conditionList = [];
    let priceList = [];
    let optionId = $("#sortBy").val();
    //get all selected brand name
    $(".searchByBrand:checked").each(function() {
        brandList.push($(this).data("id"));
    });
    //get all selected size
    $(".searchBySize:checked").each(function() {
        sizeList.push($(this).data("id"));
    });
    //get all condition
    $(".searchByCondition:checked").each(function() {
        conditionList.push($(this).data("id"));
    });
    //get all price
    $(".searchByPrice:checked").each(function() {
        priceList.push($(this).data("id"));
    });
    $.ajax({
        type: 'POST',
        url:  webSiteUrl + "/api/user-filter",
        data: {
            brandList:brandList,
            sizeList:sizeList,
            conditionList:conditionList,
            priceList:priceList,
            optionId:optionId
        },
        success: async function(obj){
            let error_success = obj.status;
            if(error_success == 'success'){
                let htmlContent = '';
                if (obj && obj.respdata && obj.respdata.length > 0) {
                    console.log(obj.respdata.length);
                    htmlContent = await makeHtml(obj);
                } else {
                    htmlContent = '<p>No products found yet.</p>';
                }
                $('.sortdata').html(htmlContent);
                $('.show-count').html(`Showing ${(obj.respdata.length > 0 ? obj.respdata.length : 0)} products`);
            } else {
                $('.sortdata').html(`No Products Found!!`);
                //Write something for occuring the error
            }
        },
        error: function(response){
            $('.sortdata').html(`No Products Found!!`);
            //Error while filter
        }
    });
}
$(document).on('change', ".sortBy", function(e){
    if( $('.filterByChecked').is(':checked') ){
        searchByFilter();
    } else {
        let categoryId =$("#product_category_id").val();

        if (categoryId === "whatshot") {
            
            categoryId = "whatshot";
        } else if (categoryId === "justsold") {
          
            categoryId = "justsold";
        } else if (categoryId === "bestDeal") {
           
            categoryId = "bestDeal";
        }
        else
        {
            categoryId = categoryId;
        }

        let checkOption = $("#sortBy").val();
        let optionId = "";
        if(checkOption != "Choose") {
            optionId = checkOption;
        } else {
            optionId = 0;
        }
        $.ajax({
            url: `/api/websubcategoriesproductswithsort/${categoryId}/${optionId.trim()}`,
            method: 'GET',
            success: async function(data) {
                console.log(data);

                let htmlContent = '';
                if (data && data.respdata && data.respdata.length > 0) {
                    htmlContent = await makeHtml(data);
                } else {
                    htmlContent = '<p>No products found yet.</p>';
                }

                $('.sortdata').html(htmlContent);
            },
            error: function(err) {
                console.error('Error:', err);
            } 
        });
    }
});

async function clearAllAndReload() {
    location.reload();
  }
async function makeHtml(data) {
    let htmlContent = ``;
    data.respdata.forEach(function(item) {
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
    return htmlContent;
}
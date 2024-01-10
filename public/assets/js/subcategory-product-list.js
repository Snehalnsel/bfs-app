$(document).ready(async function() {
    $(document).on("click",".filterByChecked",async function() {
        let brandList = [];
        let sizeList = [];
        let conditionList = [];
        let priceList = [];
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
                brandList:brandList.length ? brandList : [],
                sizeList:sizeList.length ? sizeList : [],
                conditionList:conditionList.length ? conditionList : [],
                priceList:priceList.length ? priceList : []
            },
            success: async function(obj){
                let error_success = obj.status;
                if(error_success == 'success'){
                    
                } else {
                    //Write something for occuring the error
                }
            },
            error: function(response){
                //Error while filter
            }
        });
    });
});

$(document).on('change', ".sortBy", function(e){
    let categoryId ="<%= product_category_id %>";
    let optionId = $(this).val();

    $.ajax({
        url: `/api/websubcategoriesproductswithsort/${categoryId}/${optionId.trim()}`,
        method: 'GET',
        success: function(data) {
            console.log(data);

            // Update the content of the 'sortdata' div with the received data
            let htmlContent = '';
            if (data && data.respdata && data.respdata.length > 0) {
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
                            </div> 
                        </div>`;
                });
            } else {
                htmlContent = '<p>No products found yet.</p>';
            }

            $('.sortdata').html(htmlContent);
        },
        error: function(err) {
            console.error('Error:', err);
        } 
    });
});
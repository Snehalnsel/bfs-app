$(document).ready(async function() {
    $(document).on("click",".filterByChecked",async function() {
        let thisId = $(this).data("id");
        let brandList = [];
        let sizeList = [];
        let conditionList = [];
        let priceList = [];
        if($(this).hasClass("searchByBrand")) {

        }
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
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
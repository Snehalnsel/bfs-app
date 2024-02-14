$(document).ready(function(){
    $(document).on("keyup",".search_by",function() {
        let searchBy = $(".search_by").val();
        if(searchBy != "") {
            $.ajax({
                url: '/search-by-keyword',
                data: {searchBy:searchBy},
                method: 'POST',
                success: function(data) {
                    let allData = data.respdata.allData;
                    if(allData.length > 0) {
                        let html = ``;
                        for(let i = 0;i<allData.length;i++) {
                            html += `<li><a href="`+data.siteUrl+allData[i].link+`">`+allData[i].name+`</a></li>`;
                        }
                        $(".allSearchResult").html(html);
                    }
                },
                error: function(err) {
                    console.error('Error:', err);
                } 
            });
        } else {
            $(".allSearchResult").html(``);
        }
    });

});
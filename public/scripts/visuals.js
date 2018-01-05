

$(document).ready(function(){
    
    console.log("DOCUMENT READY");
    $(document).on('click', '.eventkey', function (e) {
        console.log("Changing event key appearance");
        $(this).toggleClass("highlight");
    });

    var divWidth = $('.day').outerHeight(); 
    $('.day').outerWidth(divWidth);
    $('.dayW').outerWidth(divWidth);

    $(document).click(function(){
        var divWidth = $('.day').outerHeight(); 
        $('.day').outerWidth(divWidth);
        $('.dayW').outerWidth(divWidth);        
    });
    

});
$(window).resize(function(){
    var divWidth = $('.day').outerHeight(); 
    $('.day').outerWidth(divWidth);
    $('.dayW').outerWidth(divWidth);
});




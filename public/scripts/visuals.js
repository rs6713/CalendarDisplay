$(document).ready(function(){
    $('.eventKey').click( function(){
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




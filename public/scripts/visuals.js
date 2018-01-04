
$(document).ready(function(){


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
    
    $(".date h1").hover(function(){
        
            var scope= angular.element(document.getElementById('main')).scope();
            console.log(scope.appCalendar.currentTime);
        
    });
});
$(window).resize(function(){
    var divWidth = $('.day').outerHeight(); 
    $('.day').outerWidth(divWidth);
    $('.dayW').outerWidth(divWidth);
});




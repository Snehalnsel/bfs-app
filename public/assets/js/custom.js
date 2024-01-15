// Stick the header at top on scroll
  $(window).scroll(function(){
    if ($(window).scrollTop() >= 90) {
        $('#header').addClass('fixed-header');
        $('body').addClass('sticky-header');
    }
    else {
        $('#header').removeClass('fixed-header');
        $('body').removeClass('sticky-header');
    }
});


$(document).ready(function(){

  $("#menuToggleBtn").click(function(){
    $("body").toggleClass("side-menu-open");
  });

});

// menu

document.addEventListener('click',function(e){
  // Hamburger menu
  if(e.target.classList.contains('hamburger-toggle')){
    e.target.children[0].classList.toggle('active');
  }
})  



// slider

$(document).ready(function(){


  // Banner Slider
  $('.banner-slider').slick({
    dots: false,
    infinite: true,
    lazyLoad: 'ondemand',
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'linear'
  });

  

//categories Slider

$('.ctg_Slider').slick({
  dots: false,
  infinite: true,
  lazyLoad: 'ondemand',
  speed: 300,
  loop:true,
  slidesToShow: 10,
  slidesToScroll: 1,
  autoplay: false,
  autoplaySpeed: 2000,
  cssEase: 'linear',
  responsive: [
  {
      breakpoint:991,
      settings: {
        slidesToShow: 6,        
      }
    },     
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 2,
      }
    },
    
  ]
});


//Product Slider

$('.product_Slider123').slick({
  dots: false,
  infinite:true,  
  speed: 300,
  centerMode:true,  
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500, 
  responsive: [ 
  {
      breakpoint:991,
      settings: {
        slidesToShow: 3,        
      }
    },   
    {
      breakpoint:767,
      settings: {
        slidesToShow: 2,        
      }
    }
  ]
});


$('.product_Slider2').slick({
  dots: false,
  infinite:true,  
  speed: 300,
  centerMode:true,  
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000, 
  responsive: [ 
  {
      breakpoint:991,
      settings: {
        slidesToShow: 3,        
      }
    },   
    {
      breakpoint:767,
      settings: {
        slidesToShow: 2,        
      }
    }
  ]
});

$('.slider-basic').slick({
  dots: false,
  infinite:true,  
  speed: 300,
  centerMode:true,  
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000, 
  responsive: [ 
  {
      breakpoint:991,
      settings: {
        slidesToShow: 3,        
      }
    },   
    {
      breakpoint:767,
      settings: {
        slidesToShow: 2,        
      }
    }
  ]
});


  // testimonialsSlider
  $('.testimonialsSlider').slick({
    dots: true,
    infinite: false,
    lazyLoad: 'ondemand',
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: 'linear'
  });


});


// zoom Gallery

$(document).ready(function() {
	$('.zoom-gallery').magnificPopup({
		delegate: 'a',
		type: 'image',
		closeOnContentClick: false,
		closeBtnInside: false,
		mainClass: 'mfp-with-zoom mfp-img-mobile',
		image: {
			verticalFit: true,
			titleSrc: function(item) {
				return item.el.attr('title') + ' &middot; <a class="image-source-link" href="'+item.el.attr('data-source')+'" target="_blank">image source</a>';
			}
		},
		gallery: {
			enabled: true
		},
		zoom: {
			enabled: true,
			duration: 300, // don't foget to change the duration also in CSS
			opener: function(element) {
				return element.find('img');
			}
		}
		
	});
});


 // Scroll to a Specific Div
// Get the button
let scollTop = document.getElementById("scollTop");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
    scollTop.style.display = "block";
  } else {
    scollTop.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}




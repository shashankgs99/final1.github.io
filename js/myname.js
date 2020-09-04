var slideIndex = 0;
showSlides();
//add the global timer variable
var slides, dots, timer;

function showSlides() {
    var i;
    slides = document.getElementsByClassName("mySlides");
    dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active1", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active1";

    timer = setTimeout(showSlides, 10000);
}

function plusSlides(position) {
    
    clearTimeout(timer);
    slideIndex += position;
    if (slideIndex > slides.length) {
        slideIndex = 1
    } else if (slideIndex < 1) {
        slideIndex = slides.length
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active1", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active1";

    timer = setTimeout(showSlides, 4000);
}

function currentSlide(index) {

    clearTimeout(timer);
    if (index > slides.length) {
        index = 1
    } else if (index < 1) {
        index = slides.length
    }

    slideIndex = index;
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active1", "");
    }
    slides[index - 1].style.display = "block";
    dots[index - 1].className += " active1";

    timer = setTimeout(showSlides, 4000);
}

var navList = document.getElementById("nav-lists");

function Show() {
    navList.classList.add("_Menus-show");
}

function Hide() {
    navList.classList.remove("_Menus-show");
}
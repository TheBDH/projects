document.addEventListener("DOMContentLoaded", function () {
    var controller = new ScrollMagic.Controller();

    var captions = document.querySelectorAll(".caption");
    var images = document.querySelectorAll(".flash-image");

    captions.forEach(function (caption, index) {
        new ScrollMagic.Scene({
            triggerElement: caption,
            triggerHook: 1,
            duration: "100%"
        })
        .on("enter", function () {
            images[index].style.opacity = 1;
        })
        .on("leave", function () {
            images[index].style.opacity = 0;
        })
        .addTo(controller);
    });
});

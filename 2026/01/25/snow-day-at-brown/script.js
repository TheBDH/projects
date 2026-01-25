document.addEventListener("DOMContentLoaded", function () {
    var controller = new ScrollMagic.Controller();

    var captions = document.querySelectorAll(".caption");
    var images = document.querySelectorAll(".flash-image");

    captions.forEach(function (caption, index) {
        var scene = new ScrollMagic.Scene({
            triggerElement: caption,
            triggerHook: 1,
            duration: "100%"
        })
        .on("enter", function () {
            images[index].style.opacity = 1;
        });

        if (index < captions.length - 1) {
            scene.on("leave", function () {
                images[index].style.opacity = 0;
            });
        } else {
            scene.on("leave", function (event) {
                if (event.scrollDirection === "REVERSE") {
                    images[index].style.opacity = 0;
                }
            });
        }

        scene.addTo(controller);
    });
});
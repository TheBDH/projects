// Ensure all images start hidden
const images = document.querySelectorAll("#collage .flash-image");
images.forEach(img => img.style.opacity = 0);

const controller = new ScrollMagic.Controller();

// List of trigger IDs, image IDs, and scroll offsets
const configs = [
    { image: "#image1", offset: 0 },
    { image: "#image2", offset: 200 },
    { image: "#image3", offset: 400 },
    { image: "#image4", offset: 600 },
    { image: "#image5", offset: 800 },
    { image: "#image6", offset: 1000 },
    { image: "#image7", offset: 1200 },
    { image: "#image8", offset: 1400 },
    { image: "#image9", offset: 1600 },
    { image: "#image10", offset: 1800 },
    { image: "#image11", offset: 2000 },
    { image: "#image12", offset: 2200 },
    { image: "#image13", offset: 2400 }
];

configs.forEach(function(conf) {
    new ScrollMagic.Scene({
        triggerElement: "#trigger",
        offset: conf.offset,
        duration: 200 // Adjust duration as needed
    })
    .on("enter", function () {
        const img = document.querySelector(conf.image);
        if (img) {
            // Flash the image in
            //img.style.transition = "opacity 0.1s";
            img.style.opacity = 1;
        }
    })
    .on("leave", function () {
        const img = document.querySelector(conf.image);
        if (img) {
            // Fade the image out
            //img.style.transition = "opacity 0.1s";
            img.style.opacity = 0;
        }
    })
    .addTo(controller);
});
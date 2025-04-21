document.addEventListener("DOMContentLoaded", function () {
    // Ensure all images start hidden
    const images = document.querySelectorAll("#collage .flash-image");
    images.forEach(img => img.style.opacity = 0);

    const controller = new ScrollMagic.Controller();

    // List of trigger IDs and corresponding forward/backward image IDs
    const configs = [
        { trigger: "#trigger1", forwardImage: "#image1", backwardImage: "#image1" },
        { trigger: "#trigger2", forwardImage: "#image2", backwardImage: "#image1" },
        { trigger: "#trigger3", forwardImage: "#image3", backwardImage: "#image2" },
        { trigger: "#trigger4", forwardImage: "#image4", backwardImage: "#image3" },
        { trigger: "#trigger5", forwardImage: "#image5", backwardImage: "#image4" },
        { trigger: "#trigger6", forwardImage: "#image6", backwardImage: "#image5" },
        { trigger: "#trigger7", forwardImage: "#image7", backwardImage: "#image6" },
        { trigger: "#trigger8", forwardImage: "#image8", backwardImage: "#image7" },
        { trigger: "#trigger9", forwardImage: "#image9", backwardImage: "#image8" },
        { trigger: "#trigger10", forwardImage: "#image10", backwardImage: "#image9" },
        { trigger: "#trigger11", forwardImage: "#image11", backwardImage: "#image10" },
        { trigger: "#trigger12", forwardImage: "#image12", backwardImage: "#image11" },
        { trigger: "#trigger13", forwardImage: "#image13", backwardImage: "#image12" }
    ];

    configs.forEach(function (conf) {
        const triggerElement = document.querySelector(conf.trigger);
        if (!triggerElement) {
            console.warn(`Trigger element not found: ${conf.trigger}`);
            return;
        }
        new ScrollMagic.Scene({
            triggerElement: triggerElement,
            triggerHook: 0.5, // Adjust trigger point (e.g., middle of the viewport)
            duration: 0.01, // Trigger immediately when the div is scrolled past
            reverse: true // Allow the trigger to reverse
        })
            .on("enter", function (event) {
                // Hide all images within the collage
                document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);

                // Show the appropriate image based on scroll direction
                const img = document.querySelector(event.scrollDirection === "REVERSE" ? conf.backwardImage : conf.forwardImage);
                if (img) {
                    img.style.opacity = 1;
                }
            })
            .addTo(controller);
    });
});

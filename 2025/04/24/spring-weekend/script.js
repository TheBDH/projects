document.addEventListener("DOMContentLoaded", function () {
    // Ensure all images start hidden
    const images = document.querySelectorAll("#collage .flash-image");
    images.forEach(img => img.style.opacity = 0);

    const controller = new ScrollMagic.Controller();

    // Define captions to avoid repetition
    const captions = [
        "Spring Weekend 1960",
        "Spring Weekend 1966",
        "Spring Weekend 1966",
        "Spring Weekend 1973",
        "Spring Weekend 1980",
        "Spring Weekend 1980",
        "Spring Weekend 1986",
        "Spring Weekend 2000",
        "Spring Weekend 2000",
        "Spring Weekend 2000",
        "Spring Weekend 2000",
        "Spring Weekend 2000",
        "Media by Emily Gilbert, Spring Weekend 2013"
    ];

    // List of trigger IDs, corresponding forward/backward image IDs, and captions
    const configs = captions.map((caption, index) => ({
        trigger: `#trigger${index + 1}`,
        forwardImage: `#image${index + 1}`,
        backwardImage: `#image${index}`,
        forwardCaption: caption,
        backwardCaption: captions[index - 1] || "Spring Weekend"
    }));

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

                // Update the caption text based on scroll direction
                const captionElement = document.querySelector("#caption");
                if (captionElement) {
                    captionElement.textContent = event.scrollDirection === "REVERSE" ? conf.backwardCaption : conf.forwardCaption;
                }
            })
            .addTo(controller);
    });
});

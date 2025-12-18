document.addEventListener("DOMContentLoaded", function () {
    // Images to fade in/out
    const images = document.querySelectorAll("#collage .flash-image");
    images.forEach(img => img.style.opacity = 0);

    const controller = new ScrollMagic.Controller();

    const captions = [
        "Media by Henry Wang",
        "Media by Anna Luecht",
        "",
        "Media by Julia Antony",
        "",
        "Media by Theodore Coben",
        "",
        "Media by Henry Wang",
        "",
        "Media by Anna Luecht",
        "",
        "Media by Manav Musunuru",
        "",
        "Media by Anna Luecht"
    ];

    const configs = captions.map((caption, index) => ({
        trigger: `#trigger${index + 1}`,
        forwardImage: `#image${index + 1}`,
        backwardImage: `#image${index}`,
        forwardCaption: caption,
        backwardCaption: captions[index - 1] || ""
    }));

    configs.forEach(function (conf, idx) {
        const triggerElement = document.querySelector(conf.trigger);
        if (!triggerElement) {
            return;
        }
        
        new ScrollMagic.Scene({
            triggerElement: triggerElement,
            triggerHook: 0,
            duration: 0.01,
            reverse: true
        })
        .on("enter", function (event) {

            // Hide all images
            document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);

            const isReverse = event.scrollDirection === "REVERSE";
            
            let targetImage;
            let targetCaption;
            
            if (isReverse) {
                targetImage = conf.backwardImage;
                targetCaption = conf.backwardCaption;
            } else {
                targetImage = conf.forwardImage;
                targetCaption = conf.forwardCaption;
            }
            
            // Fade Image
            const img = document.querySelector(targetImage);
            if (img) {
                img.style.opacity = 1;
            }

            const captionElement = document.querySelector("#caption");
            if (captionElement) {
                if (targetCaption) {
                    captionElement.textContent = targetCaption;
                    captionElement.style.opacity = 1;
                } else {
                    captionElement.style.opacity = 0;
                }
            }
        })
        .addTo(controller);
    });

    // --- Outro Section ---
    const lastTriggerIndex = configs.length;
    const lastTriggerElement = document.querySelector(`#trigger${lastTriggerIndex + 1}`);
    const outroText = document.querySelector(".outro-text");
    
    if (lastTriggerElement) {
        new ScrollMagic.Scene({
            triggerElement: lastTriggerElement,
            triggerHook: 0,
            duration: 0.01,
            reverse: true
        })
        .on("enter", function (event) {
            const captionElement = document.querySelector("#caption");

            if (event.scrollDirection === "FORWARD") {
                // Fade out everything
                document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);
                
                if (outroText) {
                    outroText.style.display = "block";
                    // Small timeout to allow display:block to apply before fading in
                    setTimeout(() => outroText.style.opacity = 1, 50);
                }

                // Fade out caption
                if (captionElement) captionElement.style.opacity = 0;

            } else {
                // Scrolling Back Up
                const lastImg = document.querySelector(`#image${configs.length}`);
                if (lastImg) lastImg.style.opacity = 1;

                if (outroText) {
                    outroText.style.opacity = 0;
                    setTimeout(() => outroText.style.display = "none", 600);
                }

                // Restore last caption
                if (captionElement) {
                    captionElement.textContent = captions[captions.length - 1];
                    captionElement.style.opacity = 1;
                }
            }
        })
        .addTo(controller);
    }

    // --- Initializer ---
    function initializeScrollState() {
        const currentScroll = window.scrollY || window.pageYOffset;
        let activeConfig = null;

        for (let i = configs.length - 1; i >= 0; i--) {
            const triggerElement = document.querySelector(configs[i].trigger);
            if (triggerElement && currentScroll >= triggerElement.offsetTop) {
                activeConfig = configs[i];
                break;
            }
        }

        const captionElement = document.querySelector("#caption");

        if (activeConfig) {
            document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);
            
            const img = document.querySelector(activeConfig.forwardImage);
            if (img) img.style.opacity = 1;

            if (captionElement) {
                captionElement.textContent = activeConfig.forwardCaption;
                captionElement.style.opacity = activeConfig.forwardCaption ? 1 : 0;
            }
        } else {
            // At top of page, hide caption
            if (captionElement) captionElement.style.opacity = 0;
        }
    }

    setTimeout(initializeScrollState, 100);
    window.addEventListener('resize', () => controller.update(true));
});
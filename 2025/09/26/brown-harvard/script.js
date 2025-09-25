document.addEventListener("DOMContentLoaded", function () {
    const intros = document.querySelectorAll('.intro-text');
    const introSection = document.getElementById('dramatic-intro');

    function showCurrentIntro() {
        // Recalculate pageHeight and sectionTop in case window size or layout changed
        const pageHeight = window.innerHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        const sectionTop = introSection.offsetTop;
        let relativeScroll = scrollY + pageHeight / 2 - sectionTop;
        if (relativeScroll < 0) relativeScroll = 0;
        const halfPage = pageHeight / 2;
        let rawIndex = relativeScroll / halfPage;

        intros.forEach((el, i) => {
            el.style.transition = "opacity 0.3s";
            if (i < intros.length - 1) {
                el.style.opacity = (Math.floor(rawIndex) === i) ? 1 : 0;
            } else {
                // Fade out last element as you scroll past it
                if (rawIndex < intros.length - 1) {
                    el.style.opacity = (Math.floor(rawIndex) === i) ? 1 : 0;
                } else if (rawIndex >= intros.length - 1 && rawIndex < intros.length) {
                    el.style.opacity = 1;
                } else {
                    el.style.opacity = 0;
                }
            }
        });
    }

    intros.forEach((el, i) => { el.style.opacity = i === 0 ? 1 : 0; });
    showCurrentIntro()
    intros.forEach(el => {
        el.style.display = "flex";
    });

    window.addEventListener('scroll', showCurrentIntro);
    window.addEventListener('resize', showCurrentIntro);
    showCurrentIntro();

    let lastBgIndex = -1;
    const bgImages = [
        'url("images/footballBackground.png")',
        'url("images/otherFootballBackgroundFullMainLines.png")',
    ];

    function updateBackground() {
        const scrollY = window.scrollY || window.pageYOffset;
        const triggerPoint = window.innerHeight * 2.5; // 250vh

        let bgIndex = 0;
        if (scrollY >= triggerPoint) {
            bgIndex = 1; // Switch to bg2 at 250vh
        }

        if (bgIndex !== lastBgIndex) {
            document.body.style.backgroundImage = bgImages[bgIndex];
            lastBgIndex = bgIndex;
        }
    }

    window.addEventListener('scroll', updateBackground);
    window.addEventListener('resize', updateBackground);
    updateBackground();


    // Images to fade in/out (excluding the first one)
    const images = document.querySelectorAll("#collage .flash-image");
    images.forEach(img => img.style.opacity = 0);


    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();

    // Define captions to avoid repetition
    const captions = [
        "Brown – Harvard 1893",
        "Brown – Harvard 1966",
        "Brown – Harvard 1966",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973",
        "Brown – Harvard 1973"
    ];

    // List of trigger IDs, corresponding forward/backward image IDs, and captions
    const configs = captions.map((caption, index) => ({
        trigger: `#trigger${index + 1}`,
        forwardImage: `#image${index + 1}`,
        backwardImage: `#image${index}`,
        forwardCaption: caption,
        backwardCaption: captions[index - 1] || "Brown – Harvard"
    }));

    configs.forEach(function (conf, idx) {
        const triggerElement = document.querySelector(conf.trigger);
        if (!triggerElement) {
            console.warn(`Trigger element not found: ${conf.trigger}`);
            return;
        }
        new ScrollMagic.Scene({
            triggerElement: triggerElement,
            triggerHook: 0,
            duration: 0.01,
            reverse: true
        })
            .on("enter", function (event) {
                // Show/hide #collage for trigger1
                if (idx === 0) {
                    const collage = document.getElementById("collage");
                    if (event.scrollDirection === "FORWARD") {
                        collage.style.display = "block";
                    } else {
                        collage.style.display = "none";
                    }
                }

                // Hide all images within the collage
                document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);

                // Show the appropriate image based on scroll direction
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
                
                const img = document.querySelector(targetImage);
                if (img) {
                    img.style.opacity = 1;
                }

                // Update the caption text
                const captionElement = document.querySelector("#caption");
                if (captionElement) {
                    captionElement.textContent = targetCaption;
                }
            })
            .addTo(controller);
    });

    // Add fade to black after the last image
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
                if (event.scrollDirection === "FORWARD") {
                    // Hide all images to create fade to black effect
                    document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);
                    outroText.style.display = "block";
                    outroText.style.transition = "opacity 0.6s ease-in-out";
                    setTimeout(() => {
                        outroText.style.opacity = 1;
                    }, 50);

                    
                    // Clear caption
                    const captionElement = document.querySelector("#caption");
                } else {
                    // When scrolling back up, show the last image
                    const lastImg = document.querySelector(`#image${configs.length}`);
                    if (lastImg) {
                        lastImg.style.opacity = 1;
                    }

                    outroText.style.opacity = 0;
                    setTimeout(() => {
                        outroText.style.display = "none";
                    }, 50);

                    outroText.style.display = "none";
                    outroText.style.opacity = 0;
                    
                    // Restore last caption
                    const captionElement = document.querySelector("#caption");
                    if (captionElement) {
                        captionElement.textContent = captions[captions.length - 1];
                    }
                }
            })
            .addTo(controller);
    }

    // Initialize proper state based on current scroll position
    function initializeScrollState() {
        const currentScroll = window.scrollY || window.pageYOffset;
        let activeConfig = null;
        
        // Find which trigger we're currently past
        for (let i = configs.length - 1; i >= 0; i--) {
            const triggerElement = document.querySelector(configs[i].trigger);
            if (triggerElement && currentScroll >= triggerElement.offsetTop) {
                activeConfig = configs[i];
                break;
            }
        }
        
        if (activeConfig) {
            // Show collage if we're past the first trigger
            const collage = document.getElementById("collage");
            if (collage) {
                collage.style.display = "block";
            }
            
            // Hide all images first
            document.querySelectorAll("#collage .flash-image").forEach(img => img.style.opacity = 0);
            
            // Show the appropriate image
            const img = document.querySelector(activeConfig.forwardImage);
            if (img) {
                img.style.opacity = 1;
            }
            
            // Update caption
            const captionElement = document.querySelector("#caption");
            if (captionElement) {
                captionElement.textContent = activeConfig.forwardCaption;
            }
        }
    }
    
    // Initialize state after a brief delay to ensure all elements are ready
    setTimeout(initializeScrollState, 100);

    // Refresh ScrollMagic controller on window resize to fix scroll position issues
    window.addEventListener('resize', function() {
        controller.update(true);
    });



    
});
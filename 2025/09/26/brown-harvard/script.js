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

    
});
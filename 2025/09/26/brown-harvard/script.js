document.addEventListener("DOMContentLoaded", function () {
    const intros = document.querySelectorAll('.intro-text');
    const introSection = document.getElementById('dramatic-intro');
    const pageHeight = window.innerHeight;

    function showCurrentIntro() {
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

    
});
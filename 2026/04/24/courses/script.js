const slideSidebar = document.getElementById('slide-sidebar');
const slideSidebarBody = document.getElementById('slide-sidebar-body');
const slideSidebarClose = document.getElementById('slide-sidebar-close');
const frontOverlay = document.getElementById('front-overlay');
const consideredBox = document.getElementById('considered');
let panelOpen = false;
let isOpening = false;
let wheelUnlockAt = 0;

const closePanel = () => {
    slideSidebar.classList.remove('open');
    frontOverlay.classList.remove('faded');
    consideredBox.classList.remove('faded');
    isOpening = false;
    panelOpen = false;
};

slideSidebarClose.addEventListener('click', () => {
    closePanel();
});

slideSidebar.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform') {
        return;
    }

    if (slideSidebar.classList.contains('open')) {
        isOpening = false;
        wheelUnlockAt = performance.now() + 220;
    } else {
        slideSidebarBody.scrollTop = 0;
        isOpening = false;
    }
});

window.addEventListener('wheel', (event) => {
    event.preventDefault();

    if (event.deltaY > 0 && !panelOpen) {
        isOpening = true;
        slideSidebarBody.scrollTop = 0;
        slideSidebar.classList.add('open');
        frontOverlay.classList.add('faded');
        consideredBox.classList.add('faded');
        panelOpen = true;
        return;
    }

    if (!panelOpen) {
        return;
    }

    if (isOpening) {
        return;
    }

    if (performance.now() < wheelUnlockAt) {
        return;
    }

    const nextScrollTop = Math.max(0, slideSidebarBody.scrollTop + event.deltaY);
    slideSidebarBody.scrollTop = nextScrollTop;

    if (event.deltaY < 0 && nextScrollTop === 0) {
        closePanel();
    }
}, { passive: false });
const slideSidebar = document.getElementById('slide-sidebar');
const slideSidebarBody = document.getElementById('slide-sidebar-body');
const slideSidebarClose = document.getElementById('slide-sidebar-close');
const suggestionButtons = document.querySelectorAll('.considered-item[data-scroll-target]');
const frontOverlay = document.getElementById('front-overlay');
const consideredBox = document.getElementById('considered');
let panelOpen = false;
let isOpening = false;
let wheelUnlockAt = 0;

function showDay(v){document.querySelectorAll('[data-day]').forEach(b=>b.classList.toggle('active',b.dataset.day===v));}

const openPanel = () => {
    isOpening = true;
    slideSidebarBody.scrollTop = 0;
    slideSidebar.classList.add('open');
    frontOverlay.classList.add('faded');
    consideredBox.classList.add('faded');
    panelOpen = true;
};

const scrollToMarker = (markerId) => {
    const marker = document.getElementById(markerId);
    if (!marker) {
        return;
    }

    const onOpened = (event) => {
        if (event.propertyName !== 'transform') {
            return;
        }
        if (slideSidebar.classList.contains('open')) {
            slideSidebarBody.scrollTo({
                top: marker.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    slideSidebar.addEventListener('transitionend', onOpened, { once: true });
    openPanel();
};

suggestionButtons.forEach((button) => {
    const markerId = button.dataset.scrollTarget;
    button.addEventListener('click', () => {
        scrollToMarker(markerId);
    });
    button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            scrollToMarker(markerId);
        }
    });
});

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
    if (window.matchMedia('(max-width: 768px)').matches) {
        return;
    }

    event.preventDefault();

    if (event.deltaY > 0 && !panelOpen) {
        openPanel();
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
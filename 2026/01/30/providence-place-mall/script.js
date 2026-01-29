const steps = document.querySelectorAll(".step");
const photoImg = document.querySelector(".photo img");
const photoContainer = document.querySelector(".photo");

let currentIndex = null;
let isTransitioning = false;

const scroller = scrollama();

function handleStepEnter(response) {
  const index = response.index;
  if (!photoImg) return;
  if (currentIndex === index) return;
  const newSrc = `images/photo-${index}.JPG`;

  // if this is step 17, add active class to two-col to trigger color transition
  const el = response.element;
  if (el && el.getAttribute && el.getAttribute("data-step") === "17") {
    const two = el.closest(".two-col");
    if (two) two.classList.add("active");
  }

  const pre = new Image();
  pre.src = newSrc;

  if (photoContainer) {
    if (index > 7) {
      photoContainer.classList.add("unpinned");
    } else {
      photoContainer.classList.remove("unpinned");
      pre.onload = () => {
        if (isTransitioning) {
          currentIndex = index;
          photoImg.src = newSrc;
          photoImg.classList.remove("fade-out");
          isTransitioning = false;
          return;
        }

        isTransitioning = true;
        photoImg.classList.add("fade-out");

        const onTransitionEnd = (e) => {
          if (e.propertyName !== "opacity") return;
          photoImg.removeEventListener("transitionend", onTransitionEnd);
          photoImg.src = newSrc;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              photoImg.classList.remove("fade-out");
            }),
          );
          currentIndex = index;
          const onFadeInEnd = (ev) => {
            if (ev.propertyName !== "opacity") return;
            photoImg.removeEventListener("transitionend", onFadeInEnd);
            isTransitioning = false;
          };
          photoImg.addEventListener("transitionend", onFadeInEnd);
        };

        photoImg.addEventListener("transitionend", onTransitionEnd);
      };
    }
  }
}

function init() {
  scroller
    .setup({
      step: ".scroll .scrolly article .step",
      offset: 0.5,
      debug: false,
      container: ".scroll",
    })
    .onStepEnter(handleStepEnter);
}

init();

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.getElementById("progress-bar").style.width = scrollPercent + "%";
}

window.addEventListener("scroll", updateProgressBar);

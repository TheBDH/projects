const steps = document.querySelectorAll(".step");
const photoImg = document.querySelector(".photo img");
const photoContainer = document.querySelector(".photo");
const toc = document.getElementById("toc");

let currentIndex = null;
let isTransitioning = false;

const scroller = scrollama();

function handleStepEnter(response) {
  const index = response.index;
  const stepEl = response.element;
  const sid = stepEl?.id || 0;
  document
    .querySelectorAll(".toc-list button")
    .forEach((b) => b.classList.remove("active"));
  if (document.querySelector(`[data-target-id="${sid}"]`)) {
    document.querySelector(`[data-target-id="${sid}"]`).classList.add("active");
  }
  if (!photoImg) return;
  if (currentIndex === index) return;
  const newSrc = `images/photo-${index + 1}.JPG`;

  if (index >= 1) {
    toc.classList.add("visible");
  } else {
    toc.classList.remove("visible");
  }

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
          photoImg.classList.remove("fade-out");
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

const headings = document.querySelectorAll(".subheading");
const tocList = document.querySelector(".toc-list");

headings.forEach((h, i) => {
  const step = h.closest(".step") || h;
  const id = step.id || `toc-${i}`;
  step.id = id;

  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = h.textContent.trim();
  btn.setAttribute("data-target-id", id);
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const rect = step.getBoundingClientRect();
    const top = window.scrollY + rect.top - 80;
    window.scrollTo({ top, behavior: "smooth" });
    document
      .querySelectorAll(".toc-list button")
      .forEach((x) => x.classList.remove("active"));
    btn.classList.add("active");
  });

  li.appendChild(btn);
  tocList.appendChild(li);
});

document.querySelectorAll(".toc-list button").forEach((b) => {
  const tid = b.getAttribute("data-target-id");
});

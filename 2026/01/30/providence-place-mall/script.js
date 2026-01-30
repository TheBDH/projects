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

// ciara table of contents thing
const headings = document.querySelectorAll(".subheading");
const tocList = document.querySelector(".toc-list");

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

headings.forEach((h, i) => {
  const step = h.closest(".step") || h;
  const id = step.id || `toc-${i}-${slugify(h.textContent || "heading")}`;
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

const idToButton = {};
document.querySelectorAll(".toc-list button").forEach((b) => {
  const tid = b.getAttribute("data-target-id");
  if (tid) idToButton[tid] = b;
});

const stepsToObserve = Array.from(document.querySelectorAll(".step")).filter(
  (s) => s.querySelector(".subheading"),
);

if (stepsToObserve.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(
        (e) => e.isIntersecting && e.intersectionRatio > 0,
      );
      if (!visible.length) return;
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const top = visible[0].target;
      const btn = idToButton[top.id];
      if (!btn) return;
      document
        .querySelectorAll(".toc-list button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    },
    {
      root: null,
      rootMargin: "0px 0px -40% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    },
  );

  stepsToObserve.forEach((s) => observer.observe(s));

  const setInitial = () => {
    const inView = stepsToObserve.find((s) => {
      const r = s.getBoundingClientRect();
      return (
        r.top <= window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.2
      );
    });
    if (inView && idToButton[inView.id]) {
      document
        .querySelectorAll(".toc-list button")
        .forEach((b) => b.classList.remove("active"));
      idToButton[inView.id].classList.add("active");
    }
  };
  window.addEventListener("load", setInitial);
  window.addEventListener("resize", setInitial);
  setInitial();
}

const creditDiv = document.getElementById("current-credit");
const media = document.querySelectorAll(".media");

const scroller = scrollama();

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// pumpkin dot radius in viewBox units: back dots are DOT_R, front dots
// DOT_R + DOT_R_GROW (the cursor orb matches the front dots)
const DOT_R = 0.9;
const DOT_R_GROW = 1.4;
const PUMPKIN_VIEWBOX_W = 120;

// dotted pumpkin on the opening screen: a 3D point cloud (ribs + stem) spun
// around its vertical axis, dots fading and shrinking as they turn away
function drawPumpkin() {
  const RIBS = 10;
  const DOTS_PER_RIB = 22;
  const WIDTH = 52;
  const HEIGHT = 40;
  const TILT = 0.3; // radians, leans the top toward the viewer

  const points = [];
  for (let k = 0; k < RIBS; k++) {
    const phi = (k / RIBS) * Math.PI * 2;
    for (let i = 1; i < DOTS_PER_RIB; i++) {
      const theta = -Math.PI / 2 + (i / DOTS_PER_RIB) * Math.PI;
      points.push({ phi, r: Math.cos(theta), y: -Math.sin(theta) * HEIGHT });
    }
  }
  // stem: a short curved column rising from the top
  for (let i = 0; i < 6; i++) {
    points.push({ phi: 0, r: 0.06 + i * 0.015, y: -HEIGHT - 4 - i * 4, stem: true });
  }

  const svg = d3.select("#pumpkin");
  const dots = svg.selectAll("circle").data(points).join("circle");

  function render(angle) {
    dots.each(function (p) {
      const a = p.phi + (p.stem ? 0 : angle);
      const x = p.r * WIDTH * Math.cos(a);
      const z0 = p.r * WIDTH * Math.sin(a);
      // tilt around the x-axis
      const y = p.y * Math.cos(TILT) - z0 * Math.sin(TILT);
      const z = p.y * Math.sin(TILT) + z0 * Math.cos(TILT);
      const depth = (z / WIDTH + 1) / 2; // 0 = back, 1 = front
      this.setAttribute("cx", x.toFixed(2));
      this.setAttribute("cy", y.toFixed(2));
      this.setAttribute("r", (DOT_R + depth * DOT_R_GROW).toFixed(2));
      this.setAttribute("opacity", (0.15 + depth * 0.85).toFixed(2));
    });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    render(0.4);
  } else {
    d3.timer((elapsed) => render(elapsed / 2200));
  }
}

drawPumpkin();

// photos sitting side by side in the same grid row color in together
function rowOf(el) {
  const top = el.getBoundingClientRect().top;
  const group = el.closest(".photos").querySelectorAll(".media");
  return [...group].filter((m) => Math.abs(m.getBoundingClientRect().top - top) < 2);
}

scroller
  .setup({
    step: ".media",
    offset: 0.6,
  })
  .onStepEnter((response) => {
    const row = rowOf(response.element);
    media.forEach((el) => el.classList.toggle("active", row.includes(el)));
    const name = response.element.dataset.credit;
    creditDiv.textContent = name ? `Media by ${name} | The Brown Daily Herald` : "";
  })
  .onStepExit((response) => {
    // scrolled back up past the first photo
    if (response.element === media[0] && response.direction === "up") {
      rowOf(response.element).forEach((el) => el.classList.remove("active"));
      creditDiv.textContent = "";
    }
  });

window.addEventListener("resize", scroller.resize);

const progressBar = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  progressBar.style.width = `${scrollPercent}%`;
});

// timeline line draws itself as you scroll: the "pen" sits at the same 60%
// mark as the scrollama offset. In each chapter the top line draws over the
// first stretch of scroll, then the side line follows the pen down
const chapters = document.querySelectorAll(".chapter");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function drawTimeline() {
  const pen = window.innerHeight * 0.6;
  const topRun = window.innerHeight * 0.25; // scroll distance for the top line

  chapters.forEach((chapter, i) => {
    const { top, height } = chapter.getBoundingClientRect();
    const d = pen - top;
    const run = i === 0 ? 0 : topRun; // first chapter has no top line
    const topP = run ? clamp01(d / run) : 1;
    const sideP = clamp01((d - run) / (height - run));

    chapter.style.setProperty("--top", topP.toFixed(4));
    chapter.style.setProperty("--side", sideP.toFixed(4));
    chapter.style.setProperty("--web-o", topP >= 1 && d > run ? 1 : 0);
  });
}

if (!reduceMotion) {
  let ticking = false;
  const requestDraw = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      drawTimeline();
      ticking = false;
    });
  };
  drawTimeline();
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", requestDraw);
  window.addEventListener("load", requestDraw);
}

// glowing orb cursor, the same size on screen as the pumpkin's front dots
const cursor = document.getElementById("cursor");
const pumpkinSvg = document.getElementById("pumpkin");

function sizeCursor() {
  const scale = pumpkinSvg.getBoundingClientRect().width / PUMPKIN_VIEWBOX_W;
  const size = 2 * (DOT_R + DOT_R_GROW) * scale;
  document.documentElement.style.setProperty("--cursor-size", `${size.toFixed(1)}px`);
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  sizeCursor();
  window.addEventListener("resize", sizeCursor);
  window.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    cursor.classList.add("visible");
  });
  document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("visible"));
}

var timelineStep = d3.selectAll(".timeline-step");
var timelineStep1 = d3.selectAll(".timeline-step-1");
var timelineStep2 = d3.selectAll(".timeline-step-2");

// var otherNewsStep = d3.selectAll(".other-news-step");

var images = [
  "./assets/background-photos/1.jpg",
  "./assets/background-photos/2.jpg",
  "./assets/background-photos/3.jpg",
  "./assets/background-photos/4.jpg",
  "./assets/background-photos/5.jpg",
  "./assets/background-photos/6.jpg",
  "./assets/background-photos/7.jpg",
  "./assets/background-photos/8.jpg",
];

var imageCredits = [
  "Media by Ellis Rougeou | The Brown Daily Herald",
  "Media by Stephanie London | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Sophia Leng | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Scout Chen | The Brown Daily Herald",
  "Media by Ben Kang | The Brown Daily Herald",
  "Media by Nat Hardy | The Brown Daily Herald",
];

const timelineData = [
  { step: 1, label: "4:05 p.m.", day: "Saturday, Dec. 13" },
  { step: 2, label: "4:22 p.m.", day: "Saturday, Dec. 13" },
  { step: 3, label: "4:28 p.m.", day: "Saturday, Dec. 13" },
  { step: 4, label: "4:50 p.m.", day: "Saturday, Dec. 13" },
  { step: 5, label: "5:11 p.m.", day: "Saturday, Dec. 13" },
  { step: 6, label: "5:27 p.m.", day: "Saturday, Dec. 13" },
  { step: 7, label: "5:30 p.m.", day: "Saturday, Dec. 13" },
  { step: 8, label: "5:45 p.m.", day: "Saturday, Dec. 13" },
  { step: 9, label: "6:05 p.m.", day: "Saturday, Dec. 13" },
  { step: 10, label: "6:10 p.m.", day: "Saturday, Dec. 13" },
  { step: 11, label: "6:33 p.m.", day: "Saturday, Dec. 13" },
  { step: 12, label: "6:35 p.m.", day: "Saturday, Dec. 13" },
  { step: 13, label: "7:20 p.m.", day: "Saturday, Dec. 13" },
  { step: 14, label: "7:38 p.m.", day: "Saturday, Dec. 13" },
  { step: 15, label: "8:28 p.m.", day: "Saturday, Dec. 13" },
  { step: 16, label: "9:37 p.m.", day: "Saturday, Dec. 13" },
  { step: 17, label: "11:06 p.m.", day: "Saturday, Dec. 13" },
  { step: 18, label: "11:10 p.m.", day: "Saturday, Dec. 13" },
  { step: 19, label: "12:07 a.m.", day: "Sunday, Dec. 14" },
  { step: 20, label: "12:15 a.m.", day: "Sunday, Dec. 14" },
  { step: 21, label: "1:53 a.m.", day: "Sunday, Dec. 14" },
  { step: 22, label: "1:54 a.m.", day: "Sunday, Dec. 14" },
  { step: 23, label: "3:05 a.m.", day: "Sunday, Dec. 14" },
  { step: 24, label: "5:42 a.m.", day: "Sunday, Dec. 14" },
  { step: 25, label: "7:05 a.m.", day: "Sunday, Dec. 14" },
  { step: 26, label: "8:15 a.m.", day: "Sunday, Dec. 14" },
  { step: 27, label: "8:23 a.m.", day: "Sunday, Dec. 14" },
  { step: 28, label: "12:24 p.m.", day: "Sunday, Dec. 14" },
  { step: 29, label: "1:00 p.m.", day: "Sunday, Dec. 14" },
  { step: 30, label: "3:07 p.m.", day: "Sunday, Dec. 14" },
  { step: 31, label: "3:43 p.m.", day: "Sunday, Dec. 14" },
  { step: 32, label: "11:00 p.m.", day: "Sunday, Dec. 14" },
  { step: 33, label: "11:47 p.m.", day: "Sunday, Dec. 14" },
  { step: 34, label: "5:00 p.m.", day: "Monday, Dec. 15" },
  { step: 35, label: "6:26 p.m.", day: "Monday, Dec. 15" },
];

// var sideImage = document.querySelector(".background");
// var sideImageCaption = document.querySelector(".photo-caption-bg");

var scroller = scrollama();

const steps = document.querySelectorAll(".step");
const progressFill = document.querySelector(".progress-fill");
const progressLabel = document.querySelector(".progress-label");
const progressBar = document.querySelector(".progress-bar");
const labelMain = document.querySelector(".label-main");
const contextAbove = document.querySelector(".context-above");
const contextBelow = document.querySelector(".context-below");
const itemHeight = labelMain.offsetHeight;

scroller
  .setup({
    step: ".step",
    offset: 0.45,
    debug: false,
  })
  .onStepEnter((response) => {
    const index = response.index;
    const total = steps.length - 1;

    const progress = Math.max(0, index / total);
    progressFill.style.height = `${progress * 100}%`;

    const stepEl = response.element;
    const time = stepEl.getAttribute("data-step");
    const activeIndex = timelineData.findIndex((d) => String(d.step) === time);

    if (activeIndex >= 0 && timelineData[activeIndex].label) {
      const barHeight = document.querySelector(".progress-bar").offsetHeight;
      const labelY = progress * barHeight;

      labelMain.innerHTML =
        "<i>" +
        timelineData[activeIndex].day +
        "</i><br/>" +
        timelineData[activeIndex].label;
      updateLabelContext(activeIndex);
      progressLabel.style.top = `${labelY}px`;
      progressLabel.classList.add("is-visible");
    } else {
      progressLabel.classList.remove("is-visible");
    }
  });

let activeTimelineIndex = -1;

function updateLabelContext(activeIndex) {
  contextAbove.innerHTML = "";
  contextBelow.innerHTML = "";

  for (let offset = -2; offset <= 2; offset++) {
    const i = activeIndex + offset;
    if (i < 0 || i >= timelineData.length || offset == 0) continue;

    const item = timelineData[i];
    const div = document.createElement("div");
    div.className = offset === 0 ? "context-item main" : "context-item";

    div.style.top = `${offset * (itemHeight + 6)}px`;

    div.textContent = item.label;

    div.addEventListener("click", () => {
      const target = document.querySelector(`.step[data-step="${item.step}"]`);
      window.scrollTo({
        top: target.offsetTop - window.innerHeight / 3,
        behavior: "smooth",
      });
    });

    if (offset < 0) {
      contextAbove.appendChild(div);
    } else {
      contextBelow.appendChild(div);
    }
  }
}

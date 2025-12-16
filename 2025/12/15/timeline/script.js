var timelineStep = d3.selectAll(".timeline-step");
var timelineStep1 = d3.selectAll(".timeline-step-1");
var timelineStep2 = d3.selectAll(".timeline-step-2");

// var otherNewsStep = d3.selectAll(".other-news-step");

var images = [
  "./assets/background-photos/1.jpg",
  "./assets/background-photos/2.jpg",
  "./assets/background-photos/3.jpg",
  "./assets/background-photos/4.png",
  "./assets/background-photos/5.jpg",
  "./assets/background-photos/6.png",
  "./assets/background-photos/7.jpg",
  "./assets/background-photos/8.jpg",
  "./assets/background-photos/9.jpeg",
];

var imageCredits = [
  "Media by Kenna Lee | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Annika Singh | The Brown Daily Herald",
  "Courtesy of the Providence Police Department",
  "Media by Hadley Carr | The Brown Daily Herald",
  "Media by Hadley Carr | The Brown Daily Herald",
  "Media by Anna Luecht | The Brown Daily Herald",
  "Media by Anna Luecht | The Brown Daily Herald",
  "Courtesy of the Providence Police Department",
];

var caption = [
  "Barus and Holley Room 166",
  "Governor Street on Dec. 15",
  "",
  "",
  "",
  "The Olney-Margolies Athletic Center on Dec. 13.",
  "",
  "",
  "Photos of a suspect taken at 2:18 p.m. on Dec. 13 at Corner of Hope and Benevolent streets, publicly released Dec. 15.",
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

const background = document.querySelector(".background");
const photoCredit = document.querySelector(".photo-credit-bg");
const photoCaption = document.querySelector(".photo-caption-bg");

const progressContainer = document.querySelector(".progress-container");

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

    if (index == 0) {
      progressBar.style.visibility = "hidden";
    } else {
      progressBar.style.visibility = "visible";
    }

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

      let photoIndex = 0;
      if (activeIndex >= 1 && activeIndex <= 5) {
        photoIndex = 0;
      } else if (activeIndex >= 6 && activeIndex <= 8) {
        photoIndex = 1;
      } else if (activeIndex >= 9 && activeIndex <= 18) {
        photoIndex = 2;
      } else if (activeIndex == 19) {
        photoIndex = 3;
      } else if (activeIndex >= 20 && activeIndex <= 22) {
        photoIndex = 4;
      } else if (activeIndex >= 23 && activeIndex <= 24) {
        photoIndex = 5;
      } else if (activeIndex >= 25 && activeIndex <= 29) {
        photoIndex = 6;
      } else if (activeIndex >= 30 && activeIndex <= 33) {
        photoIndex = 7;
      } else if (activeIndex >= 34) {
        photoIndex = 8;
      }

      background.style.backgroundImage = `url(${images[photoIndex]})`;
      photoCredit.textContent = imageCredits[photoIndex];
      if (caption[photoIndex] != "") {
        photoCaption.style.visibility = "visible";
        photoCaption.textContent = caption[photoIndex];
      } else {
        photoCaption.style.visibility = "hidden";
      }
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

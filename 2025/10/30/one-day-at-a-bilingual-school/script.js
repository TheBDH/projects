const scroller = scrollama();

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const digital = document.getElementById("digitalTime");

let lastHourDeg = 0;
let lastMinuteDeg = 0;
let scrollDirection = "down";

function setClockTime(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);

  hour = hour % 12;

  let hourDeg = (hour + minute / 60) * 30;
  let minuteDeg = minute * 6;

  if (scrollDirection === "down") {
    while (hourDeg < lastHourDeg) hourDeg += 360;
    while (minuteDeg < lastMinuteDeg) minuteDeg += 360;
  } else {
    while (hourDeg > lastHourDeg) hourDeg -= 360;
    while (minuteDeg > lastMinuteDeg) minuteDeg -= 360;
  }

  lastHourDeg = hourDeg;
  lastMinuteDeg = minuteDeg;

  hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translate(-50%, -100%) rotate(0deg)`;

  const ampm = hour >= 12 ? "PM" : "AM";
  digital.textContent = `${timeStr} ${ampm}`;
}

const bgImg = document.querySelector(".bg-img");
const clock = document.getElementById("clock");

scroller
  .setup({
    step: ".step",
    offset: 0.6,
  })
  .onStepEnter((response) => {
    const el = response.element;
    const t = el.dataset.time;
    const idx = response.index;
    scrollDirection = response.direction;

    el.classList.add("active");

    if (idx >= 1) {
      bgImg.style.opacity = 0;
    } else {
      bgImg.style.opacity = 1;
    }

    if (t) {
      clock.style.opacity = 1;
      setClockTime(t);
    } else {
      clock.style.opacity = 0;
    }
  })
  .onStepExit((response) => {
    const el = response.element;
    scrollDirection = response.direction;

    el.classList.remove("active");
  });

window.addEventListener("resize", scroller.resize);

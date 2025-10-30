const scroller = scrollama();

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const digital = document.getElementById("digitalTime");

function setClockTime(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);

  hour = hour % 12;

  const hourDeg = (hour + minute / 60) * 30;
  const minuteDeg = minute * 6;
  const secondDeg = 0;

  hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translate(-50%, -100%) rotate(${secondDeg}deg)`;

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

    if (response.direction === "down") {
      el.classList.remove("active");
    } else if (response.direction === "up") {
      el.classList.remove("active");
    }
  });

window.addEventListener("resize", scroller.resize);

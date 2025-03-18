var timelineStep = d3.selectAll(".timeline-step");

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

var sideImage = document.querySelector(".background");
var sideImageCaption = document.querySelector(".photo-caption-bg");

var scroller = scrollama();
scroller
  .setup({
    step: ".step",
    offset: 0.6,
    debug: false,
  })
  .onStepEnter((response) => {
    timelineStep.classed("is-active", false);
    // otherNewsStep.classed("is-visible", false);

    if (response.index >= 2) {
      timelineStep.classed("is-visible", true);
      sideImage.style.backgroundImage = `url(${images[response.index - 2]})`;
      sideImageCaption.innerHTML = imageCredits[response.index - 2];
    } else if (response.index == 0 || response.index == 1) {
      timelineStep.classed("is-visible", false);
      sideImageCaption.textContent =
        "Media by Scout Chen | The Brown Daily Herald";
      sideImage.style.backgroundImage = `url("./assets/background.jpg")`;
    }

    timelineStep
      .filter(function (d, i) {
        return i === response.index - 2;
      })
      .classed("is-active", true);

    // otherNewsStep
    //   .filter(function (d, i) {
    //     return i === response.index - 2;
    //   })
    //   .classed("is-visible", true);
  });

const timelineDots = document.querySelectorAll(".timeline-step");

timelineDots.forEach((dot) => {
  dot.addEventListener("click", function () {
    const stepNumber = dot.getAttribute("data-step");

    const targetStep = document.querySelector(
      `.step[data-step="${stepNumber}"]`
    );

    window.scrollTo({
      top: targetStep.offsetTop - 100,
      behavior: "smooth",
    });
  });
});

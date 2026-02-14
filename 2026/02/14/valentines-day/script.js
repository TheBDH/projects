var timelineStep = d3.selectAll(".timeline-step");

var scroller = scrollama();
scroller
  .setup({
    step: ".step",
    offset: 0.6,
    debug: false,
  })
  .onStepEnter((response) => {
    handleStepEnter(response);
  });

const chocolates = document.querySelectorAll(".chocolate");
const stories = document.querySelectorAll(".story");
const box = document.querySelector(".box-wrapper");
const lid = document.querySelector(".box-lid");

function handleStepEnter(response) {
  const stepIndex = response.index;

  if (stepIndex > 0) {
    lid.classList.add("open");
  } else {
    lid.classList.remove("open");
  }
  if (stepIndex === 7) {
    chocolates.forEach((chocolate, i) => {
      chocolate.classList.add("active");
      chocolate.addEventListener("click", handleChocolateClick);
    });
  } else {
    chocolates.forEach((chocolate, i) => {
      chocolate.removeEventListener("click", handleChocolateClick);
      if (i + 1 === stepIndex) {
        chocolate.classList.add("active");
      } else {
        chocolate.classList.remove("active");
      }
    });
  }
}

function handleChocolateClick(event) {
  const chocolate = event.currentTarget;
  const targetId = chocolate.dataset.target;
  const targetStep = document.querySelector(
    `.step[data-step="${targetId.split("-")[1]}"]`,
  );
  targetStep.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function typeText(element, speed = 40) {
  const fullText = element.textContent || element.innerText;
  element.textContent = "";

  let i = 0;

  function typeChar() {
    if (i < fullText.length) {
      element.textContent += fullText[i];
      i++;
      setTimeout(typeChar, speed);
    }
  }

  typeChar();
}

const typingElement = document.getElementById("platonic");
typeText(typingElement, 100);

const backToTopButton = document.getElementById("back-to-top");
backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

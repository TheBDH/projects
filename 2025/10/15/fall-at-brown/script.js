const heading = document.getElementById("heading");
const bgVideo = document.getElementById("bg-video");
const fwImages = document.querySelectorAll(".fw-image");
const fwImages2 = document.querySelectorAll(".fw-image-2");
const horizontalGallery = document.querySelector(".gallery-fullwidth");
const rowImages = document.querySelectorAll(".image-row img");
const creditDiv = document.getElementById("current-credit");

const scroller = scrollama();

const colorBlocks = [
  document.getElementById("block1"),
  document.getElementById("block2"),
  document.getElementById("block3"),
  document.getElementById("block4"),
  document.getElementById("block5"),
  document.getElementById("block6"),
];

const allCredits = [
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Max Robinson",
  "Photo credit: Phoebe Grace Aseoche",
  "Photo credit: Sidney Lin",
  "Photo credit: Bomi Okimoto",
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Bomi Okimoto",
  "Photo credit: Horatio Hamilton",
  "Photo credit: Horatio Hamilton",
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Marat Basaria",
  "Photo credit: Max Robinson",
  "Photo credit: Bomi Okimoto",
  "Photo credit: Selina Kao",
  "Photo credit: Max Robinson",
  "Photo credit: Sidney Lin",
  "Photo credit: Sidney Lin",
  "Photo credit: Sidney Lin",
  "Photo credit: Bomi Okimoto",
  "Photo credit: Dolma Arow",
  "Photo credit: Ella Le",
  "Photo credit: Horatio Hamilton",
  "Photo credit: Horatio Hamilton",
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Kenna Lee",
  "Photo credit: Marat Basaria",
  "Photo credit: Max Robinson",
  "Photo credit: Phoebe Grace Aseoche",
  "Photo credit: Selina Kao",
  "Photo credit: Sidney Lin",
  "Photo credit: Kaia Yalamanchili",
  "Photo credit: Max Robinson",
  "Photo credit: Sidney Lin",
];

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

scroller
  .setup({
    step: ".step",
    offset: 0.6,
  })
  .onStepEnter((response) => {
    const stepIndex = parseInt(response.element.dataset.step);

    if (stepIndex >= -1 && stepIndex < 0) {
      heading.style.opacity = 1;
      bgVideo.style.opacity = 1;
    } else if (stepIndex < -1 || stepIndex == 0) {
      heading.style.opacity = 0;
      bgVideo.style.opacity = 1;
    } else {
      heading.style.opacity = 0;
      bgVideo.style.opacity = 0;
    }

    if (stepIndex >= 4 && stepIndex <= 8) {
      fwImages.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 4);
      });
    }

    if (stepIndex >= 14 && stepIndex <= 20) {
      const blockIndex = stepIndex - 14;
      colorBlocks.forEach((block, idx) => {
        if (idx === blockIndex) {
          block.style.opacity = 1;
        } else {
          block.style.opacity = 0;
        }
      });
    }

    if (stepIndex >= 21 && stepIndex <= 25) {
      fwImages2.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 21);
      });
    }

    d3.selectAll(".gallery img:not(.fw-image)").classed("active", false);
    const img = d3.select(response.element).select("img");
    if (!img.empty()) img.classed("active", true);

    const credit = allCredits[stepIndex] || "";
    creditDiv.textContent = credit;
  });

const progressBar = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  progressBar.style.width = `${scrollPercent}%`;
});

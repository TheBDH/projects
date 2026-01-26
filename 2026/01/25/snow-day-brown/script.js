const heading = document.getElementById("heading");
const bgVideo = document.getElementById("bg-video");
const fwImages = document.querySelectorAll(".fw-image");
const fwImages2 = document.querySelectorAll(".fw-image-2");
const horizontalGallery = document.querySelector(".gallery-fullwidth");
const rowImages = document.querySelectorAll(".image-row img");
const creditDiv = document.getElementById("current-credit");

const scroller = scrollama();

const allImages = [
  "assets/1.jpg",
  "assets/2.jpg",
  "assets/3.jpg",
  "assets/4.jpg",
  "assets/5.jpg",
  "assets/6.jpg",
  "assets/7.jpg",
  "assets/8.jpg",
  "assets/9.jpg",
  "assets/10.jpg",
  "assets/11.jpg",
  "assets/12.jpg",
  "assets/13.jpg",
  "assets/14.jpg",
  "assets/15.jpg",
  "assets/16.jpg",
  "assets/17.jpg",
  "assets/18.jpg",
  "assets/19.jpg",
  "assets/20.jpg",
  "assets/21.jpg",
  "assets/22.jpg",
  "assets/23.jpg",
  "assets/24.jpg",
  "assets/25.jpg",
  "assets/26.jpg",
  "assets/27.jpg",
  "assets/28.jpg",
  "assets/29.jpg",
  "assets/30.jpg",
  "assets/31.jpg",
  "assets/32.jpg",
  "assets/33.jpg",
  "assets/34.jpg",
  "assets/35.jpg",
  "assets/36.jpg",
  "assets/37.jpg",
  "assets/38.jpg",
  "assets/39.jpg",
  "assets/40.jpg",
  "assets/41.jpg",
];

allImages.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const colorBlocks1 = [
  document.getElementById("block1"),
  document.getElementById("block2"),
  document.getElementById("block3"),
  document.getElementById("block4"),
  document.getElementById("block5"),
  document.getElementById("block6"),
];

const colorBlocks2 = [
  document.getElementById("block7"),
  document.getElementById("block8"),
  document.getElementById("block9"),
  document.getElementById("block10"),
  document.getElementById("block11"),
  document.getElementById("block12"),
]

const allCredits = [
  "Media by Annamaria Luecht | The Brown Daily Herald",
  "Media by Annamaria Luecht | The Brown Daily Herald",
  "Media by Annamaria Luecht | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Jake Parker | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Henry Wang | The Brown Daily Herald",
  "Media by Henry Wang | The Brown Daily Herald",
  "Media by Henry Wang | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Ina Ma | The Brown Daily Heralda Kao",
  "Media by Ina Ma | The Brown Daily Heralda Kao",
  "Media by Ina Ma | The Brown Daily Heralda Kao",
  "Media by Jake Parker | The Brown Daily Herald",
  "Media by Jake Parker | The Brown Daily Herald",
  "Media by Jake Parker | The Brown Daily Herald",
  "Media by Jake Parker | The Brown Daily Herald",
  "",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kenna Lee | The Brown Daily Herald",
  "Media by Selina Kao | The Brown Daily Herald",
  "Media by Selina Kao | The Brown Daily Herald",
  "Media by Selina Kao | The Brown Daily Herald",
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

    if (stepIndex >= 10 && stepIndex <= 15) {
      fwImages.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 10);
      });
    }

    if (stepIndex >= 21 && stepIndex <= 27) {
      const blockIndex = stepIndex - 21;
      colorBlocks1.forEach((block, idx) => {
        if (idx === blockIndex) {
          block.style.opacity = 1;
        } else {
          block.style.opacity = 0;
        }
      });
    }

    if (stepIndex >= 28 && stepIndex <= 37) {
      fwImages2.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 28);
      });
    }

    if (stepIndex >= 39 && stepIndex <= 44) {
      const blockIndex = stepIndex - 39;
      colorBlocks2.forEach((block, idx) => {
        if (idx === blockIndex) {
          block.style.opacity = 1;
        } else {
          block.style.opacity = 0;
        }
      });
    }

    d3.selectAll(".gallery img:not(.fw-image)").classed("active", false);
    const img = d3.select(response.element).select("img");
    if (!img.empty()) img.classed("active", true);

    const credit = allCredits[stepIndex + 2] || "";
    creditDiv.textContent = credit;
  });

const progressBar = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  progressBar.style.width = `${scrollPercent}%`;
});

document.body.style.overflow = "hidden";

window.addEventListener("load", () => {
  document.body.style.overflow = "auto";
});

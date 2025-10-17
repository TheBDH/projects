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
];

allImages.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const colorBlocks = [
  document.getElementById("block1"),
  document.getElementById("block2"),
  document.getElementById("block3"),
  document.getElementById("block4"),
  document.getElementById("block5"),
  document.getElementById("block6"),
];

const allCredits = [
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Phoebe Grace Aseoche | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Marat Basaria | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by SeLin | The Brown Daily Heralda Kao",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Kenna Lee | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Bomi Okimoto | The Brown Daily Herald",
  "Media by Dolma Arow | The Brown Daily Herald",
  "",
  "Media by Ella Le | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Horatio Hamilton | The Brown Daily Herald",
  "Media by Kaia Yalamanchili | The Brown Daily Herald",
  "Media by Sidney Lin | The Brown Daily Herald",
  "Media by Marat Basaria | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
  "Media by Phoebe Grace Aseoche | The Brown Daily Herald",
  "Media by SeLin | The Brown Daily Heralda Kao",
  "Media by Alayna Chen | The Brown Daily Herald",
  "Media by Max Robinson | The Brown Daily Herald",
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

    if (stepIndex >= 7 && stepIndex <= 14) {
      fwImages.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 7);
      });
    }

    if (stepIndex >= 20 && stepIndex <= 26) {
      const blockIndex = stepIndex - 20;
      colorBlocks.forEach((block, idx) => {
        if (idx === blockIndex) {
          block.style.opacity = 1;
        } else {
          block.style.opacity = 0;
        }
      });
    }

    if (stepIndex >= 27 && stepIndex <= 37) {
      fwImages2.forEach((img, idx) => {
        img.classList.toggle("active", idx === stepIndex - 27);
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

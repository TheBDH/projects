var links = {
  1: [
    {
      title:
        "Nov. 7, 2024 | Brown students react to Trump victory with dread, fear and self-reflection",
      sumdek:
        "A majority of students The Herald spoke to described a community grappling with shock and seeking a path forward.",
      link: "https://www.browndailyherald.com/article/2024/11/brown-students-react-to-trump-victory-with-dread-fear-and-self-reflection",
    },
    {
      title: "Nov. 9, 2016 | Brown community shaken by Trump win",
      sumdek:
        "Crying students flood streets after viewing parties, tension felt across campus in wake of win",
      link: "https://www.browndailyherald.com/article/2016/11/brown-community-shaken-by-trump-win",
    },
    {
      title: "Nov. 17, 2016 | Students, faculty protest in light of election",
      sumdek:
        "Protesters demand U. serve as sanctuary, increase funding for marginalized individuals",
      link: "https://www.browndailyherald.com/article/2016/11/students-faculty-protest-in-light-of-election",
    },
  ],
  2: [
    {
      title:
        "Feb. 27, 2017 | BPAC promotes progressive causes at grassroots level",
      sumdek:
        "Political action committee formed after election seeks to engage in community activism off College Hill",
      link: "https://www.browndailyherald.com/article/2017/02/bpac-promotes-progressive-causes-at-grassroots-level",
    },
  ],
  3: [
    {
      title:
        "Apr. 3, 2025 | Live updates: Trump administration set to freeze $510 million of Brown’s federal funding",
      sumdek:
        "Brown will become the fifth Ivy League institution to have its federal funding frozen or cut.",
      link: "https://www.browndailyherald.com/article/2025/04/trump-administration-set-to-freeze-510-million-of-browns-federal-funding-nyt-reports",
    },
    {
      title:
        "Jul. 30, 2025 | Brown reaches deal with federal government to restore federal research funding",
      sumdek:
        "The agreement does not include any form of payment to the federal government but requires Brown to acquiesce to several Trump administration demands.",
      link: "https://www.browndailyherald.com/article/2025/07/brown-reaches-deal-with-federal-government-to-restore-research-funding",
    },
    {
      title:
        "Oct. 1, 2025 | Trump admin asks Brown to freeze tuition, cap international enrollment for funding advantage, WSJ reports",
      sumdek:
        "Other requirements include banning the use of race and sex in admissions and hiring practices.",
      link: "https://www.browndailyherald.com/article/2025/10/trump-admin-asks-brown-to-freeze-tuition-cap-international-enrollment-for-funding-advantage-wsj-reports",
    },
    {
      title:
        "Oct. 9, 2025 | Over 100 Brown students, faculty rally against Trump administration compact",
      sumdek:
        "A small group of students, faculty and graduate students delivered a statement, arguing against the compact, to Paxson’s office in University Hall.",
      link: "https://www.browndailyherald.com/article/2025/10/over-100-brown-students-faculty-rally-against-trump-administration-compact",
    },
    {
      title:
        "Apr. 20, 2025 | Students protest federal attacks on colleges, urge Brown not to comply with Trump demands",
      sumdek:
        "Organized by the newly formed student group Do Not Comply, the rally took place on the Main Green on Friday.",
      link: "https://www.browndailyherald.com/article/2025/04/students-protest-federal-attacks-on-colleges-urge-brown-not-to-comply-with-trump-demands",
    },
  ],
  4: [
    {
      title:
        "Sep. 25, 2025 | Individual detained by masked federal agents on College Hill",
      sumdek:
        "The incident occurred just one day after Mayor Brett Smiley signed an executive order reaffirming that the PPD would not cooperate with ICE.",
      link: "https://www.browndailyherald.com/article/2025/09/individual-detained-by-masked-federal-agents-on-college-hill",
    },
    {
      title:
        "Sep. 10, 2025 | Student activist leaders voice opposition to Brown’s deal with Trump admin",
      sumdek:
        "Some student activists are reluctant to take action, citing concerns of how the agreement will be enforced.",
      link: "https://www.browndailyherald.com/article/2025/09/student-activist-leaders-voice-opposition-to-browns-deal-with-trump-admin",
    },
  ],
};

var bgImages = {
  "-1": {
    photo: "url('assets/bg/0a.jpg')",
    credit: "Media by Max Robinson | The Brown Daily Herald",
  },
  0: {
    photo: "url('assets/bg/0b.jpeg')",
    credit: "Media by Max Robinson | The Brown Daily Herald",
  },
  1: {
    photo: "url('assets/bg/1.jpg')",
    credit: "Media by Huayu Ouyang | The Brown Daily Herald",
  },
  2: {
    photo: "url('assets/bg/2.jpg')",
    credit: "Media by Tiffany Ding | The Brown Daily Herald",
  },
  3: {
    photo: "url('assets/bg/3.jpg')",
    credit: "Media by Kaia Yalamanchili | The Brown Daily Herald",
  },
  4: {
    photo: "url('assets/bg/4.jpg')",
    credit: "Media by Max Robinson | The Brown Daily Herald",
  },
};

var popUpDiv = document.getElementById("pop-up-container");
var shownPopups = new Set();
var bgDiv = document.querySelector(".bg");

function createPopUp(article, key) {
  if (shownPopups.has(key)) return;

  const anchor = document.createElement("a");
  anchor.className = "pop-up";
  anchor.href = article.link;
  anchor.target = "_blank";
  anchor.style.opacity = 0;
  anchor.dataset.key = key;
  anchor.style.transform = "translateY(6px)";
  anchor.style.transition = "opacity 0.6s ease, transform 0.6s ease";

  const content = document.createElement("div");
  content.className = "pop-up-content";

  content.innerHTML = `
    <p><b>${article.title}</b><br/>
    <i>${article.sumdek}</i></p>
  `;

  anchor.appendChild(content);
  popUpDiv.appendChild(anchor);
  shownPopups.add(key);

  requestAnimationFrame(() => {
    anchor.style.opacity = 1;
    anchor.style.transform = "translateY(0)";
  });

  return anchor;
}

function fadeOutAndRemoveNode(node, key) {
  if (!node) return;

  node.style.opacity = 0;
  node.style.transform = "translateY(6px)";
  setTimeout(() => {
    if (node.parentNode) node.parentNode.removeChild(node);
    shownPopups.delete(key);
  }, 600);
}

var scroller = scrollama();
scroller
  .setup({
    step: ".step",
    offset: 0.6,
    debug: false,
    progress: true,
  })
  .onStepEnter((response) => {
    const stepIndex = response.element && response.element.dataset.step;

    popUpDiv.innerHTML = "";
    shownPopups.clear();

    if (bgDiv && bgImages[stepIndex]) {
      bgDiv.style.backgroundImage = bgImages[stepIndex].photo;
      document.querySelector(".bg-credit").innerHTML =
        bgImages[stepIndex].credit;
    }
  })
  .onStepProgress((response) => {
    const stepIndex = response.element && response.element.dataset.step;
    const progress = response.progress;

    if (links[stepIndex]) {
      const articles = links[stepIndex];
      const revealCount = Math.ceil(progress * articles.length) - 0.0001;

      for (let i = 0; i < articles.length; i++) {
        const key = `${stepIndex}-${i}`;
        if (i < revealCount) {
          createPopUp(articles[i], key);
        } else {
          const existing = popUpDiv.querySelector(`[data-key="${key}"]`);
          if (existing) fadeOutAndRemoveNode(existing, key);
        }
      }
    }
  })

  .onStepExit((response) => {
    const stepAttr =
      response.element &&
      response.element.dataset &&
      response.element.dataset.step;
    const stepKey =
      typeof stepAttr !== "undefined" ? stepAttr : String(response.index + 1);
    const nodes = Array.from(
      popUpDiv.querySelectorAll(`[data-key^="${stepKey}-"]`)
    );
    nodes.forEach((n) => fadeOutAndRemoveNode(n, n.dataset.key));
  });

window.addEventListener("resize", scroller.resize());
window.addEventListener("load", function () {
  setTimeout(() => scroller.resize(), 100);
});

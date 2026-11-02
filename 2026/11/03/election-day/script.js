// polls close at 8 p.m. Eastern on election day
const POLLS_CLOSE = new Date("2026-11-03T20:00:00-05:00");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ---------- countdown ----------

const countdownTime = document.getElementById("countdown-time");
const countdownLabel = document.getElementById("countdown-label");

function updateCountdown() {
  const ms = POLLS_CLOSE - Date.now();
  if (ms <= 0) {
    countdownTime.textContent = "Polls are closed";
    countdownLabel.textContent = "as of 8 p.m. Nov. 3";
    return false;
  }
  // round up so the clock never reads 0 hr 00 mins 00 secs while polls are still open
  const totalSecs = Math.ceil(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, "0");
  countdownTime.textContent =
    `${hrs} hr ${pad(mins)} ${mins === 1 ? "min" : "mins"} ` +
    `${pad(secs)} ${secs === 1 ? "sec" : "secs"}`;
  return true;
}

if (updateCountdown()) {
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}

// ---------- section tabs ----------
// Each tab is its own page, so the bar's horizontal scroll would reset on every
// switch. Remember where it was and restore it so the bar looks unchanged.

const tabs = document.querySelector(".tabs");
const TABS_KEY = "tabs-scroll";

if (tabs) {
  let saved = null;
  try {
    saved = sessionStorage.getItem(TABS_KEY);
  } catch {}

  if (saved !== null) {
    tabs.scrollLeft = Number(saved);
  }

  // make sure the current tab isn't hidden off the edge or under the pinned
  // Live Updates tab (e.g. first visit, or arriving from a direct link)
  const current = tabs.querySelector('[aria-current="page"]');
  const pinned = tabs.querySelector("a:first-child");
  if (current && current !== pinned) {
    const bar = tabs.getBoundingClientRect();
    const box = current.getBoundingClientRect();
    const leftEdge = pinned.getBoundingClientRect().right + 24; // past the fade
    if (box.left < leftEdge) {
      tabs.scrollLeft -= leftEdge - box.left;
    } else if (box.right > bar.right) {
      tabs.scrollLeft += box.right - bar.right + 20; // 20px ≈ the bar's side padding
    }
  }

  const save = () => {
    try {
      sessionStorage.setItem(TABS_KEY, String(tabs.scrollLeft));
    } catch {}
  };
  tabs.addEventListener("click", save);
  window.addEventListener("pagehide", save);
}

// ---------- menu ----------

const menuButton = document.getElementById("menu-button");
const menuList = document.getElementById("menu-list");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", open);
  menuList.hidden = !open;
}

menuButton.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(menuList.hidden);
});
document.addEventListener("click", (e) => {
  if (!menuList.contains(e.target)) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// ---------- polling locations ----------

// tag an update with data-location="<id>" to file it from one of these. x/y
// are positions on the road map: d3.geoMercator coordinates from the 2022
// property story's projection (bounds -71.44..-71.34, 41.812..41.850, width 600)
const LOCATIONS = [
  { id: "hope-high", name: "Hope High School", address: "324 Hope St.", x: 257.8, y: 97.39 },
  { id: "city-hall", name: "City Hall", address: "25 Dorrance St.", x: 228.04, y: 143.37 },
  {
    id: "doorley",
    name: "Joseph A. Doorley Municipal Building / St. Elizabeth’s Place",
    short: "Doorley Building",
    address: "444 Westminster St.",
    x: 220.05,
    y: 157.92,
  },
  {
    id: "gregorian",
    name: "Vartan Gregorian Elementary School",
    short: "Vartan Gregorian",
    address: "455 Wickenden St.",
    x: 289.05,
    y: 161.96,
    labelLeft: true, // near the map's right edge
  },
  { id: "elmwood", name: "Elmwood Community Center", address: "155 Niagara St.", x: 209.48, y: 250.13 },
];
const locationById = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

// small pin before the location name on each tagged card
function addLocationTag(row) {
  const loc = locationById[row.dataset.location];
  if (!loc || row.querySelector(".update-location")) return;
  const tag = document.createElement("a");
  tag.className = "update-location";
  tag.href = `polling-locations.html#${loc.id}`;
  tag.textContent = loc.short || loc.name;
  row.querySelector(".update-headline").before(tag);
}

// ---------- timeline ----------

// the line draws down to a "pen" halfway down the screen, where each dot
// sticks. near the bottom of the page the pen can't reach the end of the
// line, so it finishes drawing exactly when you hit the end of the scroll.
// onReach gets the furthest update the line has reached (or null)
function initTimeline(container, { onReach } = {}) {
  const rows = [...container.querySelectorAll(".update")];

  rows.forEach((row) => {
    // the time is written once beside the dot and copied into each card
    row.querySelector(".update-time").textContent = row.querySelector(".update-marker time").textContent;
    addLocationTag(row);
  });

  let lastReached;
  function draw() {
    const pen = window.innerHeight * 0.5;
    const { top, height } = container.getBoundingClientRect();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const furthestPen = maxScroll - window.scrollY + pen - top;
    const progress = reduceMotion ? 1 : clamp01((pen - top) / Math.min(height, furthestPen));
    container.style.setProperty("--progress", progress.toFixed(4));

    const tip = progress * height;
    let furthest = null;
    rows.forEach((row) => {
      if (row.hidden) return;
      const dot = row.querySelector(".dot").getBoundingClientRect();
      const reached = reduceMotion || dot.top + dot.height / 2 - top <= tip + 1;
      row.classList.toggle("reached", reached);
      if (reached) furthest = row;
    });
    if (onReach && furthest !== lastReached) onReach((lastReached = furthest));
  }

  let ticking = false;
  const requestDraw = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      draw();
      ticking = false;
    });
  };
  draw();
  window.addEventListener("scroll", requestDraw, { passive: true });
  window.addEventListener("resize", requestDraw);
  window.addEventListener("load", requestDraw);

  if (!reduceMotion) {
    document.documentElement.classList.add("animate");

    // cards rise in as they come on screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    rows.forEach((row) => observer.observe(row));
  }

  return { rows, redraw: requestDraw };
}

// ---------- breaking news ----------

// the newest update (first in the list) fills the breaking news bar. the
// section pages don't have the updates, so they read them from index.html
function showBreaking(doc) {
  const latest = doc.querySelector("#live-updates .update");
  if (!latest) return;
  const time = latest.querySelector(".update-marker time").textContent.trim();
  const headline = latest.querySelector(".update-headline").textContent.trim();
  document.getElementById("breaking-time").textContent = `at ${time}`;
  document.getElementById("breaking-text").textContent = headline;
  document.getElementById("breaking").hidden = false;
}

const liveUpdates = document.getElementById("live-updates");

const liveDoc = liveUpdates
  ? Promise.resolve(document)
  : fetch("index.html")
      .then((res) => res.text())
      .then((html) => new DOMParser().parseFromString(html, "text/html"));

liveDoc.then(showBreaking).catch(() => {});

if (liveUpdates) initTimeline(liveUpdates);

// ---------- polling locations page ----------

const pollingUpdates = document.getElementById("polling-updates");

if (pollingUpdates) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const markers = document.getElementById("map-markers");
  const filter = document.getElementById("location-filter");
  const empty = document.getElementById("updates-empty");

  // map markers: click one to show only its updates, click again for all
  const markerById = {};
  LOCATIONS.forEach((loc) => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "map-marker");
    g.setAttribute("transform", `translate(${loc.x} ${loc.y})`);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `${loc.name}, ${loc.address}`);
    g.innerHTML = `<circle class="marker-halo" r="4.5"></circle><circle class="marker-dot" r="2.2"></circle>
      <text x="${loc.labelLeft ? -4 : 4}" y="1.2"${loc.labelLeft ? ' text-anchor="end"' : ""}>${loc.short || loc.name}</text>`;
    g.addEventListener("click", () => select(location.hash === `#${loc.id}` ? "" : loc.id));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        g.dispatchEvent(new Event("click"));
      }
    });
    markers.append(g);
    markerById[loc.id] = g;
  });

  // filter buttons: all polling locations, then one per location
  const buttons = [{ id: "", name: "All polling locations" }, ...LOCATIONS].map((loc) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.location = loc.id;
    button.textContent = loc.short || loc.name;
    button.addEventListener("click", () => select(loc.id));
    filter.append(button);
    return button;
  });

  let timeline;

  function select(id) {
    if (!locationById[id]) id = "";
    history.replaceState(null, "", id ? `#${id}` : location.pathname);
    buttons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.location === id));
    Object.entries(markerById).forEach(([locId, g]) => {
      g.classList.toggle("selected", locId === id);
      g.classList.toggle("dimmed", Boolean(id) && locId !== id);
    });
    if (!timeline) return;
    let shown = 0;
    timeline.rows.forEach((row) => {
      row.hidden = Boolean(id) && row.dataset.location !== id;
      if (!row.hidden) shown++;
    });
    empty.hidden = shown > 0;
    pollingUpdates.classList.toggle("is-empty", shown === 0);
    timeline.redraw();
  }

  select(location.hash.slice(1));
  window.addEventListener("hashchange", () => select(location.hash.slice(1)));

  // every tagged live update, oldest first
  liveDoc
    .then((doc) => {
      const tagged = [...doc.querySelectorAll("#live-updates .update[data-location]")]
        .filter((row) => locationById[row.dataset.location])
        .sort((a, b) => new Date(a.querySelector("time").dateTime) - new Date(b.querySelector("time").dateTime));
      tagged.forEach((row) => pollingUpdates.append(document.importNode(row, true)));

      timeline = initTimeline(pollingUpdates, {
        // the marker for the update the line has reached lights up on the map
        onReach: (row) => {
          Object.entries(markerById).forEach(([locId, g]) =>
            g.classList.toggle("current", Boolean(row) && row.dataset.location === locId)
          );
        },
      });
      select(location.hash.slice(1));
    })
    .catch(() => {
      empty.hidden = false;
    });
}

// ---------- ballot sliders ----------

// each .slider shows one .slide at a time, with a tab per slide along the
// bottom, arrows, swipe and arrow keys. "See all" lays every slide out at once
document.querySelectorAll(".slider").forEach((slider, sliderIndex) => {
  const slides = [...slider.querySelectorAll(".slide")];
  if (!slides.length) return;
  const slidesBox = slider.querySelector(".slides");

  const controls = document.createElement("div");
  controls.className = "slider-controls";

  const arrow = (dir, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `slider-arrow slider-${dir}`;
    button.setAttribute("aria-label", label);
    button.innerHTML = dir === "prev" ? "&larr;" : "&rarr;";
    return button;
  };
  const prev = arrow("prev", "Previous");
  const next = arrow("next", "Next");

  const tablist = document.createElement("div");
  tablist.className = "slider-tabs";
  tablist.setAttribute("role", "tablist");

  const tabs = slides.map((slide, i) => {
    const id = `slider${sliderIndex}-slide${i}`;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = `${id}-tab`;
    tab.className = "slider-tab";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", id);
    tab.setAttribute("aria-label", slide.querySelector("h3").textContent.trim());
    tab.innerHTML = `<span>${i + 1}</span>`;
    tab.addEventListener("click", () => show(i));
    slide.id = id;
    slide.setAttribute("role", "tabpanel");
    slide.setAttribute("aria-labelledby", tab.id);
    tablist.append(tab);
    return tab;
  });

  controls.append(prev, tablist, next);
  slidesBox.after(controls);

  const expand = document.createElement("button");
  expand.type = "button";
  expand.className = "slider-expand";
  expand.setAttribute("aria-expanded", "false");
  controls.after(expand);

  let current = 0;

  function show(i, focus = false) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((slide, j) => {
      slide.classList.toggle("active", j === current);
      // slides before the current one sit off to the left, so moving
      // forward slides in from the right and back from the left
      slide.classList.toggle("before", j < current);
    });
    tabs.forEach((tab, j) => {
      tab.setAttribute("aria-selected", j === current);
      tab.tabIndex = j === current ? 0 : -1;
    });
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    if (focus) tabs[current].focus();
  }

  function setExpanded(open, scroll = false) {
    // switching layouts happens instantly; only moving between tabs animates,
    // otherwise the hidden slides linger on top of each other while fading
    slider.classList.remove("animated");
    requestAnimationFrame(() => requestAnimationFrame(() => slider.classList.add("animated")));
    slider.classList.toggle("expanded", open);
    expand.setAttribute("aria-expanded", open);
    expand.textContent = open ? "Show one at a time" : `See all ${slides.length} questions`;
    slides.forEach((slide) => slide.setAttribute("role", open ? "article" : "tabpanel"));
    // collapsing a long list can leave the reader far below the slider
    if (scroll && !open && slider.getBoundingClientRect().top < 0) {
      slider.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  prev.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  expand.addEventListener("click", () => setExpanded(!slider.classList.contains("expanded"), true));

  tablist.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step) show(current + step, true);
    else if (e.key === "Home") show(0, true);
    else if (e.key === "End") show(slides.length - 1, true);
    else return;
    e.preventDefault();
  });

  // swipe between slides on touch screens
  let startX = null;
  slidesBox.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") startX = e.clientX;
  });
  slidesBox.addEventListener("pointerup", (e) => {
    if (startX === null || slider.classList.contains("expanded")) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
  slidesBox.addEventListener("pointercancel", () => (startX = null));

  slider.classList.add("ready");
  show(0);
  setExpanded(false);
});

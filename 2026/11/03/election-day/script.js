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
// Each tab is its own page, so the bar's horizontal scroll and the page's
// vertical scroll would both reset on every switch. Remember where the bar was
// and restore both so it stays put on screen while the content below changes.

const tabs = document.querySelector(".tabs");
const TABS_KEY = "tabs-scroll";
const TABS_TOP_KEY = "tabs-top";
const TABS_FROM_KEY = "tabs-from";

if (tabs) {
  // phones: the tabs fold into a dropdown under a button naming this page.
  // The links go in a wrapper that's invisible to the layout on wider screens
  // (display: contents), so the desktop bar is unchanged
  const menu = document.createElement("div");
  menu.className = "tabs-menu";
  menu.id = "tabs-menu";
  menu.append(...tabs.querySelectorAll(":scope > a"));

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "tabs-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", menu.id);
  const label = document.createElement("span");
  // names the page you're on; falls back to the first tab (the home page)
  label.textContent = (menu.querySelector('[aria-current="page"]') || menu.querySelector("a"))?.textContent.trim() ?? "";
  const chevron = document.createElement("span");
  chevron.className = "tabs-chevron";
  chevron.setAttribute("aria-hidden", "true");
  toggle.append(label, chevron);

  tabs.append(toggle, menu);
  tabs.classList.add("has-toggle");

  const setOpen = (open) => {
    tabs.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(!tabs.classList.contains("open")));
  // close on a tap outside the menu, or Escape
  document.addEventListener("click", (e) => {
    if (!tabs.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tabs.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  // closed again when coming back to this page with the back button
  window.addEventListener("pageshow", () => setOpen(false));

  // the bar is pinned to the top on scroll; share its height with the CSS so
  // anchors and the sticky map sit below it
  const setTabsHeight = () =>
    document.documentElement.style.setProperty("--tabs-height", `${tabs.offsetHeight}px`);
  setTabsHeight();
  new ResizeObserver(setTabsHeight).observe(tabs);

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

  // put the bar back at the same height on screen it had on the last page.
  // Only after clicking a link to another page of this site (the key is used
  // up here), so reloads, back/forward and outside links keep normal scrolling
  let savedTop = null;
  try {
    savedTop = sessionStorage.getItem(TABS_TOP_KEY);
    sessionStorage.removeItem(TABS_TOP_KEY);
  } catch {}

  if (savedTop !== null && !location.hash) {
    const targetTop = Math.max(0, Number(savedTop) || 0);
    const place = () =>
      window.scrollTo({
        top: Math.ceil(tabs.getBoundingClientRect().top + window.scrollY - targetTop),
        behavior: "instant",
      });
    place();
    // Fonts, bylines and asynchronous page content can settle after load.
    // Follow those layout changes until the reader takes control; browser
    // scroll anchoring alone is not evidence that the reader has scrolled.
    const restoration = new AbortController();
    const layout = new ResizeObserver(place);
    for (const element of document.querySelectorAll('.topbar, .hero, main')) layout.observe(element);
    const release = () => { layout.disconnect(); restoration.abort(); };
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(event, release, { passive: true, signal: restoration.signal });
    }
    window.addEventListener('load', place, { once: true, signal: restoration.signal });
    window.addEventListener('pagehide', release, { once: true, signal: restoration.signal });
    window.addEventListener('hashchange', release, { once: true, signal: restoration.signal });
  }

  // underline: one bar that slides from the tab you came from to this one
  const indicator = document.createElement("span");
  indicator.className = "tabs-indicator";
  indicator.setAttribute("aria-hidden", "true");
  tabs.append(indicator);
  tabs.classList.add("has-indicator");

  const moveIndicator = (link) => {
    if (!link) {
      indicator.style.opacity = "0";
      return;
    }
    const bar = tabs.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    indicator.style.opacity = "1";
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translateX(${box.left - bar.left + tabs.scrollLeft}px)`;
  };

  let from = null;
  try {
    from = sessionStorage.getItem(TABS_FROM_KEY);
    sessionStorage.removeItem(TABS_FROM_KEY);
  } catch {}
  const fromLink = from && [...tabs.querySelectorAll("a")].find((a) => a.getAttribute("href") === from);

  if (fromLink && fromLink !== current && !reduceMotion) {
    // start under the old tab, then slide once that position has painted
    moveIndicator(fromLink);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        indicator.classList.add("animated");
        moveIndicator(current);
      })
    );
  } else {
    moveIndicator(current);
    requestAnimationFrame(() => indicator.classList.add("animated"));
  }

  // keep it under the tab as fonts load, the window resizes, or the pinned
  // Live Updates tab moves while the bar scrolls sideways
  const follow = () => {
    indicator.classList.remove("animated");
    moveIndicator(current);
    requestAnimationFrame(() => indicator.classList.add("animated"));
  };
  window.addEventListener("resize", follow);
  window.addEventListener("load", follow);
  document.fonts?.ready.then(follow);
  if (current === pinned) tabs.addEventListener("scroll", follow, { passive: true });

  const save = () => {
    try {
      sessionStorage.setItem(TABS_KEY, String(tabs.scrollLeft));
    } catch {}
  };
  tabs.addEventListener("click", save);
  window.addEventListener("pagehide", save);

  // any link to another page of this site (tabs, "Read more", the breaking
  // bar...) carries the bar's position and the tab we're leaving with it
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return;
    const url = new URL(link.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (url.pathname === location.pathname) return;
    try {
      sessionStorage.setItem(TABS_TOP_KEY, String(tabs.getBoundingClientRect().top));
      if (current) sessionStorage.setItem(TABS_FROM_KEY, current.getAttribute("href"));
    } catch {}
  });
}

// ---------- authors ----------

// every writer, written once. Bylines point here by id instead of repeating
// the name, link and photo:
//   update cards and ballot sliders: <div class="update-byline" data-author="michelle-bi"></div>
//   the "Reporting by" line:         <p data-authors="michelle-bi talia-katz">Reporting by</p>
// Several ids (space-separated) work in either. Photos are square-ish images
// in images/authors/; until one is added the gray circle shows instead.
const AUTHORS = {
  "michelle-bi": {
    name: "Michelle Bi",
    page: "https://www.browndailyherald.com/staff/michelle-bi",
    photo: "assets/MichelleBi.png",
  },
  "talia-katz": {
    name: "Talia Katz",
    page: "https://www.browndailyherald.com/staff/talia-katz",
    photo: "assets/TaliaKatz.jpg",
  },
  "nate-barkow": {
    name: "Nate Barkow",
    page: "https://www.browndailyherald.com/staff/nate-barkow",
    photo: "assets/NateBarkow.jpeg",
  },
  "annika-melwani": {
    name: "Annika Melwani",
    page: "https://www.browndailyherald.com/staff/annika-melwani",
    photo: "assets/AnnikaMelwani.jpg",
  },
  "rachel-wicker": {
    name: "Rachel Wicker",
    page: "https://www.browndailyherald.com/staff/rachel-wicker",
    photo: "assets/RachelWicker.JPEG",
  },
  "james-libresco": {
    name: "James Libresco",
    page: "https://www.browndailyherald.com/staff/james-libresco",
    photo: "assets/JamesLibresco.png",
  },
  "selina-kao": {
    name: "Selina Kao",
    page: "https://www.browndailyherald.com/staff/selina-kao",
    photo: "assets/SelinaKao.png",
  },
  "pavani-durbhakula": {
    name: "Pavani Durbhakula",
    page: "https://www.browndailyherald.com/staff/pavani-durbhakula",
    photo: "assets/PavaniDurbhakula.png",
  },
  "nikos-koss": {
    name: "Nikos Koss",
    page: "https://www.browndailyherald.com/by/nikos-koss",
    photo: "",
  },
  "selim-kutlu": {
    name: "Selim Kutlu",
    page: "",
    photo: "",
  },
  "miriam-davison": {
    name: "Miriam Davison",
    page: "https://www.browndailyherald.com/by/miriam-davison",
    photo: "assets/MiramDavison.jpg",
  },
  "amber-marcus-blank": {
    name: "Amber Marcus-Blank",
    page: "https://www.browndailyherald.com/by/amber-marcus-blank",
    photo: "assets/AmberMarcusBlank.png",
  },
  "kaia-yalamanchili": {
    name: "Kaia Yalamanchili",
    page: "https://www.browndailyherald.com/by/kaia-yalamanchili",
    photo: "",
  },
  "anthony-cianflone": {
    name: "Anthony Cianflone",
    page: "https://www.browndailyherald.com/by/anthony-cianflone",
    photo: "",
  },
   "jake-parker": {
    name: "Jake Parker",
    page: "https://www.browndailyherald.com/by/jake-parker",
    photo: "",
  },
   "ian-ritter": {
    name: "Ian Ritter",
    page: "https://www.browndailyherald.com/by/ian-ritter",
    photo: "assets/IanRitter.png",
  },
    "horatio-hamilton": {
    name: "Horatio Hamilton",
    page: "https://www.browndailyherald.com/by/horatio-hamilton",
    photo: "",
  },
    "razanne-shoukfeh": {
    name: "Razanne Shoukeh",
    page: "https://www.browndailyherald.com/by/razanne-shoukfeh",
    photo: "",
  },
    "samantha-birns": {
    name: "Samantha Birns",
    page: "https://www.browndailyherald.com/by/samantha",
    photo: "",
  },
    "bomi-okimoto": {
    name: "Bomi Okimoto",
    page: "https://www.browndailyherald.com/by/bomi-okimoto",
    photo: "",
  },
  "vanson-vu": {
    name: "Vanson Vu",
    page: "https://www.browndailyherald.com/by/vanson-vu",
    photo: "",
  },
  "herald-staff": {
    name: "Herald Staff",
    page: "https://www.browndailyherald.com/by/herald-staff",
    photo: "assets/HeraldLogo.png",
  },
  
};

function authorsFor(ids) {
  return (ids || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => {
      if (!AUTHORS[id]) console.warn(`Unknown author id "${id}" — add it to AUTHORS in script.js`);
      return AUTHORS[id] || { name: id };
    });
}

function authorLink(author) {
  if (!author.page) return document.createTextNode(author.name);
  const a = document.createElement("a");
  a.href = author.page;
  a.target = "_blank";
  a.textContent = author.name;
  return a;
}

// "A", "A & B", "A, B & C"
function authorList(authors) {
  const frag = document.createDocumentFragment();
  authors.forEach((author, i) => {
    if (i > 0) frag.append(i === authors.length - 1 ? " & " : ", ");
    frag.append(authorLink(author));
  });
  return frag;
}

function avatar(author) {
  const blank = () => {
    const span = document.createElement("span");
    span.className = "avatar";
    span.setAttribute("aria-hidden", "true");
    return span;
  };
  if (!author?.photo) return blank();
  const img = document.createElement("img");
  img.className = "avatar";
  img.src = author.photo;
  img.alt = "";
  // photo not uploaded yet: fall back to the gray circle, not a broken image
  img.addEventListener("error", () => img.replaceWith(blank()), { once: true });
  return img;
}

// fills every byline under root. Safe to run more than once
function renderBylines(root) {
  root.querySelectorAll("[data-authors]:not([data-rendered])").forEach((el) => {
    el.append(" ", authorList(authorsFor(el.dataset.authors)));
    el.dataset.rendered = "";
  });

  root.querySelectorAll(".update-byline[data-author]:not([data-rendered])").forEach((el) => {
    const authors = authorsFor(el.dataset.author);
    const photos = document.createElement("span");
    photos.className = "avatars";
    photos.append(...(authors.length ? authors.map(avatar) : [avatar()]));

    const name = document.createElement("p");
    name.className = "author";
    name.append(authors.length ? authorList(authors) : "Author name");

    const text = document.createElement("div");
    text.append(name);
    // live update cards also show their time under the name
    if (el.closest(".update")) {
      const time = document.createElement("p");
      time.className = "update-time";
      text.append(time);
    }

    el.replaceChildren(photos, text);
    el.dataset.rendered = "";
  });
}

renderBylines(document);

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
    short: "Doorley Building / St. Elizabeth’s Place",
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
  // updates without a headline get the tag just above their content
  (row.querySelector(".update-headline") || row.querySelector(".update-content")).before(tag);
}

// ---------- timeline ----------

// the line draws down to a "pen" halfway down the screen, where each dot
// sticks. near the bottom of the page the pen can't reach the end of the
// line, so it finishes drawing exactly when you hit the end of the scroll.
// onReach gets the furthest update the line has reached (or null)
function initTimeline(container, { onReach } = {}) {
  const rows = [...container.querySelectorAll(".update")];

  rows.forEach((row) => {
    // updates copied in from the live page arrive with empty bylines
    renderBylines(row);
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

// the three most recent updates, newest first, shown in the bar at the top of
// every page. Written here (not read from index.html) so the bar works on
// every page without a request. When you post a new update, add it to the top
// and drop the last one.
// placeholders commented out until the first real update is posted; with the
// list empty the bar stays hidden
const BREAKING = [
{time: "8:03 PM", headline: "Polls closed at 8 p.m."},
{ time: "8:32 PM", headline: "Amo, Magaziner re-elected to U.S. House of Representatives" },
{ time: "8:39 AM", headline: "A few minutes before 7 a.m. on Election Day in Providence, Kristen Johnson — warden at the Hope High School polling location — and a team of poll workers prepared to begin the day." },
 { time: "10:34 AM", headline: "At Vartan Gregorian Elementary School, Kimberly Allen, the election moderator of Vartan Gregorian Precinct 2818, said that the precinct has already seen “amazing turnout,” with in-person voter turnout reaching almost 200 in the first two and a half hours." },
 {time: "2:15 PM", headline: "The three candidates for RI governor have all been at the polls today."},
];

// rotates through them every few seconds; pauses while hovered or focused
function initBreaking() {
  const bar = document.getElementById("breaking");
  const items = BREAKING.slice(0, 3);
  if (!bar || !items.length) return;
  const time = document.getElementById("breaking-time");
  const text = document.getElementById("breaking-text");

  let i = 0;
  const show = () => {
    time.textContent = `at ${items[i].time}`;
    text.textContent = items[i].headline;
  };
  show();
  bar.hidden = false;
  if (items.length < 2) return;

  let paused = false;
  ["mouseenter", "focusin"].forEach((ev) => bar.addEventListener(ev, () => (paused = true)));
  ["mouseleave", "focusout"].forEach((ev) => bar.addEventListener(ev, () => (paused = false)));

  setInterval(() => {
    if (paused || document.hidden) return;
    const next = () => {
      i = (i + 1) % items.length;
      show();
      bar.classList.remove("fading");
    };
    if (reduceMotion) return next();
    bar.classList.add("fading");
    setTimeout(next, 300); // matches the fade in styles.css
  }, 6000);
}

initBreaking();

const liveUpdates = document.getElementById("live-updates");

// the polling locations page lists updates from index.html; no other page
// needs to load it
const liveDoc = liveUpdates
  ? Promise.resolve(document)
  : document.getElementById("polling-updates")
    ? fetch("index.html")
        .then((res) => res.text())
        .then((html) => new DOMParser().parseFromString(html, "text/html"))
    : null;

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
// top, swipe and arrow keys. "Expand" lays every slide out at once
document.querySelectorAll(".slider").forEach((slider, sliderIndex) => {
  const slides = [...slider.querySelectorAll(".slide")];
  if (!slides.length) return;
  const slidesBox = slider.querySelector(".slides");

  const controls = document.createElement("div");
  controls.className = "slider-controls";

  const tablist = document.createElement("div");
  tablist.className = "slider-tabs";
  tablist.setAttribute("role", "tablist");

  const tabs = slides.map((slide, i) => {
    const id = slide.id || `slider${sliderIndex}-slide${i}`;
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

  controls.append(tablist);
  slidesBox.before(controls);

  const expand = document.createElement("button");
  expand.type = "button";
  expand.className = "slider-expand";
  expand.setAttribute("aria-expanded", "false");
  slidesBox.after(expand);

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
    if (focus) tabs[current].focus();
  }

  function setExpanded(open, scroll = false) {
    // switching layouts happens instantly; only moving between tabs animates,
    // otherwise the hidden slides linger on top of each other while fading
    slider.classList.remove("animated");
    requestAnimationFrame(() => requestAnimationFrame(() => slider.classList.add("animated")));
    slider.classList.toggle("expanded", open);
    expand.setAttribute("aria-expanded", open);
    expand.textContent = open ? "Collapse" : "Expand";
    slides.forEach((slide) => slide.setAttribute("role", open ? "article" : "tabpanel"));
    // collapsing a long list can leave the reader far below the slider
    if (scroll && !open && slider.getBoundingClientRect().top < (tabs?.offsetHeight || 0)) {
      slider.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

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
  function revealLinkedSlide() {
    const index = slides.findIndex(slide => `#${slide.id}` === location.hash);
    if (index < 0) return;
    show(index);
    // Select the slide before scrolling, including on a fresh page load.
    requestAnimationFrame(() => slider.scrollIntoView({ behavior: "auto", block: "start" }));
  }
  revealLinkedSlide();
  window.addEventListener("hashchange", revealLinkedSlide);
});


const BASIN_LOCATION = [-71.414, 41.8268];
const STEEPLE_LOCATION = [-71.41020259187422, 41.82716608678433];
const CANAL_WALK_LOCATION = [-71.41014535050822, 41.82667256660814];
const WASHINGTON_LOCATION = [-71.40944535050822, 41.82667256660814];
// const WASHINGTON_LOCATION = [-71.40944535050822, 41.82637256660814];
const COLLEGE_LOCATION = [-71.40840993323749, 41.82564977266063];
const CRAWFORD_LOCATION = [-71.40820993323749, 41.82484977266063];
const MAP_LOCATION = [-71.41220993323749, 41.82584977266063];

const FIRE_COORDS = [
  // river pre-basin, in -> out
  [-71.41512816754688, 41.82716050251955],
  [-71.41494725419231, 41.82714687010798],
  [-71.41480496278989, 41.82713020826799],
  [-71.41465250771626, 41.82711506113705],
  [-71.41448582350186, 41.82709991400253],
  [-71.41428661553873, 41.82707870800809],

  // from basin, clockwise
  [-71.41397357445243, 41.8270514431473],
  [-71.41379469383236, 41.82702720770635],
  [-71.41368899164765, 41.826887853741255],
  [-71.41374997367734, 41.826746984750685],
  [-71.41389226507974, 41.82667882222461],
  [-71.41407724390268, 41.82667882222461],
  [-71.41417888061898, 41.82674395530685],
  [-71.41423376444526, 41.82688936846],
  [-71.41415855327539, 41.827004486971845],

  // river post-basin in -> out
  [-71.41357109305721, 41.826740925862396],
  [-71.41341253978017, 41.82678788223163],
  [-71.4132397573635, 41.826846956324175],
  [-71.41305681127446, 41.82691057451717],
  [-71.41291451987203, 41.826952986610394],
  [-71.41277832667362, 41.82700145753972],
  [-71.41262180613106, 41.82705295786218],

  // out of first frame, river in -> out
  [-71.41245715465142, 41.82709385514954],
  [-71.41208922973941, 41.827157473097344],
  [-71.41193474193037, 41.827166561369836],
  [-71.41173146849954, 41.82717413493009],
  [-71.41154648967657, 41.82717262021848],
  [-71.4113696417894, 41.82716807608159],
  [-71.411172466562, 41.827145355397874],
  [-71.41097325859829, 41.82710748757256],
  [-71.41079031251012, 41.827062046152264],

  // around the U
  [-71.41064192290273, 41.8270075164053],
  [-71.41031668541216, 41.82682272080757],
  [-71.41022724510154, 41.82676213197044],
  [-71.41013170658921, 41.826686395844064],
  [-71.41004633174725, 41.826621262703526],
  // [-71.40993249862551, 41.82667124860791],
  // [-71.4098471237844, 41.82671366086012],
  // [-71.40989590940751, 41.826798485279596],
  // [-71.40995689143747, 41.826874221273414],
  // [-71.41002193893526, 41.826945413026124],

  // between washington and college
  [-71.40965026555152, 41.82649116758009],
  [-71.40958928352242, 41.826413916403624],
  [-71.40949577774313, 41.82631848835018],
  [-71.40947693794898, 41.826198818596055],
  [-71.40937584641881, 41.82612611708029],
  [-71.40927274813966, 41.826033701785775],
  [-71.40914751850272, 41.82593297630052],
  [-71.40904994725564, 41.82584209176099],
  [-71.4089518673563, 41.825754340295504],
  [-71.40882583782854, 41.825655881763396],
  [-71.40872623384668, 41.82555742308054],
  [-71.40865428928602, 41.82545288505659],

  // between college and crawford
  [-71.4085590263154, 41.825295302042406],
  [-71.40850210975496, 41.825218049423],
  [-71.4084390949911, 41.8251165605451],
  [-71.40837608022635, 41.82500295340199],
  [-71.40832141427293, 41.82490032258369],
  [-71.40824598673433, 41.82478028240905],
  [-71.40817280829837, 41.8246515269546],
  [-71.40811795135664, 41.82453469701133],
  [-71.40804274018679, 41.824407455840685],
  [-71.40798579674151, 41.82429858420613],
];

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNpbmcxMjIiLCJhIjoiY2x1MXV6Z29lMHFzMTJrcHBsMDgwYzRjeiJ9.XOdMvSBM5o_sG4IwTVhTwA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/asing122/cmidezdpf001701s06jo5fy8g",
  zoom: 18.6,
  center: BASIN_LOCATION,
});

var boatMarker;

map.on("load", () => {
  for (const coord of FIRE_COORDS) {
    const el = document.createElement("div");
    el.className = "marker-fire";
    new mapboxgl.Marker(el).setLngLat(coord).addTo(map);
  }

  const el = document.createElement("div");
  el.className = "marker-boat";

  boatMarker = new mapboxgl.Marker(el)
    .setLngLat([-71.41512816754688, 41.82716050251955])
    .addTo(map);
});

map.scrollZoom.disable();
// map.panRotate.disable();

// map.on("click", (e) => {
//   console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
// });

var main = d3.select("main");
var scroll = main.select(".scroll");
var scrolly = scroll.select(".scrolly");
var article = scrolly.select("article");
var step = article.selectAll(".step");

var scroller = scrollama();

function handleStepEnter(response) {
  const info = response.element.dataset.info;

  switch (info) {
    case "basin":
      map.flyTo({ center: BASIN_LOCATION, zoom: 17.6 });
      break;
    case "steeple-st":
      map.flyTo({ center: STEEPLE_LOCATION, zoom: 18.8 });
      break;
    case "canal-walk":
      map.flyTo({ center: CANAL_WALK_LOCATION, zoom: 18.5 });
      break;
    case "washington-st":
      map.flyTo({ center: WASHINGTON_LOCATION, zoom: 18.9 });
      break;
    case "waterfire-circle-tent":
      map.flyTo({ center: STEEPLE_LOCATION, zoom: 17.7 });
      break;
    case "college-st":
      map.flyTo({ center: COLLEGE_LOCATION, zoom: 18.3 });
      break;
    case "star-walk":
      map.flyTo({ center: CRAWFORD_LOCATION, zoom: 18.2 });
      break;
    case "full-map":
      map.flyTo({ center: BASIN_LOCATION, zoom: 17.8 });
      break;
    default:
      break;
  }
}

var imgScroller = scrollama();

function handleImgStepEnter(response) {
  response.element.classList.add("active");
}

function handleImgStepExit(response) {
  response.element.classList.remove("active");
}

function init() {
  scroller
    .setup({
      step: ".scroll .scrolly article .step",
      offset: 0.8,
      debug: false,
      container: ".scroll",
    })
    .onStepEnter(handleStepEnter);

  imgScroller
    .setup({
      step: ".img-step",
      offset: 0.6,
      debug: false,
    })
    .onStepEnter(handleImgStepEnter)
    .onStepExit(handleImgStepExit);

  // window.addEventListener("resize", handleResize);
}

init();

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.getElementById("progress-bar").style.width = scrollPercent + "%";
}

window.addEventListener("scroll", updateProgressBar);

const toggleBtn = document.getElementById("toggle-button");
const toggleContent = document.getElementById("toggle-content");

toggleBtn.addEventListener("click", () => {
  const isOpen = toggleBtn.classList.contains("open");

  toggleBtn.classList.toggle("open", !isOpen);
  toggleContent.classList.toggle("open", !isOpen);

  if (isOpen) {
    toggleContent.style.display = "none";
  } else {
    toggleContent.style.display = "block";
  }
});

function interpolateCoords(coord1, coord2, t) {
  const lng = coord1[0] + (coord2[0] - coord1[0]) * t;
  const lat = coord1[1] + (coord2[1] - coord1[1]) * t;
  return [lng, lat];
}

function moveBoatSmooth() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = scrollTop / docHeight;

  const scaledIndex = scrollPercent * (FIRE_COORDS.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.min(lowerIndex + 1, FIRE_COORDS.length - 1);
  const t = scaledIndex - lowerIndex;

  const newPos = interpolateCoords(
    FIRE_COORDS[lowerIndex],
    FIRE_COORDS[upperIndex],
    t
  );
  boatMarker.setLngLat(newPos);
}

window.addEventListener("scroll", moveBoatSmooth);

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

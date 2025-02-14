const BrownCoordsEnd = [-71.40112003525219, 41.827891918876645];
const BrownCoordsBeginning = [-71.4048525453158, 41.827790163948436];

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNpbmcxMjIiLCJhIjoiY2x1MXV6Z29lMHFzMTJrcHBsMDgwYzRjeiJ9.XOdMvSBM5o_sG4IwTVhTwA";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  zoom: 15.5,
  center: BrownCoordsBeginning,
});

// map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

// map.on("click", (e) => {
//   console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
// });

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40083175061355, 41.82508003456195],
      },
      properties: {
        description: "Ratty",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40385458241934, 41.82613018601265],
      },
      properties: {
        description: "UHall",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40171574274655, 41.826273606884996],
      },
      properties: {
        description: "Ruth Simmons Quad",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40229678472065, 41.82818610362983],
      },
      properties: {
        description: "Lindemann",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40253718349301, 41.830570587684576],
      },
      properties: {
        description: "Andrews",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.39961131061196, 41.82700880500494],
      },
      properties: {
        description: "CIT",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40130531756294, 41.826021410709956],
      },
      properties: {
        description: "Lincoln Field 120",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40390671252526, 41.827450961647145],
      },
      properties: {
        description: "Fones Alley",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.39844959608999, 41.82655778713132],
      },
      properties: {
        description: "ERC",
      },
    },
  ],
};

for (const feature of geojson.features) {
  const el = document.createElement("div");
  el.className = "marker";
  new mapboxgl.Marker(el)
    .setLngLat(feature.geometry.coordinates)
    // .setPopup(
    //   new mapboxgl.Popup({ offset: 15 }).setHTML(
    //     `<p>${feature.properties.description}</p>`
    //   )
    // )
    .addTo(map);
}

var main = d3.select("main");
var scrolly = main.select(".scrolly");
var article = scrolly.select("article");
var step = article.selectAll(".step");

var scroller = scrollama();

function handleStepEnter(response) {
  step.classed("is-active", function (d, i) {
    return i === response.index;
  });
  const coords = response.element
    .getAttribute("data-coords")
    .split(",")
    .map(Number);
  if (coords[0] == 0 && coords[1] == 0) {
    map.flyTo({ center: BrownCoordsBeginning, zoom: 15.5 });
  } else if (coords[0] == 1 && coords[1] == 1) {
    map.flyTo({ center: BrownCoordsEnd, zoom: 15.5 });
  } else {
    map.flyTo({ center: coords, zoom: 19, duration: 2400 });
  }
}

function handleResize() {
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style("height", stepH + "px");

  scroller.resize();
}
3;
function setupStickyfill() {
  d3.selectAll(".sticky").each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();
  handleResize();

  scroller
    .setup({
      step: ".scrolly article .step",
      offset: 0.6,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener("resize", handleResize);
}

init();

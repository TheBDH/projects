const BrownCoordsEnd = [-71.40112003525219, 41.827891918876645];
// const BrownCoordsBeginning = [-71.4048525453158, 41.827790163948436];
const BrownCoordsBeginning = [-71.40152533474269, 41.82698260697566];

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNpbmcxMjIiLCJhIjoiY2x1MXV6Z29lMHFzMTJrcHBsMDgwYzRjeiJ9.XOdMvSBM5o_sG4IwTVhTwA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/asing122/cm74bpo6k00f401s3dqf74dxt",
  zoom: 16.55,
  center: BrownCoordsBeginning,
  bearing: 90,
  // maxBounds: [
  //   [-71.40519285312371, 41.83069108094094],
  //   [-71.39741843436299, 41.82282128532509],
  // ],
});

map.on("load", () => {
  map.addSource("illo", {
    type: "raster",
    url: "mapbox://asing122.b2sacxrd",
  });

  map.addLayer({
    id: "illo",
    source: "illo",
    type: "raster",
  });
});

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40027239249866, 41.82473332443459],
      },
      properties: {
        description: "Ratty",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40288330513596, 41.826374120464266],
      },
      properties: {
        description: "UHall",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40079619350865, 41.826463413887694],
      },
      properties: {
        description: "Ruth Simmons Quad",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40129678472065, 41.82775910462983],
      },
      properties: {
        description: "Lindemann",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40237718349301, 41.830440587684576],
      },
      properties: {
        description: "Andrews",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.39915869298555, 41.8269123359905],
      },
      properties: {
        description: "CIT",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.4002582357146, 41.82590430472584],
      },
      properties: {
        description: "Lincoln Field 120",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40362685522855, 41.82758819499841],
      },
      properties: {
        description: "Fones Alley",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.39801279257316, 41.826643299219654],
      },
      properties: {
        description: "ERC",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-71.40027239249866, 41.82531881725728],
      },
      properties: {
        description: "Ratty",
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

// function updateMapStyle() {
//   const isDarkMode =
//     window.matchMedia &&
//     window.matchMedia("(prefers-color-scheme: dark)").matches;
//   if (isDarkMode) {
//     map.setStyle("mapbox://styles/mapbox/dark-v11");
//   } else {
//     map.setStyle("mapbox://styles/mapbox/light-v11");
//   }
// }

// // Initial check
// updateMapStyle();

// // Check periodically
// setInterval(updateMapStyle, 1000); // Check every second

// map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on("click", (e) => {
  console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
});

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
    map.flyTo({ center: BrownCoordsBeginning, zoom: 16.55, duration: 2400 });
  } else if (coords[0] == 1 && coords[1] == 1) {
    map.flyTo({ center: BrownCoordsBeginning, zoom: 16.55, duration: 2400 });
  } else {
    map.flyTo({ center: coords, zoom: 17.5, duration: 2400 });
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
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener("resize", handleResize);
}

init();

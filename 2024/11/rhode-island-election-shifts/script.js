mapboxgl.accessToken = 'pk.eyJ1IjoidHlwcyIsImEiOiJjbDh4YXRyZmkwNHQ1M3Bvd25vNjdrMWkyIn0.HpGJaaIrWfLkmx8MiFKX9A';
let mapCounties;
let mapMunicipal;
let currentLayer;
let dataLink = 'https://github.com/TheBDH/projects-wip/blob/main/2024/11/11/RI_Election_Turnouts/RI_Municipality_Sorted_Added_Data_GeoJSON.geojson'
let dataLinkLocal = 'RI_Municipality_PERCENT_MARGINS_ADDED_GeoJSON.geojson'

document.addEventListener('DOMContentLoaded', function () {
    // Get the button and the element you want to hide/show
    const toggleButton = document.getElementById('hideButton');
    const sidebar = document.getElementById('mySideBar'); // Replace with the ID of your sidebar

    // Add an event listener for the button click
    toggleButton.addEventListener('click', function () {
        //console.log("BUTTON PRESSED");
        sidebar.classList.toggle('hidden');
        if (sidebar.classList.contains('hidden')) {
            toggleButton.textContent = 'Show Settings';  // Sidebar is hidden
        } else {
            toggleButton.textContent = 'Hide Settings';  // Sidebar is visible
        }
    });

    // Get the elements by ID
    const municipalityDropdown = document.getElementById('municipality');
    const year1Dropdown = document.getElementById('year1');
    const year2Dropdown = document.getElementById('year2');

    // Function to update displayed values
    function updateMap() {
        var dropdownyear1 = year1Dropdown.options[year1Dropdown.selectedIndex].text;
        var dropdownyear2 = year2Dropdown.options[year2Dropdown.selectedIndex].text;
        var regiontype = municipalityDropdown.options[municipalityDropdown.selectedIndex].text;
        if (Number(dropdownyear1) == Number(dropdownyear2)) {
            console.log("SAME YEAR")
            //raiseSameYear();
        } else {
            if (Number(dropdownyear1) > Number(dropdownyear2)) {
                var curyear1 = dropdownyear2;
                var curyear2 = dropdownyear1;
            } else {
                var curyear1 = dropdownyear1;
                var curyear2 = dropdownyear2;
            }
            if (regiontype == "Municipality") {
                if ((curyear1 == "2016") && (curyear2 == "2020")) {
                    console.log("Municipal2016 to 2020");
                    initializeMapMunicipal16_20()
                } else if ((curyear1 == "2016") && (curyear2 == "2024")) {
                    console.log("Municipal2016 to 2024");
                    initializeMapMunicipal16_24()
                } else {
                    console.log("Municipal2020 to 2024");
                    initializeMapMunicipal20_24()
                }
            } else {
                if ((curyear1 == "2016") && (curyear2 == "2020")) {
                    console.log("County2016 to 2020");
                    initializeMapCounty16_20()
                } else if ((curyear1 == "2016") && (curyear2 == "2024")) {
                    console.log("County2016 to 2024");
                    initializeMapCounty16_24()
                } else {
                    console.log("County2020 to 2024");
                    initializeMapCounty20_24()
                }
            }
        }
        console.log("Map Updated!")
    }

    // Add event listeners to the dropdowns to update values when changed
    municipalityDropdown.addEventListener('change', updateMap);
    year1Dropdown.addEventListener('change', updateMap);
    year2Dropdown.addEventListener('change', updateMap);

    updateMap()
});

// initializes map county with 2024 election results
const initializeMapCounty20_24 = () => {
    mapCounties = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.585243],
        zoom: 8.4,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });
    // Fetch and add the local GeoJSON file
    // Add GeoJSON as a source
    mapCounties.on('load', () => {
        mapCounties.addSource('counties', {
            type: 'geojson',
            data: 'RI_Counties_GeoJSON.geojson'
        });

        // Add a layer showing the state polygons.
        mapCounties.addLayer({
            'id': 'counties-layer',
            'type': 'fill',
            'source': 'counties',
            'paint': {
                'fill-color': {
                    property: 'SHIFT_20_24',
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );
        /*
        mapCounties.addLayer({
            id: 'counties-borders',
            type: 'line',
            source: 'counties',
            paint: {
                'line-color': '#000000',
                'line-width': 3,
                'line-opacity': 1
            }
        });*/

    });
    /*
    mapCounties.on('click', 'counties-layer', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.NAME + " County")
            .addTo(mapCounties);
        mapCounties.flyTo({ center: e.lngLat, zoom: 9.2 });
    }); 
    // Change the cursor to a pointer when the mouse is over the places layer.
    mapCounties.on('mouseenter', 'counties-layer', () => {
        mapCounties.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    mapCounties.on('mouseleave', 'counties-layer', () => {
        mapCounties.getCanvas().style.cursor = '';
    });
    */
    // Create a tooltip element
    const tooltip = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Add mousemove event for hover interaction
    mapCounties.on('mousemove', 'counties-layer', (e) => {
        if (!e.features || e.features.length === 0) return; // Ensure features exist
        const feature = e.features[0];
        const properties = feature.properties || {};

        // Extract the data you want to display
        const countyName = properties.NAME + " County" || "Unknown County";
        const voteMargin24 = properties.MARGIN_2024 || "No data available";
        const voteMargin20 = properties.MARGIN_2020 || "No data available";
        const voteShift20_24 = properties.SHIFT_20_24 || "No data available";
        var voteMargin20HTML = "";
        var voteMargin24HTML = "";
        var voteShift20_24HTML = "";
        if (voteMargin20 > 0) {
            voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2020: D+${Math.round(voteMargin20)}`;
        } else {
            voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2020: R+${-1 * Math.round(voteMargin20)}`;
        }
        if (voteMargin24 > 0) {
            voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin24)}`;
        } else {
            voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin24)}`;
        }
        if (voteShift20_24 > 0) {
            voteShift20_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift20_24)}`;
        } else {
            voteShift20_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift20_24)}`;
        }

        // Update tooltip content
        tooltip.setLngLat(e.lngLat)
            .setHTML(`
                <strong>${countyName}</strong><br>
                ${voteMargin20HTML}<br>
                ${voteMargin24HTML}<br>
                ${voteShift20_24HTML}
            `)
            .addTo(mapCounties);
    });


    // Remove tooltip on mouse leave
    mapCounties.on('mouseleave', 'counties-layer', () => {
        tooltip.remove();
    });


}

// initializes map county with 2016 -> 2024 shift election results
const initializeMapCounty16_24 = () => {
    mapCounties = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.585243],
        zoom: 8.4,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });
    // Fetch and add the local GeoJSON file
    // Add GeoJSON as a source
    mapCounties.on('load', () => {
        mapCounties.addSource('counties', {
            type: 'geojson',
            data: 'RI_Counties_GeoJSON.geojson'
        });

        // Add a layer showing the state polygons.
        mapCounties.addLayer({
            'id': 'counties-layer',
            'type': 'fill',
            'source': 'counties',
            'paint': {
                'fill-color': {
                    property: 'SHIFT_16_24',
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );

    });
    // Create a tooltip element
    const tooltip = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Add mousemove event for hover interaction
    mapCounties.on('mousemove', 'counties-layer', (e) => {
        if (!e.features || e.features.length === 0) return; // Ensure features exist
        const feature = e.features[0];
        const properties = feature.properties || {};

        // Extract the data you want to display
        const countyName = properties.NAME + " County" || "Unknown County";
        const voteMargin24 = properties.MARGIN_2024 || "No data available";
        const voteMargin16 = properties.MARGIN_2016 || "No data available";
        const voteShift16_24 = properties.SHIFT_16_24 || "No data available";
        var voteMargin16HTML = "";
        var voteMargin24HTML = "";
        var voteShift16_24HTML = "";
        if (voteMargin16 > 0) {
            voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2020: D+${Math.round(voteMargin16)}`;
        } else {
            voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2020: R+${-1 * Math.round(voteMargin16)}`;
        }
        if (voteMargin24 > 0) {
            voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin24)}`;
        } else {
            voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin24)}`;
        }
        if (voteShift16_24 > 0) {
            voteShift16_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift16_24)}`;
        } else {
            voteShift16_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift16_24)}`;
        }

        // Update tooltip content
        tooltip.setLngLat(e.lngLat)
            .setHTML(`
                <strong>${countyName}</strong><br>
                ${voteMargin16HTML}<br>
                ${voteMargin24HTML}<br>
                ${voteShift16_24HTML}
            `)
            .addTo(mapCounties);
    });


    // Remove tooltip on mouse leave
    mapCounties.on('mouseleave', 'counties-layer', () => {
        tooltip.remove();
    });


}

// initializes map county with 2024 election results
const initializeMapCounty16_20 = () => {
    mapCounties = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.585243],
        zoom: 8.4,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });
    // Fetch and add the local GeoJSON file
    // Add GeoJSON as a source
    mapCounties.on('load', () => {
        mapCounties.addSource('counties', {
            type: 'geojson',
            data: 'RI_Counties_GeoJSON.geojson'
        });

        // Add a layer showing the state polygons.
        mapCounties.addLayer({
            'id': 'counties-layer',
            'type': 'fill',
            'source': 'counties',
            'paint': {
                'fill-color': {
                    property: 'SHIFT_16_20',
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );

    });
    // Create a tooltip element
    const tooltip = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Add mousemove event for hover interaction
    mapCounties.on('mousemove', 'counties-layer', (e) => {
        if (!e.features || e.features.length === 0) return; // Ensure features exist
        const feature = e.features[0];
        const properties = feature.properties || {};

        // Extract the data you want to display
        const countyName = properties.NAME + " County" || "Unknown County";
        const voteMargin20 = properties.MARGIN_2020 || "No data available";
        const voteMargin16 = properties.MARGIN_2016 || "No data available";
        const voteShift16_20 = properties.SHIFT_16_20 || "No data available";
        var voteMargin16HTML = "";
        var voteMargin20HTML = "";
        var voteShift16_20HTML = "";
        if (voteMargin16 > 0) {
            voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2020: D+${Math.round(voteMargin16)}`;
        } else {
            voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2020: R+${-1 * Math.round(voteMargin16)}`;
        }
        if (voteMargin20 > 0) {
            voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin20)}`;
        } else {
            voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin20)}`;
        }
        if (voteShift16_20 > 0) {
            voteShift16_20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift16_20)}`;
        } else {
            voteShift16_20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift16_20)}`;
        }

        // Update tooltip content
        tooltip.setLngLat(e.lngLat)
            .setHTML(`
                <strong>${countyName}</strong><br>
                ${voteMargin16HTML}<br>
                ${voteMargin20HTML}<br>
                ${voteShift16_20HTML}
            `)
            .addTo(mapCounties);
    });


    // Remove tooltip on mouse leave
    mapCounties.on('mouseleave', 'counties-layer', () => {
        tooltip.remove();
    });


}

// initializes map municipality with 2024 election results
const addLayerMunicipalWonStates_16_20 = () => {
    mapMunicipal.addLayer({
        'id': 'municipals-layer',
        'type': 'fill',
        'source': 'municipals',
        'paint': {
            'color': 'white',
            'fill-color': {
                property: 'VOTER_SWING_20_24_SHIFT_WEIGHTED',
                stops: [
                    [-0.1, 'rgba(192,80,222,0.7)'],
                    [-0.08, 'rgba(211,100,241,0.7)'],
                    [-0.06, 'rgba(201,127,240,0.7)'],
                    [-0.04, 'rgba(199,153,240,0.7)'],
                    [-0.02, 'rgba(203,178,241,0.7)'],
                    [-0.00001, 'rgba(212,201,243,0.7)'],
                    // [0, 'rgba(234,217,192,0.7)'],
                    // [0.00001, 'rgba(229,217,95,0.7)'],
                    // [0.02, 'rgba(197,215,90,0.7)'],
                    // [0.04, 'rgba(158,202,85,0.7)'],
                    // [0.06, 'rgba(123,189,80,0.7)'],
                    // [0.08, 'rgba(92,176,75,0.7)'],
                    // [0.1, 'rgba(70,163,76,0.7)']
                ],
            }
        }
    })
}
const initializeMapMunicipal20_24 = () => {
    mapMunicipal = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.54243],
        zoom: 8.5,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });

    // add a geojson line layer with a polygon representing the bounds
    mapMunicipal.on('load', () => {

        mapMunicipal.addSource('municipals', {
            type: 'geojson',
            data: dataLinkLocal
        });

        // Add a layer showing the state polygons.
        // mapMunicipal.addLayer({
        //     'id': 'municipals-layer',
        //     'type': 'fill',
        //     'source': 'municipals',
        //     'paint': {
        //         'color': 'white',
        //         'fill-color': {
        //             property: 'VOTER_SWING_20_24_SHIFT_WEIGHTED',
        //             stops: [
        //                 [-0.1, 'rgba(192,80,222,0.7)'],
        //                 [-0.08, 'rgba(211,100,241,0.7)'],
        //                 [-0.06, 'rgba(201,127,240,0.7)'],
        //                 [-0.04, 'rgba(199,153,240,0.7)'],
        //                 [-0.02, 'rgba(203,178,241,0.7)'],
        //                 [-0.00001, 'rgba(212,201,243,0.7)'],
        //                 // [0, 'rgba(234,217,192,0.7)'],
        //                 // [0.00001, 'rgba(229,217,95,0.7)'],
        //                 // [0.02, 'rgba(197,215,90,0.7)'],
        //                 // [0.04, 'rgba(158,202,85,0.7)'],
        //                 // [0.06, 'rgba(123,189,80,0.7)'],
        //                 // [0.08, 'rgba(92,176,75,0.7)'],
        //                 // [0.1, 'rgba(70,163,76,0.7)']
        //             ],
        //         }
        //     }
        // });

        mapMunicipal.addLayer({
            'id': 'municipals-layer',
            'type': 'fill',
            'source': 'municipals',
            'paint': {
                'color': 'white',
                'fill-color': {
                    property: "VOTE_PERCENT_SWING_20_24",
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );
        // Create a tooltip element
        const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        // Add mousemove event for hover interaction
        mapMunicipal.on('mousemove', 'municipals-layer', (e) => {
            if (!e.features || e.features.length === 0) return; // Ensure features exist
            const feature = e.features[0];
            const properties = feature.properties || {};

            // Extract the data you want to display
            const municipalityName = properties.NAME20 || "Unknown Municipality";
            const voteMargin24 = properties.VOTE_PERCENT_MARGIN_24 || "No data available";
            const voteMargin20 = properties.VOTE_PERCENT_MARGIN_20 || "No data available";
            const voteShift20_24 = properties.VOTE_PERCENT_SWING_20_24 || "No data available";
            var voteMargin20HTML = "";
            var voteMargin24HTML = "";
            var voteShift20_24HTML = "";
            if (voteMargin20 > 0) {
                voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2020: D+${Math.round(voteMargin20)}`;
            } else {
                voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2020: R+${-1 * Math.round(voteMargin20)}`;
            }
            if (voteMargin24 > 0) {
                voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin24)}`;
            } else {
                voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin24)}`;
            }
            if (voteShift20_24 > 0) {
                voteShift20_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift20_24)}`;
            } else {
                voteShift20_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift20_24)}`;
            }

            // Update tooltip content
            tooltip.setLngLat(e.lngLat)
                .setHTML(`
                    <strong>${municipalityName}</strong><br>
                    ${voteMargin20HTML}<br>
                    ${voteMargin24HTML}<br>
                    ${voteShift20_24HTML}
                `)
                .addTo(mapMunicipal);
        });


        // Remove tooltip on mouse leave
        mapMunicipal.on('mouseleave', 'municipals-layer', () => {
            tooltip.remove();
        });


        // mapMunicipal.addLayer({
        //     id: 'line-bounding-box',
        //     type: 'line',
        //     source: 'municipals',
        //     paint: {
        //         'line-color': '#050505',
        //         'line-width': 3,
        //         'line-opacity': 0.9
        //     },
        //
        // });
    });

};

const initializeMapMunicipal16_24 = () => {
    mapMunicipal = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.54243],
        zoom: 8.5,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });

    // add a geojson line layer with a polygon representing the bounds
    mapMunicipal.on('load', () => {

        mapMunicipal.addSource('municipals', {
            type: 'geojson',
            data: dataLinkLocal
        });

        mapMunicipal.addLayer({
            'id': 'municipals-layer',
            'type': 'fill',
            'source': 'municipals',
            'paint': {
                'color': 'white',
                'fill-color': {
                    property: "VOTE_PERCENT_SWING_16_24",
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );
        // Create a tooltip element
        const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        // Add mousemove event for hover interaction
        mapMunicipal.on('mousemove', 'municipals-layer', (e) => {
            if (!e.features || e.features.length === 0) return; // Ensure features exist
            const feature = e.features[0];
            const properties = feature.properties || {};

            // Extract the data you want to display
            const municipalityName = properties.NAME20 || "Unknown Municipality";
            const voteMargin24 = properties.VOTE_PERCENT_MARGIN_24 || "No data available";
            const voteMargin16 = properties.VOTE_PERCENT_MARGIN_16 || "No data available";
            const voteShift16_24 = properties.VOTE_PERCENT_SWING_16_24 || "No data available";
            var voteMargin16HTML = "";
            var voteMargin24HTML = "";
            var voteShift16_24HTML = "";
            if (voteMargin16 > 0) {
                voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2016: D+${Math.round(voteMargin16)}`;
            } else {
                voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2016: R+${-1 * Math.round(voteMargin16)}`;
            }
            if (voteMargin24 > 0) {
                voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin24)}`;
            } else {
                voteMargin24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin24)}`;
            }
            if (voteShift16_24 > 0) {
                voteShift16_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift16_24)}`;
            } else {
                voteShift16_24HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift16_24)}`;
            }

            // Update tooltip content
            tooltip.setLngLat(e.lngLat)
                .setHTML(`
                    <strong>${municipalityName}</strong><br>
                    ${voteMargin16HTML}<br>
                    ${voteMargin24HTML}<br>
                    ${voteShift16_24HTML}
                `)
                .addTo(mapMunicipal);
        });


        // Remove tooltip on mouse leave
        mapMunicipal.on('mouseleave', 'municipals-layer', () => {
            tooltip.remove();
        });
    });

};

const initializeMapMunicipal16_20 = () => {
    mapMunicipal = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/typs/cm3dl8bkr003y01nu30qs73wg',
        center: [-71.897884, 41.54243],
        zoom: 8.5,
        // bounding box (southwest corner, northeast corner)
        fitBoundsOptions: {
            padding: 15 // padding to keep the bounds away from the edge of the map
        }
    });

    // add a geojson line layer with a polygon representing the bounds
    mapMunicipal.on('load', () => {

        mapMunicipal.addSource('municipals', {
            type: 'geojson',
            data: dataLinkLocal
        });

        mapMunicipal.addLayer({
            'id': 'municipals-layer',
            'type': 'fill',
            'source': 'municipals',
            'paint': {
                'color': 'white',
                'fill-color': {
                    property: "VOTE_PERCENT_SWING_16_20",
                    stops: [
                        [-15, 'rgba(255, 0, 0, 0.7)'],    // Very saturated red
                        [-12, 'rgba(255,25,25,0.7)'],    // Pure red
                        [-9, 'rgba(255,50,50,0.7)'],     // Pure red
                        [-6, 'rgba(255,100,100,0.7)'],   // Lighter red with saturation
                        [-3, 'rgba(255,150,150,0.7)'], // Very light red, still saturated
                        [0, 'rgba(240,240,240,0.7)'],  // Neutral beige (midpoint)
                        [3, 'rgba(0,150,255,0.7)'],    // Bright light blue
                        [6, 'rgba(0,100,255,0.7)'],     // Rich blue
                        [9, 'rgba(0,50,255,0.7)'],     // Deep blue
                        [12, 'rgba(0,25,255,0.7)'],    // Darker blue
                        [15, 'rgba(0,0,255,0.7)']      // Very saturated blue
                    ]
                }
            }
        },
            'waterway'
        );
        // Create a tooltip element
        const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        // Add mousemove event for hover interaction
        mapMunicipal.on('mousemove', 'municipals-layer', (e) => {
            if (!e.features || e.features.length === 0) return; // Ensure features exist
            const feature = e.features[0];
            const properties = feature.properties || {};

            // Extract the data you want to display
            const municipalityName = properties.NAME20 || "Unknown Municipality";
            const voteMargin20 = properties.VOTE_PERCENT_MARGIN_20 || "No data available";
            const voteMargin16 = properties.VOTE_PERCENT_MARGIN_16 || "No data available";
            const voteShift16_20 = properties.VOTE_PERCENT_SWING_16_20 || "No data available";
            var voteMargin16HTML = "";
            var voteMargin20HTML = "";
            var voteShift16_20HTML = "";
            if (voteMargin16 > 0) {
                voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2016: D+${Math.round(voteMargin16)}`;
            } else {
                voteMargin16HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2016: R+${-1 * Math.round(voteMargin16)}`;
            }
            if (voteMargin20 > 0) {
                voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>2024: D+${Math.round(voteMargin20)}`;
            } else {
                voteMargin20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>2024: R+${-1 * Math.round(voteMargin20)}`;
            }
            if (voteShift16_20 > 0) {
                voteShift16_20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 2px; margin-right: 5px;"></span>Shift: D+${Math.round(voteShift16_20)}`;
            } else {
                voteShift16_20HTML = `<span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 2px; margin-right: 5px;"></span>Shift: R+${-1 * Math.round(voteShift16_20)}`;
            }

            // Update tooltip content
            tooltip.setLngLat(e.lngLat)
                .setHTML(`
                    <strong>${municipalityName}</strong><br>
                    ${voteMargin16HTML}<br>
                    ${voteMargin20HTML}<br>
                    ${voteShift16_20HTML}
                `)
                .addTo(mapMunicipal);
        });


        // Remove tooltip on mouse leave
        mapMunicipal.on('mouseleave', 'municipals-layer', () => {
            tooltip.remove();
        });
    });

};


const removeExistingLayers = () => {
    var currentLayers = mapMunicipal.getLayer;
};

function returnValue(value, demName, repName) {
    var displayText;
    if (value == 0) {
        displayText = " had no change."
    } else if (value < 0) {
        displayText = repName + " won by " + -value + " more votes."
    } else if (value > 0) {
        displayText = demName + " won by " + value + " more votes."
    }
    return displayText;
}
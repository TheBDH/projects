document.addEventListener("DOMContentLoaded", function () {
    let map;
    let markerCluster;
    let markerLayer;
    let isClusterMode = true;
    let allTrees = [];
    let avgLat = 41.8268;
    let avgLon = -71.4029;

    // --- EXPANDED COMMON NAME DICTIONARY ---
    const SPECIES_COMMON_NAMES = {
        'Ulmus americana Princeton': 'American Elm',
        'Acer platanoides Crimson King': 'Norway Maple',
        'Acer x freemanii Armstrong': 'Freeman Maple',
        'Gleditsia triacanthos inermis': 'Thornless Honey Locust',
        'Celtis spp.': 'Hackberry',
        'Acer platanoides': 'Norway Maple',
        'Acer saccharum': 'Sugar Maple',
        'Acer rubrum': 'Red Maple',
        'Acer pseudoplatanus': 'Sycamore Maple',
        'Acer palmatum': 'Japanese Maple',
        'Acer negundo': 'Boxelder',
        'Acer saccharinum': 'Silver Maple',
        'Acer campestre': 'Hedge Maple',
        'Acer ginnala': 'Amur Maple',
        'Acer pensylvanicum': 'Striped Maple',
        'Acer griseum': 'Paperbark Maple',
        'Quercus rubra': 'Red Oak',
        'Quercus palustris': 'Pin Oak',
        'Quercus alba': 'White Oak',
        'Quercus robur': 'English Oak',
        'Quercus coccinea': 'Scarlet Oak',
        'Quercus velutina': 'Black Oak',
        'Quercus bicolor': 'Swamp White Oak',
        'Quercus macrocarpa': 'Bur Oak',
        'Quercus phellos': 'Willow Oak',
        'Quercus acutissima': 'Sawtooth Oak',
        'Quercus imbricaria': 'Shingle Oak',
        'Prunus serotina': 'Black Cherry',
        'Prunus cerasifera': 'Cherry Plum',
        'Prunus serrulata': 'Japanese Flowering Cherry',
        'Prunus virginiana': 'Chokecherry',
        'Prunus sargentii': 'Sargent Cherry',
        'Prunus yedoensis': 'Yoshino Cherry',
        'Prunus avium': 'Sweet Cherry',
        'Pyrus calleryana': 'Callery Pear',
        'Malus': 'Crabapple',
        'Malus floribunda': 'Japanese Flowering Crabapple',
        'Ulmus americana': 'American Elm',
        'Ulmus pumila': 'Siberian Elm',
        'Ulmus parvifolia': 'Lacebark Elm',
        'Ulmus glabra': 'Wych Elm',
        'Ulmus procera': 'English Elm',
        'Platanus occidentalis': 'American Sycamore',
        'Platanus x acerifolia': 'London Planetree',
        'Tilia cordata': 'Littleleaf Linden',
        'Tilia americana': 'American Linden',
        'Tilia tomentosa': 'Silver Linden',
        'Gleditsia triacanthos': 'Honey Locust',
        'Robinia pseudoacacia': 'Black Locust',
        'Gymnocladus dioicus': 'Kentucky Coffeetree',
        'Cladrastis kentukea': 'Yellowwood',
        'Cercis canadensis': 'Eastern Redbud',
        'Styphnolobium japonicum': 'Japanese Pagoda Tree',
        'Sophora japonica': 'Japanese Pagoda Tree',
        'Betula nigra': 'River Birch',
        'Betula papyrifera': 'Paper Birch',
        'Betula populifolia': 'Gray Birch',
        'Betula pendula': 'Silver Birch',
        'Betula lenta': 'Sweet Birch',
        'Pinus strobus': 'Eastern White Pine',
        'Pinus nigra': 'Austrian Pine',
        'Pinus sylvestris': 'Scots Pine',
        'Picea abies': 'Norway Spruce',
        'Picea pungens': 'Blue Spruce',
        'Picea glauca': 'White Spruce',
        'Tsuga canadensis': 'Eastern Hemlock',
        'Thuja occidentalis': 'Arborvitae',
        'Metasequoia glyptostroboides': 'Dawn Redwood',
        'Taxodium distichum': 'Bald Cypress',
        'Juniperus virginiana': 'Eastern Red Cedar',
        'Pseudotsuga menziesii': 'Douglas Fir',
        'Ginkgo biloba': 'Ginkgo',
        'Liriodendron tulipifera': 'Tulip Tree',
        'Fagus sylvatica': 'European Beech',
        'Fagus grandifolia': 'American Beech',
        'Cornus florida': 'Flowering Dogwood',
        'Cornus kousa': 'Kousa Dogwood',
        'Cornus mas': 'Cornelian Cherry',
        'Zelkova serrata': 'Japanese Zelkova',
        'Magnolia x soulangeana': 'Saucer Magnolia',
        'Magnolia stellata': 'Star Magnolia',
        'Magnolia virginiana': 'Sweetbay Magnolia',
        'Liquidambar styraciflua': 'Sweetgum',
        'Celtis occidentalis': 'Hackberry',
        'Morus alba': 'White Mulberry',
        'Morus rubra': 'Red Mulberry',
        'Ailanthus altissima': 'Tree of Heaven',
        'Fraxinus pennsylvanica': 'Green Ash',
        'Fraxinus americana': 'White Ash',
        'Nyssa sylvatica': 'Black Gum',
        'Catalpa speciosa': 'Northern Catalpa',
        'Aesculus hippocastanum': 'Horse Chestnut',
        'Aesculus glabra': 'Ohio Buckeye',
        'Carpinus caroliniana': 'American Hornbeam',
        'Carpinus betulus': 'European Hornbeam',
        'Ostrya virginiana': 'American Hophornbeam',
        'Amelanchier arborea': 'Downy Serviceberry',
        'Amelanchier canadensis': 'Shadbush',
        'Crataegus phaenopyrum': 'Washington Hawthorn',
        'Crataegus viridis': 'Green Hawthorn',
        'Crataegus crus-galli': 'Cockspur Hawthorn',
        'Koelreuteria paniculata': 'Goldenrain Tree',
        'Juglans nigra': 'Black Walnut'
    };

    function getDisplayName(spp) {
        if (!spp) return "Unknown Species";

        const cleanSpp = spp.trim().replace(/['"]+/g, '');

        if (SPECIES_COMMON_NAMES[cleanSpp]) {
            return `${cleanSpp} <span class="text-gray-500 text-xs italic">(${SPECIES_COMMON_NAMES[cleanSpp]})</span>`;
        }

        const genus = cleanSpp.split(' ')[0];
        let genericName = "";

        if (genus === 'Acer') genericName = 'Maple';
        else if (genus === 'Quercus') genericName = 'Oak';
        else if (genus === 'Prunus') genericName = 'Cherry/Plum';
        else if (genus === 'Ulmus') genericName = 'Elm';
        else if (genus === 'Pinus') genericName = 'Pine';
        else if (genus === 'Cornus') genericName = 'Dogwood';
        else if (genus === 'Malus') genericName = 'Crabapple';
        else if (genus === 'Magnolia') genericName = 'Magnolia';
        else if (genus === 'Fraxinus') genericName = 'Ash';
        else if (genus === 'Picea') genericName = 'Spruce';
        else if (genus === 'Tilia') genericName = 'Linden';
        else if (genus === 'Carya') genericName = 'Hickory';
        else if (genus === 'Betula') genericName = 'Birch';
        else if (genus === 'Celtis') genericName = 'Hackberry';

        if (genericName) {
            return `${cleanSpp} <span class="text-gray-500 text-xs italic">(${genericName})</span>`;
        }

        return cleanSpp;
    }

    function generateRareList(trees) {
        const counts = {};

        trees.forEach(t => {
            let s = t.SPP ? t.SPP.trim() : null;
            if (s) {
                counts[s] = (counts[s] || 0) + 1;
            }
        });

        const sorted = Object.entries(counts).sort((a, b) => {
            if (a[1] !== b[1]) return a[1] - b[1];
            return a[0].localeCompare(b[0]);
        });

        const rareTrees = sorted.filter(item => {
            const name = item[0].toLowerCase();
            const count = item[1];

            if (name.includes('unknown')) return false;
            if (name.includes('empty')) return false;
            if (name.includes('vacant')) return false;

            return count <= 10;
        });

        const listContainer = document.getElementById('rare-tree-list');
        listContainer.innerHTML = '';

        if (rareTrees.length === 0) {
            listContainer.innerHTML = '<li class="text-center text-gray-500">No rare species found.</li>';
            return;
        }

        rareTrees.forEach(([spp, count]) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b border-gray-100";

            let badgeColor = "bg-blue-100 text-blue-800";
            if (count === 1) badgeColor = "bg-red-100 text-red-800";
            else if (count === 2) badgeColor = "bg-orange-100 text-orange-800";

            li.innerHTML = `
                        <div class="text-sm text-gray-800 font-medium">${getDisplayName(spp)}</div>
                        <div class="ml-4 px-2 py-1 ${badgeColor} text-xs font-bold rounded-full whitespace-nowrap">
                            ${count} ${count === 1 ? 'Tree' : 'Trees'}
                        </div>
                    `;
            listContainer.appendChild(li);
        });
    }

    function populateFilters(trees) {
        const speciesFilter = document.getElementById('species-filter');
        const streetFilter = document.getElementById('street-filter');
        const minDbhInput = document.getElementById('min-dbh-filter');
        const maxDbhInput = document.getElementById('max-dbh-filter');

        const speciesSet = new Set(trees.map(t => t.SPP).filter(s => s));
        const speciesWithCommon = [...speciesSet].map(spp => ({
            scientific: spp,
            display: spp
        }));
        speciesWithCommon.sort((a, b) => a.display.localeCompare(b.display));
        speciesWithCommon.forEach(s => {
            const option = document.createElement('option');
            option.value = s.scientific;
            option.textContent = s.display;
            speciesFilter.appendChild(option);
        });

        const streets = [...new Set(trees.map(t => t.Street).filter(s => s))].sort();
        streets.forEach(street => {
            const option = document.createElement('option');
            option.value = street;
            option.textContent = street;
            streetFilter.appendChild(option);
        });

        const dbhValues = trees.map(t => t.DBH).filter(d => d && d > 0);
        if (dbhValues.length > 0) {
            const minDbh = Math.floor(Math.min(...dbhValues));
            const maxDbh = Math.ceil(Math.max(...dbhValues));
            minDbhInput.placeholder = `min: ${minDbh}`;
            maxDbhInput.placeholder = `max: ${maxDbh}`;
        }
    }

    function updateMap() {
        const selectedSpecies = document.getElementById('species-filter').value;
        const selectedStreet = document.getElementById('street-filter').value;
        const minDbh = parseFloat(document.getElementById('min-dbh-filter').value) || 0;
        const maxDbh = parseFloat(document.getElementById('max-dbh-filter').value) || Infinity;

        markerCluster.clearLayers();
        markerLayer.clearLayers();

        if (map.hasLayer(markerCluster)) map.removeLayer(markerCluster);
        if (map.hasLayer(markerLayer)) map.removeLayer(markerLayer);

        const filteredTrees = allTrees.filter(tree => {
            const speciesMatch = (selectedSpecies === 'all' || tree.SPP === selectedSpecies);
            const streetMatch = (selectedStreet === 'all' || tree.Street === selectedStreet);
            const dbh = tree.DBH || 0;
            const dbhMatch = (dbh >= minDbh && dbh <= maxDbh);
            return speciesMatch && streetMatch && dbhMatch;
        });

        filteredTrees.forEach((tree) => {
            const popupContent = `
                        <b>Species:</b> ${getDisplayName(tree.SPP)}<br>
                        <b>Street:</b> ${tree.Street || "N/A"}<br>
                        <b>Diameter:</b> ${tree.DBH || "N/A"} inches
                    `;
            const marker = L.marker([tree.latitude, tree.longitude]).bindPopup(popupContent);

            if (isClusterMode) {
                markerCluster.addLayer(marker);
            } else {
                markerLayer.addLayer(marker);
            }
        });

        if (isClusterMode) {
            map.addLayer(markerCluster);
        } else {
            map.addLayer(markerLayer);
        }
    }

    function handleData(results) {
        allTrees = results.data.filter((t) => t.latitude && t.longitude);

        if (allTrees.length > 0) {
            avgLat = allTrees.reduce((sum, t) => sum + t.latitude, 0) / allTrees.length;
            avgLon = allTrees.reduce((sum, t) => sum + t.longitude, 0) / allTrees.length;
            map.setView([avgLat, avgLon], 16);
        }

        populateFilters(allTrees);
        generateRareList(allTrees);
        updateMap();
    }

    function initMap() {
        map = L.map("map").setView([avgLat, avgLon], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(map);

        markerCluster = L.markerClusterGroup();
        markerLayer = L.layerGroup();

        const csv_url = "";

        if (csv_url && csv_url.startsWith("https")) {
            Papa.parse(csv_url, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    handleData(results);
                },
                error: function (err) {
                    loadLocalCsv();
                }
            });
        } else {
            loadLocalCsv();
        }

        function loadLocalCsv() {
            Papa.parse("Brown_Trees_Dataset_New.csv", {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    handleData(results);
                },
                error: function (err) {
                    document.getElementById('map').innerHTML = '<p class="text-red-500 text-center">Could not load tree data.</p>';
                }
            });
        }

        document.getElementById('apply-filters-btn').addEventListener('click', updateMap);

        document.getElementById('reset-filters-btn').addEventListener('click', () => {
            document.getElementById('species-filter').value = 'all';
            document.getElementById('street-filter').value = 'all';
            document.getElementById('min-dbh-filter').value = '';
            document.getElementById('max-dbh-filter').value = '';
            document.getElementById('cluster-toggle').checked = true;
            isClusterMode = true;
            updateMap();
        });

        document.getElementById('cluster-toggle').addEventListener('change', (e) => {
            isClusterMode = e.target.checked;
            updateMap();
        });
    }

    initMap();
});
mapboxgl.accessToken = 'pk.eyJ1IjoidHlwcyIsImEiOiJjbDh4YXRyZmkwNHQ1M3Bvd25vNjdrMWkyIn0.HpGJaaIrWfLkmx8MiFKX9A';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/typs/clhzrho2f00tt01po5taued3m',
    center: [ -71.40326759970678, 41.82617573088007],
    zoom: 16,
    projection: 'mercator',
    attributionControl:false,
    minZoom: 3,
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

map.on('style.load', () => {
    map.setFog({});  // Set the default atmosphere style
    addSources()
    hideDivs()
})

const srcs = ['./images/nav/1.png','./images/nav/2.png','./images/nav/3.png','./images/nav/4.png','./images/nav/5.png','./images/nav/6.png','./images/nav/7.png','./images/nav/8.png']

function addSources(){
    map.addSource('locations', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/locations.geojson',  // your data source
    });

    map.addSource('church', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/church.geojson',  // your data source
    });

    map.addSource('empire', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/empire.geojson',  // your data source
    });

    map.addSource('lukes', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/lukes.geojson',  // your data source
    });
    map.addSource('on', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/on.geojson',  // your data source
    });
    map.addSource('moys', {
        type: 'geojson',
        data: 'https://typhamswann.github.io/chinatown-data/moys.geojson',  // your data source
    });


}

function showPoint(id){

    if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', 'visible');
    } else {
    map.addLayer({
        id: id,
        type: 'circle',
        source: id,
        paint: {
            'circle-radius': 7,
            'circle-color': '#FFD700',
            'circle-stroke-color': '#FF0000',
            'circle-stroke-width': 3
        }
    });
}
}

function hidePoint(id){
    map.setLayoutProperty(id, 'visibility', 'none');

}

function removeCover() {
    document.getElementById('introCover').style.display = 'none';
}



const data = [{
    "location": "Providence Chinatown",
    "point": 'locations',
    "zoom": 14,
    "coord": [-71.41471824430158, 41.82178165924563],
    "div": "div-1"
},
{
    "location": "Providence Chinatown",
    "point": 'locations',
    "coord": [-71.41471824430158, 41.82178165924563],
    "zoom": 14,
    "div": "div-2"
},
{
    "location": "Empire Street Alley",
    "point": 'empire',
    "zoom": 18,
    "coord": [-71.41545840406322, 41.82144958892539],
    "div": "div-3"
},
{
    "location": "Beneficent Congregational Church",
    "point": 'church',
    "zoom": 18,
    "coord": [-71.413610, 41.820120],
    "div": "div-4"
},
{
    "location": "On Leong Chinese Merchants Association, Today",
    "point": 'on',
    "zoom": 18,
    "coord": [-71.431180, 41.787660],
    "div": "div-5"
},
{
    "location": "Moy's High Class Laundry",
    "point": 'moys',
    "zoom": 18,
    "coord": [-71.415140, 41.819070],
    "div": "div-6"
},
{
    "location": "Luke's Chinese-American Restaurant",
    "point": 'lukes',
    "zoom": 18,
    "coord": [-71.412930, 41.823610],
    "div": "div-7"
},
{
    "location": "Providence Chinatown",
    "point": 'locations',
    "coord": [-71.41471824430158, 41.82178165924563],
    "zoom": 14,
    "div": "div-8"
}
]

function hideDivs() {
    // Get all elements with the class 'content-container'
    var elements = document.getElementsByClassName('content-container');

    // Loop through each element and set its visibility to 'none'
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }
}

function showMap(){
    document.getElementById(currentDiv.div).style.display = 'none'
    document.getElementById('coverDiv').style.display = 'none'
    document.getElementById('locationTitle').textContent = currentDiv.location
    document.getElementById('locationTitle').style.display = 'block';
    document.getElementById('returnToArticle').textContent = 'Return to Article';
    document.getElementById('returnToArticle').style.display = 'block'; // Ensure this is 'visible' to show the element
    showPoint(currentDiv.point)
}

function showArticle(){
    document.getElementById(currentDiv.div).style.display = 'block'
    document.getElementById('coverDiv').style.display = 'block'
    document.getElementById('locationTitle').style.display = 'hidden'
    document.getElementById('returnToArticle').style.display = 'hidden'
    document.getElementById('returnToArticle').style.display = 'none'; // Ensure this is 'visible' to show the element
    document.getElementById('locationTitle').style.display = 'none';
    hidePoint(currentDiv.point)
}


function setDivs() {
    // Get all elements with the class 'content-container'
    var elements = document.getElementsByClassName('content-container');

    // Loop through each element and set its visibility to 'none'
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }

    document.getElementById(currentDiv.div).style.display = 'block'

}

function exitIntro(){
    currentDivIndex = 0
    document.getElementById("nav").src = srcs[1]
    currentDiv = data[currentDivIndex]
    const intro = document.getElementById("intro");
    const introCover = document.getElementById('introCover');
    
    intro.classList.add('fade-out');
    introCover.classList.add('fade-out');
    
    intro.addEventListener('transitionend', () => {
        intro.style.display = 'none';
    });
    
    introCover.addEventListener('transitionend', () => {
        introCover.style.display = 'none';
    });
    sleep(10).then(() => { 
        document.getElementById("div-1").style.display = 'block'
        document.getElementById('coverDiv').style.display = 'block';
    });

}

function nextSection(){
    document.getElementById(currentDiv.div).style.display = 'none'
    document.getElementById('coverDiv').style.display = 'none'

    currentDivIndex += 1;
    document.getElementById("nav").src = srcs[currentDivIndex]
    if (currentDivIndex == 8){
        currentDivIndex = 0;
        document.getElementById("nav").src = srcs[currentDivIndex]
    } 
    currentDiv = data[currentDivIndex]

    showPoint(data[currentDivIndex].point)

    if (currentDivIndex == 4 || currentDivIndex == 5 ){
        document.getElementById('locationTitle').textContent = currentDiv.location
        document.getElementById('locationTitle').style.display = 'block';
        map.flyTo({
            center: currentDiv.coord,
            zoom: currentDiv.zoom,
            duration: 6000
            });

    sleep(8000).then(() => { 
        hidePoint(data[currentDivIndex].point)
        document.getElementById(currentDiv.div).style.display = 'block'
        document.getElementById('coverDiv').style.display = 'block'
        document.getElementById('locationTitle').style.display = 'none';
    });
    } else {
        document.getElementById('locationTitle').textContent = currentDiv.location
        document.getElementById('locationTitle').style.display = 'block';
        map.flyTo({
        center: currentDiv.coord,
        zoom: currentDiv.zoom,
        duration: 3000
        });

sleep(4000).then(() => { 
    hidePoint(data[currentDivIndex].point)
    document.getElementById(currentDiv.div).style.display = 'block'
    document.getElementById('coverDiv').style.display = 'block'
    document.getElementById('locationTitle').style.display = 'none';
});}


}

function lastSection(){
    document.getElementById(currentDiv.div).style.display = 'none'
    document.getElementById('coverDiv').style.display = 'none'

    currentDivIndex -= 1;
    document.getElementById("nav").src = srcs[currentDivIndex]
    currentDiv = data[currentDivIndex]

        showPoint(data[currentDivIndex].point)

    if (currentDivIndex == 4 || currentDivIndex == 5 ){
        document.getElementById('locationTitle').textContent = currentDiv.location
        document.getElementById('locationTitle').style.display = 'block';
            map.flyTo({
            center: currentDiv.coord,
            zoom: currentDiv.zoom,
            duration: 6000
            });

    sleep(7000).then(() => {        
        hidePoint(data[currentDivIndex].point)
        document.getElementById(currentDiv.div).style.display = 'block'
        document.getElementById('coverDiv').style.display = 'block'
        document.getElementById('locationTitle').style.display = 'none';
        
    });
    } else {
        if (currentDivIndex != 0){
            document.getElementById('locationTitle').textContent = currentDiv.location
            document.getElementById('locationTitle').style.display = 'block';
        map.flyTo({
        center: currentDiv.coord,
        zoom: currentDiv.zoom,
        duration: 3000
        });

sleep(4000).then(() => { 
    hidePoint(data[currentDivIndex].point)
    document.getElementById(currentDiv.div).style.display = 'block'
    document.getElementById('coverDiv').style.display = 'block'
    document.getElementById('locationTitle').style.display = 'none';
});
        } else {
            document.getElementById('locationTitle').textContent = currentDiv.location
            document.getElementById('locationTitle').style.display = 'block';
            map.flyTo({
                center: [ -71.40326759970678, 41.82617573088007],
                zoom: 16,
                duration: 3000
                });
        
        sleep(4000).then(() => { 
            hidePoint(data[currentDivIndex].point)
            document.getElementById(currentDiv.div).style.display = 'block'
            document.getElementById('coverDiv').style.display = 'block'
            document.getElementById('locationTitle').style.display = 'none';
        });
        }
    }


}


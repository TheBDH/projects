document.addEventListener('DOMContentLoaded', function () {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const heraldTrendsLogo = document.getElementById("herald-trends-logo");
    
    console.log(darkModeQuery.matches ? "Dark mode is enabled" : "Light mode is enabled");
    const setThemeImage = (isDarkMode) => {
        heraldTrendsLogo.src = isDarkMode ? 'darkmodelowqualheader.png' : 'lowqualheader.png';
    };
    updateHeader(darkModeQuery)
    darkModeQuery.addEventListener('change', (e) => {
        updateHeader(e)
    });

    function updateHeader(e) {
        const darkImage = new Image();
        darkImage.src = 'darkmodelowqualheader.png';
        const lightImage = new Image();
        lightImage.src = 'lowqualheader.png';
        if (e.matches) {
            console.log("Switched to dark mode");
            heraldTrendsLogo.src = darkImage.src; // Change the image
        } else {
            console.log("Switched to light mode");
            heraldTrendsLogo.src = lightImage.src;
        }
    }
});
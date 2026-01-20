import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";


window.onload = function () {
    let parsedData = [];
    let stats = document.getElementById("stats");
    let intro = document.getElementById("intro");
    let onboarding = document.getElementById("onboarding");
    let uploadedFile;

    let labels = [
        ["Ratty;break", "Ratty;lunch", "Ratty;dinner", "Ratty;late"],
        ["Andrews;break", "Andrews;lunch", "Andrews;dinner", "Andrews;late"],
        ["V-Dub;break", "V-Dub;lunch", "V-Dub;dinner", "V-Dub;late"],
        ["Jo's;break", "Jo's;lunch", "Jo's;dinner", "Jo's;late"],
        ["Ivy;break", "Ivy;lunch", "Ivy;dinner", "Ivy;late"]];

    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyDhXPSIQPjzOMhZp2FTRQFmoUNZOBPQ1nw",
        authDomain: "diningwrapped.firebaseapp.com",
        projectId: "diningwrapped",
        storageBucket: "diningwrapped.firebasestorage.app",
        messagingSenderId: "9725082445",
        appId: "1:9725082445:web:9c7d998db3e56382911504",
        measurementId: "G-GKM7ZKPCD4"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    let summaryData = {
        crosstabs: {
            ratty: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            andrews: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            vdub: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            jos: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
            ivy: {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                lateNight: 0,
            },
        }
    };

    document.getElementById('processButton').addEventListener('click', processData);
    // Event listener for the Enter key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            processData();
        }
    });

    function processData() {
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];
        uploadedFile = file;
        if (file) {
            Papa.parse(file, {
                header: true,         // Use the first row as headers
                skipEmptyLines: true, // Skip empty lines in the CSV
                complete: function (results) {
                    parsedData = results.data;
                    console.log('Parsed Data:', results.data);

                    calcStats();
                    calcFrequency();
                    calcTimes();
                    calcDays();
                    favMealAtHall()
                    favHallForMeal();
                    favHallMeal();
                    updateText(summaryData);
                    intro.style.display = "none";
                    onboarding.style.display = "block";
                    console.log(summaryData);
                },
                error: function (error) {
                    console.error('Error parsing CSV:', error);
                    alert('An error occurred while processing the file.');
                }
            });
            // Check the file size (500KB = 500 * 1024 bytes)
            if (file.size > 100 * 1024) {
                alert("File is too large. Maximum allowed size is 100KB.");
                return;
            }
        } else {
            alert('Please select a CSV file first.');
        }
    }

    document.getElementById("file-upload").addEventListener("change", function (event) {
        const fileName = event.target.files[0] ? event.target.files[0].name : "Choose a file...";
        const label = document.querySelector("label[for='file-upload']");
        label.textContent = fileName;
    });

    function calcFrequency() {
        let rattyCount = 0;
        let andrewsCount = 0;
        let vwCount = 0;
        let josCount = 0;
        let ivyCount = 0;
        parsedData.forEach(item => {
            if (item.Description.includes("Sharpe")) {
                rattyCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.ratty.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.ratty.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.ratty.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.ratty.breakfast += 1;
                } else {
                    summaryData.crosstabs.ratty.lateNight += 1;
                }
            } else if (item.Description.includes("Andrews")) {
                andrewsCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.andrews.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.andrews.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.andrews.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.andrews.breakfast += 1;
                } else {
                    summaryData.crosstabs.andrews.lateNight += 1;
                }
            } else if (item.Description.includes("VW")) {
                vwCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.vdub.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.vdub.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.vdub.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.vdub.breakfast += 1;
                } else {
                    summaryData.crosstabs.vdub.lateNight += 1;
                }
            } else if (item.Description.includes("Josiah")) {
                josCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.jos.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.jos.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.jos.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.jos.breakfast += 1;
                } else {
                    summaryData.crosstabs.jos.lateNight += 1;
                }
            } else if (item.Description.includes("Ivy")) {
                ivyCount += 1;
                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    summaryData.crosstabs.ivy.lateNight += 1;
                } else if (hour >= 16) {
                    summaryData.crosstabs.ivy.dinner += 1;
                } else if (hour >= 11) {
                    summaryData.crosstabs.ivy.lunch += 1;
                } else if (hour >= 5) {
                    summaryData.crosstabs.ivy.breakfast += 1;
                } else {
                    summaryData.crosstabs.ivy.lateNight += 1;
                }
            }
        });
        summaryData.locationFrequency =
        {
            "Ratty": rattyCount,
            "Andrews": andrewsCount,
            "V-Dub": vwCount,
            "Jo's": josCount,
            "Ivy Room": ivyCount,
        }
        // Determine the top dining hall
        const topDiningHall = Object.keys(summaryData.locationFrequency).reduce((top, current) => {
            return summaryData.locationFrequency[current] > summaryData.locationFrequency[top]
                ? current
                : top;
        }, Object.keys(summaryData.locationFrequency)[0]);

        // Store it in summaryData
        summaryData.topDiningHall = topDiningHall;

        // Ensure mealFrequency is defined
        if (summaryData.mealFrequency && Object.keys(summaryData.mealFrequency).length > 0) {
            // Determine the top meal
            const topMeal = Object.keys(summaryData.mealFrequency).reduce((top, current) => {
                return summaryData.mealFrequency[current] > summaryData.mealFrequency[top]
                    ? current
                    : top;
            }, Object.keys(summaryData.mealFrequency)[0]);

            // Store it in summaryData
            summaryData.favMeal = topMeal;
        } else {
            console.error("mealFrequency is undefined or empty");
        }

        generatePieChart(summaryData.locationFrequency);
    }
    // Function to generate the pie chart
    function generatePieChart(locationFrequency) {
        // Extract the labels (location names) and data (frequency counts)
        const labels = Object.keys(locationFrequency);
        const data = Object.values(locationFrequency);

        const legendAlign = isMobile() ? 'top' : 'right';

        // Destroy previous chart instance if it exists (to prevent overlapping charts)
        if (window.chart) {
            window.chart.destroy();
        }

        // Create the pie chart using Chart.js
        const ctx = document.getElementById('myPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,  // Locations (ratty, andrews, etc.)
                datasets: [{
                    label: "Swipes",
                    data: data,  // Frequency of each location
                    backgroundColor: ['#ff5200', '#ff8c02', '#b285ca', '#785ef1', '#fecf03'], // Colors for the slices
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 50, // Adjust padding to move legend closer to the chart
                        left: 50
                    }
                },
                plugins: {
                    legend: {
                        position: legendAlign,
                        labels: {
                            usePointStyle: true, // Use point style for legend
                            pointStyle: 'rectRounded', // Rounded rectangles
                            padding: 20, // Padding between legend items
                            boxWidth: 20, // Width of the legend box
                            boxHeight: 20, // Height of the legend box
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} swipes`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Background color of the tooltip
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        boxPadding: 10, // Padding inside the tooltip box
                        cornerRadius: 10, // Rounded corners for the tooltip box
                        displayColors: true, // Display color boxes in the tooltip
                        boxWidth: 20, // Width of the color box
                        boxHeight: 20, // Height of the color box
                        boxRadius: 10, // Rounded corners for the color box
                        usePointStyle: true,
                        callbacks: {
                            labelPointStyle: function (context) {
                                return {
                                    pointStyle: 'rectRounded', // Use rounded rectangle for the color box
                                    rotation: 0, // Ensure no rotation
                                };
                            }
                        }
                    }

                }
            }
        });
    }

    function calcTimes() {
        const swipeCounts = new Array(24).fill(0); // Array to hold swipe counts for each hour
        parsedData.forEach(item => {
            const timestamp = item.Date;
            if (!item.Description.includes("Reset") && !item.Description.includes("Deposit") && !item.Description.includes("Concessions") && !item.Description.includes("Revoke")) {
                if (timestamp) {
                    const hour = new Date(timestamp).getHours(); // Extract the hour (0-23)
                    swipeCounts[hour]++; // Increment the swipe count for that hour
                }
            }
        });

        // Shift data by 6 hours to start at 6 AM
        const shiftedData = swipeCounts.slice(6).concat(swipeCounts.slice(0, 6));

        // Labels for hours in AM/PM format starting at 6 AM
        const labels = [
            "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
            "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
            "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",
            "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM"
        ];

        drawBarChart(shiftedData, labels, 'timeBarChart', 'timeChart', "Swipes");
    }

    function calcDays() {
        const swipeCounts = new Array(7).fill(0); // Array for counting swipes for each day (Sunday to Saturday)

        // Loop through each row in the CSV
        parsedData.forEach(item => {
            const dateStr = item.Date;
            if (!item.Description.includes("Reset") && !item.Description.includes("Deposit") && !item.Description.includes("Concessions") && !item.Description.includes("Revoke")) {
                if (dateStr) {
                    const dayOfWeek = new Date(dateStr).getDay(); // Get day of the week (0 = Sunday, 6 = Saturday)
                    swipeCounts[dayOfWeek]++; // Increment count for the corresponding day
                }
            }
        });

        // Labels for days of the week
        const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        drawBarChart(swipeCounts, labels, 'daysBarChart', 'dayChart', "Swipes");
    }

    function drawBarChart(swipeCounts, labels, canvasID, chartVarName, title) {
        // Check if chartVarName is provided
        if (!chartVarName) {
            console.error('Chart variable name must be provided');
            return;
        }

        const ctx = document.getElementById(canvasID).getContext('2d');

        // Store charts in a dedicated object instead of directly on window
        if (!window.chartInstances) {
            window.chartInstances = {};
        }

        // Destroy previous chart instance if it exists
        if (window.chartInstances[chartVarName]) {
            window.chartInstances[chartVarName].destroy();
        }

        Chart.defaults.font.family = 'Roboto', "sans-serif";
        Chart.defaults.color = "#000000";

        // Create a new bar chart
        window.chartInstances[chartVarName] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: swipeCounts,
                    backgroundColor: '#785ef1',
                    borderColor: '#ffffffff',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 10, // Adjust padding to move legend closer to the chart
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                        labels: {
                            usePointStyle: true, // Use point style for legend
                            pointStyle: 'rectRounded', // Rounded rectangles
                            padding: 10, // Reduce padding between legend items
                            boxWidth: 20, // Width of the legend box
                            boxHeight: 20, // Height of the legend box
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} swipes`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Background color of the tooltip
                        titleFont: {
                            size: 15,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        boxPadding: 10, // Padding inside the tooltip box
                        cornerRadius: 10, // Rounded corners for the tooltip box
                        displayColors: true, // Display color boxes in the tooltip
                        boxWidth: 20, // Width of the color box
                        boxHeight: 20, // Height of the color box
                        boxRadius: 10, // Rounded corners for the color box
                        usePointStyle: true,
                        callbacks: {
                            labelPointStyle: function (context) {
                                return {
                                    pointStyle: 'rectRounded', // Use rounded rectangle for the color box
                                    rotation: 0, // Ensure no rotation
                                };
                            }
                        }
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Swipes'
                        }
                    }
                }
            }
        });
    }

    function calcStats() {
        let weeks = 0;
        let swipes = 0;
        let breakfast = 0;
        let lunch = 0;
        let dinner = 0;
        let lateNight = 0;
        parsedData.forEach(item => {
            if (item.Description.includes("Reset")) {
                weeks += 1;
            } else if (!item.Description.includes("Deposit") && !item.Description.includes("Concessions") && !item.Description.includes("Revoke")) {
                swipes += 1;

                // calculating meals by time
                const timestamp = item.Date;
                const hour = new Date(timestamp).getHours();
                if (hour >= 20) {
                    lateNight += 1;
                } else if (hour >= 16) {
                    dinner += 1;
                } else if (hour >= 11) {
                    lunch += 1;
                } else if (hour >= 5) {
                    breakfast += 1;
                } else {
                    lateNight += 1;
                }
            }

        });
        if (weeks == 0) {
            weeks = 16;
        }
        let swipesPerWeek = (swipes / weeks).toFixed(1)
        let breakfastPerWeek = (breakfast / weeks).toFixed(1)
        let lunchPerWeek = (lunch / weeks).toFixed(1)
        let dinnerPerWeek = (dinner / weeks).toFixed(1)
        let snackPerWeek = (lateNight / weeks).toFixed(1)
        summaryData.mealFrequency =
        {
            "Breakfast": breakfast,
            "Lunch": lunch,
            "Dinner": dinner,
            "Late Night": lateNight,
        };
        summaryData.weeks = weeks;
        // updateStats("Swipes per week: " + swipesPerWeek.toString() + "\n" +
        //     "Breakfasts per week: " + breakfastPerWeek + "\n"
        //     + "Lunches per week: " + lunchPerWeek + "\n" + "Dinners per week: " +
        //     dinnerPerWeek + "\n" + "Late night snacks per week: " + snackPerWeek);
        summaryData.swipesPerWeek = swipesPerWeek;
    }

    function updateStats(stats) {
        const statsOutput = document.getElementById('statsOutput');
        statsOutput.innerHTML = stats;
    }

    function favMealAtHall() {
        const hallMaxMeals = {};

        for (const hall in summaryData.crosstabs) {
            const mealCounts = summaryData.crosstabs[hall];
            const maxMeal = Object.entries(mealCounts).reduce((max, [meal, count]) => {
                return count > max.count ? { meal, count } : max;
            }, { meal: '', count: -Infinity });

            hallMaxMeals[hall] = maxMeal;
        }

        summaryData.favMealAtHall = hallMaxMeals;
    }

    function favHallForMeal() {
        const mealToDiningHall = {
            breakfast: { hall: '', count: -Infinity },
            lunch: { hall: '', count: -Infinity },
            dinner: { hall: '', count: -Infinity },
            lateNight: { hall: '', count: -Infinity }
        };

        for (const meal of ['breakfast', 'lunch', 'dinner', 'lateNight']) {
            for (const hall in summaryData.crosstabs) {
                const count = summaryData.crosstabs[hall][meal];
                if (count > mealToDiningHall[meal].count) {
                    mealToDiningHall[meal] = { hall, count };
                }
            }
        }

        summaryData.favHallForMeal = mealToDiningHall;
    }

    // calculates the single most common meal and dining hall combination
    function favHallMeal() {
        let maxCount = 0;
        let favMeal = "";
        let favHall = "";

        // Ensure summaryData.crosstabs is defined
        if (!summaryData.crosstabs) {
            console.error("summaryData.crosstabs is undefined");
            return;
        }

        // Iterate over the nested structure
        for (const hall in summaryData.crosstabs) {
            for (const meal in summaryData.crosstabs[hall]) {
                const count = summaryData.crosstabs[hall][meal];

                if (count > maxCount) {
                    maxCount = count;
                    favMeal = meal;
                    favHall = hall;
                }
            }
        }

        summaryData.favHallMeal = {
            hall: favHall,
            meal: favMeal
        };
    }

    document.getElementById('shareSiteButton').addEventListener('click', function () {
        if (navigator.share) {
            navigator.share({
                title: 'Brown Dining Wrapped',
                text: 'Check out Dining Wrapped!',
                url: 'https://diningwrapped.calebellenberg.com'
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch((error) => {
                console.error('Error sharing:', error);
            });
        } else {
            // Fallback for browsers that do not support the Web Share API
            alert('Web Share API is not supported in your browser. Please copy the URL manually: https://diningwrapped.calebellenberg.com');
        }
    });

    document.getElementById('shareResultsButton').addEventListener('click', function () {
        const statsOutput = document.getElementById('charts-grid-wrapper');

        html2canvas(statsOutput).then(canvas => {
            canvas.toBlob(blob => {
                const file = new File([blob], 'stats.png', { type: 'image/png' });

                if (navigator.share) {
                    navigator.share({
                        title: 'Brown Dining Wrapped Results',
                        text: 'Check out my dining stats!',
                        files: [file]
                    }).then(() => {
                        console.log('Thanks for sharing!');
                    }).catch((error) => {
                        console.error('Error sharing:', error);
                    });
                } else {
                    // Fallback for browsers that do not support the Web Share API
                    const url = URL.createObjectURL(file);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'stats.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    alert('Web Share API is not supported in your browser. The image has been downloaded.');
                }
            });
        }).catch(error => {
            console.error('Error capturing screenshot:', error);
        });
    });

    // Function to check if the user is on a mobile device
    function isMobile() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    const questionPage1 = this.document.getElementById("questionPage1");
    const questionPage2 = this.document.getElementById("questionPage2");
    const yesShare = this.document.getElementById("yesShare");
    const noShare = this.document.getElementById("noShare");
    const seeData = this.document.getElementById("seeData");

    yesShare.addEventListener('click', function () {
        questionPage1.style.display = "none";
        questionPage2.style.display = "flex";
    });

    noShare.addEventListener('click', function () {
        onboarding.style.display = "none";
        stats.style.display = "block";
    });

    seeData.addEventListener('click', function () {
        onboarding.style.display = "none";
        stats.style.display = "block";

        const classYearElement = document.getElementById('classYear');
        const campusElement = document.getElementById('campus');
        const mealPlanElement = document.getElementById('mealPlan');

        const classYear = classYearElement.value;
        const campus = campusElement.value;
        const mealPlan = mealPlanElement.value;

        const file = uploadedFile;
        const timestamp = new Date().getTime();
        const filePath = `bdh_uploads/file_weeklymeals_${timestamp}_${classYear}_${campus}_${mealPlan}.csv`;
        const storageRef = ref(storage, filePath);

        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('File uploaded successfully!');
        }).catch((error) => {
            console.error('Upload failed:', error);
        });
    });

    function updateText(summaryData) {
        const topDiningHallMappings = {
            "Ratty": "Refectory Regular",
            "Andrews": "Andrews Afficianado",
            "V-Dub": "V-Dub Valedictorian",
            "Ivy Room": "Ivy Idolizer",
            "Jo's": "Jo's Joyrider"
        };

        const topMealMappings = {
            "Breakfast": "Early Bird",
            "Lunch": "Consistent",
            "Dinner": "Classy",
            "Late Night": "Sleep Deprived"
        }

        const word1 = document.getElementById('word1');
        const word2 = document.getElementById('word2');
        const word3 = document.getElementById('word3');

        const colors = ['#ff5200', '#ff8c02', '#b285ca', '#785ef1'];

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        shuffle(colors);

        if (word1) word1.style.color = colors[0];
        if (word2) word2.style.color = colors[1];
        if (word3) word3.style.color = colors[2];

        let mealKey = summaryData.favMeal;
        console.log(mealKey)

        let hallKey = summaryData.topDiningHall;
        console.log(hallKey)

        if (word1 && topMealMappings[mealKey]) {
            word1.textContent = topMealMappings[mealKey];
        }

        if (word2 && topDiningHallMappings[hallKey]) {
            word2.textContent = topDiningHallMappings[hallKey];
        }

        if (word3) {
            if (summaryData.swipesPerWeek > 15) {
                word3.textContent = "Swipeaholic";
            } else if (summaryData.swipesPerWeek > 10) {
                word3.textContent = "Bidaily Diner";
            } else if (summaryData.swipesPerWeek > 5) {
                word3.textContent = "Rattymaxer";
            } else {
                word3.textContent = "Are you even on meal plan?";
            }
        }

        updateStats(
            `<span style="color:${word1.style.color}; font-weight:bold;">${word1.textContent}</span><br>` +
            `<span style="color:${word2.style.color}; font-weight:bold;">${word2.textContent}</span><br>` +
            `<span style="color:${word3.style.color}; font-weight:bold;">${word3.textContent}</span>`
        );

        const comboBox = document.getElementById("combo-box");
        console.log(comboBox)
        if (comboBox) {
            let comboMeal = mapNames(summaryData.favHallMeal.meal);
            let comboHall = mapNames(summaryData.favHallMeal.hall);
            if (!comboMeal || !comboHall) {
                comboBox.innerHTML = "Not enough data";
            } else {
                comboBox.innerHTML = `${comboMeal} at ${comboHall}`;
            }
        }

        const spotByMeal = {
            breakfast: document.querySelector('#breakfast'),
            lunch: document.querySelector('#lunch'),
            dinner: document.querySelector('#dinner'),
            lateNight: document.querySelector('#lateNight')
        };

        const mealLabels = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            lateNight: "Late night"
        };

        for (const [key, element] of Object.entries(spotByMeal)) {
            if (element) {
                let hallName = summaryData.favHallForMeal[key].hall;

                if (!hallName) {
                    hallName = "N/A";
                } else {
                    hallName = mapNames(hallName);
                }

                element.innerHTML = `<strong>${mealLabels[key]}</strong><br>${hallName}`;
                let imgSrc = "";
                let credit = "";

                if (hallName === "Andrews") {
                    imgSrc = "LianoValenzuelaAndrews.jpg";
                    credit = "Liano Valenzuela";
                } else if (hallName === "Ratty") {
                    imgSrc = "KaiolenaTacazonRatty.jpg";
                    credit = "Kaiolena Tacazon";
                } else if (hallName === "Jo's") {
                    imgSrc = "HenryWangJos.JPG";
                    credit = "Henry Wang";
                } else if (hallName === "Ivy Room") {
                    imgSrc = "KennaLeeIvyRoom.JPG";
                    credit = "Kenna Lee";
                } else if (hallName === "V-Dub") {
                    imgSrc = "EllisRougeouVDub.JPG";
                    credit = "Ellis Rougeou";
                }

                if (imgSrc) {
                    element.innerHTML += `<br><img src="img/${imgSrc}" style="width: 100%; max-width: 300px; border-radius: 4px; margin-top: 5px; margin-bottom: 5px;"><br><span style="font-size: 0.8rem; font-style: italic;">Media by ${credit}</span>`;
                }
            }
        }
    }

    function mapNames(name) {
        const nameMappings = {
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            lateNight: "Late night",

            ratty: "Ratty",
            andrews: "Andrews",
            vdub: "V-Dub",
            jos: "Jo's",
            ivy: "Ivy Room",

            Ratty: "Ratty",
            Andrews: "Andrews",
            "V-Dub": "V-Dub",
            "Jo's": "Jo's",
            Ivy: "Ivy Room"
        };

        return nameMappings[name] || name.charAt(0).toUpperCase() + name.slice(1);
    }

};
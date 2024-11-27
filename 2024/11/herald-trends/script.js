document.addEventListener('DOMContentLoaded', function () {
    const processButton = document.getElementById('process-button');
    const clearButton = document.getElementById('clear-button');
    const smoothingBox = document.getElementById('smoothing-checkbox');
    const warningMessage = document.getElementById('warning-message');
    const loadingBar = document.getElementById('loading-bar');
    const word1 = document.getElementById('word1');
    const word2 = document.getElementById('word2');
    const word3 = document.getElementById('word3');
    const word4 = document.getElementById('word4');
    let alldata;
    let foundYearsList;

    // handling smoothing
    var smoothing;
    var fullDataLoaded = false;

    // Create a loading bar element
    loadingBar.style.width = '40%';
    loadingBar.style.background = '#f3f3f3';
    loadingBar.style.border = '0px solid #6e6d6d';
    loadingBar.style.height = '15px';
    loadingBar.style.position = 'relative';
    loadingBar.style.marginLeft = '30%';
    loadingBar.style.marginTop = '15';
    loadingBar.style.borderRadius = '4px';

    const progress = document.createElement('div');
    progress.style.width = '0%';
    progress.style.height = '100%';
    progress.style.background = '#f53b3b';
    progress.style.borderRadius = '4px';
    progress.style.transition = 'width 0.2s ease';
    loadingBar.appendChild(progress);

    warningMessage.textContent = "Loading word frequency data...";
    warningMessage.style.display = 'block';
    fetch('https://dl.dropboxusercontent.com/scl/fi/g8lrj4ng8az0bodgv9n16/top_1_2_freq_dict.zip?rlkey=3ku8x83zd7rccgxwxwgi7rk8p&st=a2crejdo&dl=0')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const estimatedTotal = 10 * 1024 * 1024; // Estimate 110MB as total size
            let loaded = 0;

            return new Response(
                new ReadableStream({
                    start(controller) {
                        function read() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                loaded += value.length;
                                const percent = Math.min((loaded / estimatedTotal) * 100, 100);
                                progress.style.width = `${percent.toFixed(2)}%`;
                                controller.enqueue(value);
                                read();
                            }).catch(err => {
                                console.error('Error reading stream:', err);
                                controller.error(err);
                            });
                        }
                        read();
                    }
                })
            ).blob();
        })
        .then(blob => {
            // Step 2: Use JSZip to process the ZIP file
            console.log("Unzipping small file...");
            return JSZip.loadAsync(blob);
        })
        .then(zip => {
            // Step 3: Find and extract the JSON file
            console.log("Processing unzipped file");
            const jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));
            if (!jsonFileName) {
                throw new Error('No JSON file found in the ZIP.');
            }
            return zip.files[jsonFileName].async('string');
        })
        .then(jsonContent => {
            // Step 4: Parse and process the JSON data
            const data = JSON.parse(jsonContent);
            alldata = processData(data);
            console.log('Smaller top data file loaded successfully');
            smoothing = false;
            progress.style.width = '100%'; // Ensure progress bar completes
            setTimeout(() => {
                loadingBar.style.display = 'none'; // Hide the loading bar after a delay
                warningMessage.style.display = 'none'; // Hide the warning message after the same delay
            }, 200);
        })
        .catch(error => console.error('Error loading JSON:', error));

    fetch('https://dl.dropboxusercontent.com/scl/fi/xicyhvg2fe726geimpkqk/1_2_freq_dict.zip?rlkey=6rcrd8tgyajvloor8djttzfa2&st=xbu7x0w0&dl=0')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const estimatedTotal = 60 * 1024 * 1024; // Estimate 60MB as total size
            let loaded = 0;

            return new Response(
                new ReadableStream({
                    start(controller) {
                        function read() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                loaded += value.length;
                                const percent = Math.min((loaded / estimatedTotal) * 100, 100);
                                // progress.style.width = `${percent.toFixed(2)}%`;
                                controller.enqueue(value);
                                read();
                            }).catch(err => {
                                console.error('Error reading stream:', err);
                                controller.error(err);
                            });
                        }
                        read();
                    }
                })
            ).blob();
        })
        .then(blob => {
            // Step 2: Use JSZip to process the ZIP file
            console.log("Unzipping large file...");
            return JSZip.loadAsync(blob);
        })
        .then(zip => {
            // Step 3: Find and extract the JSON file
            console.log("Processing unzipped file");
            const jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));
            if (!jsonFileName) {
                throw new Error('No JSON file found in the ZIP.');
            }
            return zip.files[jsonFileName].async('string');
        })
        .then(jsonContent => {
            // Step 4: Parse and process the JSON data
            const data = JSON.parse(jsonContent);
            alldata = processData(data);
            console.log('Full data loaded successfully');
            smoothing = false;
            fullDataLoaded = true;
        })
        .catch(error => console.error('Error loading JSON:', error));

    const colorPalette = [
        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', 'red', 'blue', 'green', 'orange', 'purple', 'pink', 'cyan', 'yellow', 'brown', 'grey'
    ];
    var word1val = ""
    var word2val = ""
    var word3val = ""
    var word4val = ""
    processButton.addEventListener('click', processGraph)

    // Execute a function when the user presses a key on the keyboard
    document.addEventListener("keypress", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            processGraph()
            document.activeElement.blur();
        }
    });

    function anyWords() {
        const word1val = word1.value
        const word2val = word2.value
        const word3val = word3.value
        const word4val = word4.value
        const wordList = []
        if (word1val != "") {
            wordList.push(word1val)
        }
        if (word2val != "") {
            wordList.push(word2val)
        }
        if (word3val != "") {
            wordList.push(word3val)
        }
        if (word4val != "") {
            wordList.push(word4val)
        }
        console.log(wordList)
        return (wordList.length != 0)
    }

    function processGraph() {
        console.log("Processing...");
        const word1ogval = word1.value
        const word2ogval = word2.value
        const word3ogval = word3.value
        const word4ogval = word4.value
        word1val = cleanWord(word1ogval)
        word2val = cleanWord(word2ogval)
        word3val = cleanWord(word3ogval)
        word4val = cleanWord(word4ogval)
        const ogvals = [{ clean: word1val, og: word1ogval, index: 0 }, { clean: word2val, og: word2ogval, index: 1 }, { clean: word3val, og: word3ogval, index: 2 }, { clean: word4val, og: word4ogval, index: 3 }];
        wordList = []
        if (word1val != "") {
            wordList.push(word1val)
        }
        if (word2val != "") {
            wordList.push(word2val)
        }
        if (word3val != "") {
            wordList.push(word3val)
        }
        if (word4val != "") {
            wordList.push(word4val)
        }
        if (wordList.length == 0) {
            raiseNoWords()
        } else if (alldata == undefined) {
            raiseStillDownloading()
        } else {
            hideWarnings()
            var unknownWordsList = unknownWords(wordList)
            console.log(unknownWordsList)
            if (unknownWordsList.length == 0) {
                plotGraph(wordList, ogvals);
                currentChart.update()
            } else {
                raiseUnknownWord(unknownWordsList, ogvals);
            }
        }
    };

    smoothingBox.addEventListener('change', (event) => {
        if (event.target.checked) {
            console.log("Smoothing enabled");
            smoothing = true
        } else {
            console.log("Smoothing disabled");
            smoothing = false
        }
        if (anyWords()) {
            processGraph()
        } else {
            currentChart.destroy()
        }
    });

    clearButton.addEventListener('click', () => {
        word1.value = "";
        word2.value = "";
        word3.value = "";
        word4.value = "";
        currentChart.destroy()
    });

    function raiseNoWords() {
        warningMessage.textContent = "Please enter at least 1 word."
        warningMessage.style.display = 'block';
    }

    function raiseStillDownloading() {
        warningMessage.textContent = "Sorry—frequency data is still downloading."
        warningMessage.style.display = 'block';
    }

    function raiseUnknownWord(wordsUnknown, originalWords) {
        const word0 = originalWords.find(item => wordsUnknown[0] === item.clean)
        const word1 = originalWords.find(item => wordsUnknown[1] === item.clean)
        const word2 = originalWords.find(item => wordsUnknown[2] === item.clean)
        const word3 = originalWords.find(item => wordsUnknown[3] === item.clean)
        let addition;
        if (fullDataLoaded) {
            addition = "";
        } else {
            addition = "<br>The full data is still loading. Try again in a minute or two!";
        }
        if (wordsUnknown.length == 1) {
            warningMessage.innerHTML = "Sorry—we haven't yet indexed the word \"" + word0.og + "\"." + addition;
        } else if (wordsUnknown.length == 2) {
            warningMessage.innerHTML = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\" and \"" + word1.og + "\"." + addition;
        } else if (wordsUnknown.length == 3) {
            warningMessage.innerHTML = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\", \"" + word1.og + "\", and \"" + word2.og + "\"." + addition;
        } else if (wordsUnknown.length == 4) {
            warningMessage.innerHTML = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\", \"" + word1.og + "\", \"" + word2.og + "\", and \"" + word3.og + "\"." + addition;
        }
        warningMessage.style.display = 'block';
    }

    function hideWarnings() {
        warningMessage.style.display = 'none';
    }

    function unknownWords(listOfWords) {
        var wordsNotFound = []
        listOfWords.forEach((word) => {
            if (alldata.some(item => item.word === word)) {
                console.log(`${word} is in the json.`);
            } else {
                wordsNotFound.push(word)
                console.log(`${word} is not in the json.`);
            }
        });
        return wordsNotFound
    }

    function cleanWord(word) {
        const normalizeApostrophes = (str) => str.replace(/[\u2018\u2019\u201B\u2032\u02BC]/g, "'");
        return normalizeApostrophes(word
            .toLowerCase() // Convert to lowercase
            .replace(/[.\-]/g, '') // Remove periods and dashes
            .trim()); // Remove spaces at the start and end
    }

    document.getElementById('inspiration-1').onclick = makeFromPreview1;

    function makeFromPreview1() {
        makeFromPreview(["Ratty", "Sharpe Refectory"])
    }

    document.getElementById('inspiration-2').onclick = makeFromPreview2;

    function makeFromPreview2() {
        makeFromPreview(["Political Science", "Psychology", "Computer Science"])
    }

    document.getElementById('inspiration-3').onclick = makeFromPreview3;

    function makeFromPreview3() {
        makeFromPreview(["Bears", "Bruins", "Bruno", "Brunonian"])
    }

    function makeFromPreview(words) {
        if (words.length > 0) {
            word1.value = words[0]
        } else {
            word1.value = ""
        }
        if (words.length > 1) {
            word2.value = words[1]
        } else {
            word2.value = ""
        }
        if (words.length > 2) {
            word3.value = words[2]
        } else {
            word3.value = ""
        }
        if (words.length > 3) {
            word4.value = words[3]
        } else {
            word4.value = ""
        }
        processGraph()
    }

    function processData(data) {
        // Initialize an array to hold word data for graphing
        let processedData = [];

        // Extract years from the first word (assuming all words have the same years)
        foundYearsList = Object.keys(data[Object.keys(data)[0]]); // Get years from the first word
        // Iterate over each word in the data
        Object.keys(data).forEach(word => {
            const frequencies = Object.values(data[word]); // Get the frequency values for the current word
            processedData.push({ word, frequencies });
        });
        return processedData
    }

    let currentChart = null; // Keep track of the current chart instance

    function plotGraph(wordsToPlot, originalWords) {
        // Filter the alldata to only include the specified words

        function findNthOccurrence(list, item, n) {
            let count = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].clean == item) {
                    if (count == n) return list[i]; // Return index of nth occurrence
                    count++;
                }
            }
            return -1; // Not found
        };

        const countOccurrencesFiltered = (list, item) =>
            list.reduce((count, current) => count + (current.clean == item ? 1 : 0), 0);

        const filteredData = []
        wordsToPlot.forEach((word) => {
            const match = alldata.find(item => word === item.word);
            /*
            const ogword = originalWords.find(item => word === item.clean).og
            const ogindex = originalWords.find(item => word === item.clean).index*/
            const ogItem = findNthOccurrence(originalWords, word, countOccurrencesFiltered(filteredData, word));
            if (match) filteredData.push({ word: ogItem.og, frequencies: match.frequencies, index: ogItem.index, clean: word });
        });
        console.log(filteredData);

        // Check if filteredData is empty or not
        if (filteredData.length === 0) {
            console.log('No matching words found for plotting.');
            return;
        }

        // Destroy the previous chart if it exists
        if (currentChart !== null) {
            currentChart.destroy();
        }

        // List of years that exist in your dataset
        const yearsList = foundYearsList;
        console.log('Existing years in dataset:', yearsList);

        // Set up the data for Chart.js
        const chartData = {
            labels: yearsList, // Use the existing years for the x-axis
            datasets: [] // To hold multiple datasets for each word
        };

        let allFrequencies = []; // Store all frequencies for y-axis scaling
        console.log(filteredData);
        // Prepare the data for plotting each word
        filteredData.forEach((item) => {
            const in_frequencies = Object.values(item.frequencies);
            var frequencies;
            if (smoothing) {
                frequencies = smoothFrequencies(in_frequencies)
            } else {
                frequencies = in_frequencies
            }
            console.log(`Processing word: ${item.word}, frequencies: ${frequencies}`);
            const lineColor = colorPalette[item.index];

            // Add this word's data to the chartData
            chartData.datasets.push({
                label: item.word, // Set the label to the word
                data: frequencies, // The frequency data for the word
                borderColor: lineColor, // Set the color for this line
                backgroundColor: hexToRGBA(lineColor, 1), // Light color fill for the area under the line
                fill: false, // Fill the area under the line
                borderCapStyle: "round",
                tension: 0.01,
                pointRadius: 0,
                pointHitRadius: 6
            });

            // Collect all frequencies for scaling the y-axis
            allFrequencies = allFrequencies.concat(frequencies);
        });

        // Calculate the y-axis scale based on all frequencies
        const maxFreq = Math.max(...allFrequencies);  // Get the highest frequency
        const minFreq = Math.min(...allFrequencies);  // Get the lowest frequency

        // Calculate step size based on maxFreq and minFreq
        const stepSize = Math.ceil((maxFreq - minFreq) / 10); // 10 steps for the y-axis

        // Set minimum and maximum y-axis values
        const suggestedMax = maxFreq; // Set the max value a bit higher than maxFreq
        const suggestedMin = 0; // Never allow negative values

        var showScales;
        var axisFontSize;
        if (isMobile()) {
            axisFontSize = 10;
            showScales = false;
            console.log("User is on a mobile device.");
        } else {
            axisFontSize = 14;
            showScales = true
            console.log("User is not on a mobile device.");
        };

        // Check for dark mode
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set label color based on dark mode
        const labelColor = isDarkMode ? 'rgba(238, 238, 238, 1)' : 'rgba(51, 51, 51, 1)';
        const tooltipBorderColor = isDarkMode ? 'rgba(238, 238, 238, 0.4)' : 'rgba(51, 51, 51, 0.4)';
        const tooltipFillColor = isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.78)';
        const gridLineColor = isDarkMode ? 'rgba(230, 230, 230, 0.15)' : Chart.defaults.borderColor;

        // Create the new chart
        const ctx = document.getElementById('myGraph').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line', // Set the graph type to line chart
            data: chartData, // Use the prepared chartData
            options: {
                responsive: true, // Make the chart responsive
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years (1891-2024)', // Label for the x-axis
                            color: labelColor,
                            font: {
                                size: axisFontSize,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        ticks: {
                            display: showScales,
                            autoSkip: true, // Automatically skip ticks to avoid overlap
                            maxTicksLimit: 20, // Limit number of ticks to fit the graph nicely
                            color: labelColor,
                            font: {
                                size: axisFontSize - 4,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        grid: {
                            color: gridLineColor, // X-axis grid line color
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency Per 10K Words', // Label for the y-axis
                            color: labelColor,
                            font: {
                                size: axisFontSize,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        ticks: {
                            display: showScales,
                            color: labelColor,
                            font: {
                                size: axisFontSize - 4,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        grid: {
                            color: gridLineColor, // Y-axis grid line color
                        },
                        suggestedMin: suggestedMin, // Never allow negative values
                        suggestedMax: suggestedMax, // Dynamic max value
                        stepSize: stepSize // Set the interval based on data range
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            // This more specific font property overrides the global property
                            color: labelColor,
                            boxWidth: 8,
                            boxHeight: 8,
                            borderRadius: 0.5,
                            useBorderRadius: true,
                            padding: 15,
                            font: {
                                size: axisFontSize - 2,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        enabled: true, // Enable/disable the tooltip
                        backgroundColor: tooltipFillColor, // Background color
                        titleColor: '#ffffff', // Title font color
                        bodyColor: '#ffffff', // Body font color
                        borderColor: tooltipBorderColor, // Border color
                        borderWidth: 2, // Border width
                        titleFont: {
                            family: "'Roboto', 'Helvetica', 'Arial', sans-serif", // Title font family
                            size: 12 // Title font size
                        },
                        bodyFont: {
                            family: "'Roboto', 'Helvetica', 'Arial', sans-serif", // Body font family
                            size: 12, // Body font size
                        },
                        padding: 8, // Padding around tooltip
                        caretSize: 6, // Size of the caret (triangle pointer)
                        cornerRadius: 6, // Tooltip corner radius
                        displayColors: true, // Show dataset color box
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

    function smoothFrequencies(frequencies) {
        const smoothed_frequencies = []
        frequencies.forEach((item, index) => {
            var smoothed_frequency;
            if (index == 0) {
                smoothed_frequency = (item + (frequencies[1] * 0.4) + (frequencies[2] * 0.2)) / 1.6;
            } else if (index == 1) {
                smoothed_frequency = ((frequencies[0] * 0.4) + item + (frequencies[1] * 0.4) + (frequencies[2] * 0.2)) / 2;
            } else if (index == (frequencies.length - 2)) {
                smoothed_frequency = ((frequencies[index - 2] * 0.2) + (frequencies[index - 1] * 0.4) + item + (frequencies[index + 1] * 0.4)) / 2;
            } else if (index == (frequencies.length - 1)) {
                smoothed_frequency = ((frequencies[index - 2] * 0.2) + (frequencies[index - 1] * 0.4) + item) / 1.6;
            } else {
                smoothed_frequency = ((frequencies[index - 2] * 0.2) + (frequencies[index - 1] * 0.4) + item + (frequencies[index + 1] * 0.4) + (frequencies[index + 2] * 0.2)) / 2.2;
            }
            smoothed_frequencies.push(smoothed_frequency)
        });
        return smoothed_frequencies;
    }

    function hexToRGBA(hex, transparency) {
        // Ensure valid hex format
        const validHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        const result = validHex.exec(hex);
        if (!result) throw new Error('Invalid hex color');

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${transparency})`;
    }




    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const heraldTrendsLogo = document.getElementById("herald-trends-logo");

    // Initial check
    console.log(darkModeQuery.matches ? "Dark mode is enabled" : "Light mode is enabled");
    const setThemeImage = (isDarkMode) => {
        heraldTrendsLogo.src = isDarkMode ? 'darkmodelowqualheader.png' : 'lowqualheader.png';
    };
    updateHeader(darkModeQuery)

    // Listen for changes
    darkModeQuery.addEventListener('change', (e) => {
        updateHeader(e)
        const newColor = e.matches ? 'rgba(255, 255, 255, 1)' : 'rgba(51, 51, 51, 1)';
        const gridLineColor = e.matches ? 'rgba(230, 230, 230, 0.15)' : Chart.defaults.borderColor;
        const tooltipBorderColor = e.matches ? 'rgba(238, 238, 238, 0.4)' : 'rgba(51, 51, 51, 0.4)';
        const tooltipFillColor = e.matches ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.78)';

        currentChart.options.scales.x.title.color = newColor;
        currentChart.options.scales.x.ticks.color = newColor;
        currentChart.options.scales.x.grid.color = gridLineColor;
        currentChart.options.scales.y.title.color = newColor;
        currentChart.options.scales.y.ticks.color = newColor;
        currentChart.options.scales.y.grid.color = gridLineColor;
        currentChart.options.plugins.legend.labels.color = newColor;

        currentChart.options.plugins.tooltip.backgroundColor = tooltipFillColor;
        currentChart.options.plugins.tooltip.borderColor = tooltipBorderColor;


        currentChart.update(); // Update the chart to apply the new color
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

function isMobile() {
    return window.innerWidth <= 768; // Adjust threshold as needed
}


document.addEventListener('DOMContentLoaded', function () {
    let alldata;
    let foundYearsList;
    fetch('https://dl.dropboxusercontent.com/scl/fi/eebzxfqgz67x59c2idzba/wordfreq.json?rlkey=0q4fbnnneo3gy8prbat67ov58&st=cr5951v6&dl=0')
        .then(response => response.json())
        .then(data => {
            alldata = processData(data)
        })
        .catch(error => console.error('Error loading JSON:', error));
    const processButton = document.getElementById('process-button');
    const warningMessage = document.getElementById('warning-message');
    const word1 = document.getElementById('word1');
    const word2 = document.getElementById('word2');
    const word3 = document.getElementById('word3');
    const word4 = document.getElementById('word4');
    const colorPalette = [
        'red', 'blue', 'green', 'orange', 'purple', 'pink', 'cyan', 'yellow', 'brown', 'grey'
    ];
    var word1val = ""
    var word2val = ""
    var word3val = ""
    var word4val = ""
    processButton.addEventListener('click', function () {
        console.log("Processing...");
        const word1ogval = word1.value
        const word2ogval = word2.value
        const word3ogval = word3.value
        const word4ogval = word4.value
        word1val = cleanWord(word1ogval)
        word2val = cleanWord(word2ogval)
        word3val = cleanWord(word3ogval)
        word4val = cleanWord(word4ogval)
        const ogvals = [{clean: word1val, og: word1ogval}, {clean: word2val, og: word2ogval}, {clean: word3val, og: word3ogval}, {clean: word4val, og: word4ogval}];
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
            } else {
                raiseUnknownWord(unknownWordsList, ogvals);
            }
        }
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
        if (wordsUnknown.length == 1) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the word \"" + word0.og + "\".";
        } else if (wordsUnknown.length == 2) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\" and \"" + word1.og + "\".";
        } else if (wordsUnknown.length == 3) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\", \"" + word1.og + "\", and \"" + word2.og + "\".";
        } else if (wordsUnknown.length == 4) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + word0.og
                + "\", \"" + word1.og + "\", \"" + word2.og + "\", and \"" + word3.og + "\".";
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
        return word
            .toLowerCase() // Convert to lowercase
            .replace(/[.\-]/g, '') // Remove periods and dashes
            .trim(); // Remove spaces at the start and end
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

    function lookupWord(word, alldata) {
        const wordData = alldata.find(item => item.word === word);  // Find the word data
        if (wordData) {
            console.log(`Frequencies for ${word}:`, wordData.frequencies);
            // Do something with wordData.frequencies, e.g., plot or display it
            return wordData.frequencies
        } else {
            console.log(`Word not found: ${word}`);
            return []
        }
    }

    function processWords(listOfWords) {
        console.log("BAD")
        return listOfWords
    }

    let currentChart = null; // Keep track of the current chart instance

    function plotGraph(wordsToPlot, originalWords) {
        // Filter the alldata to only include the specified words
        
        const filteredData = []
        wordsToPlot.forEach((word, index) => {
            const match = alldata.find(item => word === item.word);
            ogword = originalWords.find(item => word === item.clean).og
            if (match) filteredData.push({word: ogword, frequencies: match.frequencies});
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
        filteredData.forEach((item, index) => {
            const frequencies = Object.values(item.frequencies);
            console.log(`Processing word: ${item.word}, frequencies: ${frequencies}`);
            /*
            // Ensure frequencies array has data for all years in the yearsList
            const yearData = yearsList.map(year => {
                const idx = years.indexOf(year.toString()); // Make sure to match string-based years
                console.log(idx)
                return idx !== -1 ? frequencies[idx] : 0; // Use 0 if the year is missing from the data
            });*/
            const lineColor = colorPalette[index];
            // Debug: Log the yearData to check if it aligns with the expected data
            //console.log(`Year data for ${item.word}:`, yearData);

            // Add this word's data to the chartData
            chartData.datasets.push({
                label: item.word, // Set the label to the word
                data: frequencies, // The frequency data for the word
                borderColor: lineColor, // Set the color for this line
                backgroundColor: `rgba(${hexToRgb(lineColor)}, 0.2)`, // Light color fill for the area under the line
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
        
        var axisFontSize;
        if (isMobile()) {
            axisFontSize = 10;
            console.log("User is on a mobile device.");
        } else {
            axisFontSize = 14;
            console.log("User is not on a mobile device.");
        };

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
                            color: 'rgba(51, 51, 51, 1)',
                            font: {
                                size: axisFontSize,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        ticks: {
                            autoSkip: true, // Automatically skip ticks to avoid overlap
                            maxTicksLimit: 20, // Limit number of ticks to fit the graph nicely
                            color: 'rgba(51, 51, 51, 1)',
                            font: {
                                size: axisFontSize - 4,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency (per 10,000 words)', // Label for the y-axis
                            color: 'rgba(51, 51, 51, 1)',
                            font: {
                                size: axisFontSize,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        ticks: {
                            color: 'rgba(51, 51, 51, 1)',
                            font: {
                                size: axisFontSize - 4,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
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
                            color: 'rgba(51, 51, 51, 1)',
                            font: {
                                size: axisFontSize - 2,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        }
                    }
                }
            }
        });
    }

    // Helper function to convert color name to rgba for backgroundColor
    function hexToRgb(hex) {
        // Simple conversion for common colors (you can extend this function for more colors)
        const colors = {
            red: '255, 0, 0',
            blue: '0, 0, 255',
            green: '0, 255, 0',
            orange: '255, 165, 0',
            purple: '128, 0, 128',
            pink: '255, 192, 203',
            cyan: '0, 255, 255',
            yellow: '255, 255, 0',
            brown: '139, 69, 19',
            grey: '128, 128, 128'
        };
        return colors[hex] || '0, 0, 0'; // Fallback to black if unknown color
    }






});

function isMobile() {
    return window.innerWidth <= 768; // Adjust threshold as needed
}


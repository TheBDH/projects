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
        word1val = word1.value
        word2val = word2.value
        word3val = word3.value
        word4val = word4.value
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
                plotGraph(wordList);
            } else {
                raiseUnknownWord(unknownWordsList);
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

    function raiseUnknownWord(wordsUnknown) {
        if (wordsUnknown.length == 1) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the word \"" + wordsUnknown[0] + "\".";
        } else if (wordsUnknown.length == 2) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + wordsUnknown[0]
                + "\" and \"" + wordsUnknown[1] + "\".";
        } else if (wordsUnknown.length == 3) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + wordsUnknown[0]
                + "\", \"" + wordsUnknown[1] + "\", and \"" + wordsUnknown[2] + "\".";
        } else if (wordsUnknown.length == 4) {
            warningMessage.textContent = "Sorry—we haven't yet indexed the words \"" + wordsUnknown[0]
                + "\", \"" + wordsUnknown[1] + "\", \"" + wordsUnknown[2] + "\", and \"" + wordsUnknown[3] + "\".";
        }
        warningMessage.style.display = 'block';
    }

    function hideWarnings() {
        warningMessage.style.display = 'none';
    }

    function unknownWords(listOfWords) {
        var wordsNotFound = []
        listOfWords.forEach(word => {
            if (alldata.some(item => item.word === word)) {
                console.log(`${word} is in the json.`);
            } else {
                wordsNotFound.push(word)
                console.log(`${word} is not in the json.`);
            }
        });
        return wordsNotFound
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

    function plotGraph(wordsToPlot) {
        // Filter the alldata to only include the specified words
        
        const filteredData = []
        wordsToPlot.forEach(word => {
            const match = alldata.find(item => word === item.word);
            if (match) filteredData.push(match);
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
                fill: false // Fill the area under the line
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
                            text: 'Years' // Label for the x-axis
                        },
                        ticks: {
                            autoSkip: true, // Automatically skip ticks to avoid overlap
                            maxTicksLimit: 20 // Limit number of ticks to fit the graph nicely
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frequency' // Label for the y-axis
                        },
                        suggestedMin: suggestedMin, // Never allow negative values
                        suggestedMax: suggestedMax, // Dynamic max value
                        stepSize: stepSize // Set the interval based on data range
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


const annotationPlugin = window['chartjs-plugin-annotation'];

const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@1.4.0";
document.head.appendChild(script);
Chart.register(annotationPlugin);


document.addEventListener('DOMContentLoaded', function () {
    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();

    // Create a ScrollMagic scene for the background effect
    new ScrollMagic.Scene({
        triggerElement: '#BACKGROUND', // Ensure the correct ID selector is used
        triggerHook: 0, // Start the animation when the element is at the middle of the viewport
        duration: 0 // Infinite duration (no specific scroll distance)
    })
        .setClassToggle('body', 'hidden-background') // Add a class to the body to change the background
        .on('enter', () => console.log('ScrollMagic scene triggered: background effect applied')) // Log when the scene is triggered
        .addTo(controller); // Add the scene to the ScrollMagic controller

    Promise.all([
        fetch('summaryHousingData.json').then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }),
        fetch('groupedSummaryHousingData.json').then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
    ])
        .then(([tableData, chartData]) => {
            renderChart(chartData);
        })
        .catch(error => console.error('Error fetching the data:', error));

    function renderTable(data) {
        const roomCountsByDate = data;
        const allBuildings = new Set();

        Object.values(roomCountsByDate).forEach(buildings => {
            Object.keys(buildings).forEach(building => {
                allBuildings.add(building);
            });
        });

        const table = document.createElement('table');
        const headerRow = table.insertRow();
        headerRow.insertCell().textContent = 'Building';

        const dateTimes = Object.keys(roomCountsByDate).sort((a, b) => new Date(a) - new Date(b));
        dateTimes.forEach(dateTime => {
            const cell = headerRow.insertCell();
            cell.textContent = dateTime;
        });

        allBuildings.forEach(building => {
            const row = table.insertRow();
            row.insertCell().textContent = building;

            dateTimes.forEach(dateTime => {
                const cell = row.insertCell();
                const roomCounts = roomCountsByDate[dateTime];
                cell.textContent = roomCounts[building] ? roomCounts[building]['Total Beds'] : 0;
            });
        });

        document.body.appendChild(table);
    }

    function renderChart(data) {
        const roomCountsByDate = data;
        const allBuildings = new Set();

        Object.values(roomCountsByDate).forEach(buildings => {
            Object.keys(buildings).forEach(building => {
                allBuildings.add(building);
            });
        });

        const graphBox = document.getElementById('graph-box');
        const ctx = document.createElement('canvas');
        ctx.height = window.innerHeight * 4; // Set canvas height explicitly in pixels
        graphBox.appendChild(ctx);

        const dateTimes = Object.keys(roomCountsByDate);
        const labels = dateTimes;
        const datasets = Array.from(allBuildings).map(building => {
            const vibrantColors = [
                '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
                '#33FFF5', '#F5FF33', '#FF8C33', '#33FF8C', '#8C33FF',
                '#FF3333', '#33FF33', '#3333FF', '#FF33FF', '#33FFFF',
                '#FFFF33', '#FF6633', '#33FF66', '#6633FF', '#FF3366',
                '#66FF33', '#3366FF', '#FF9933', '#33FF99', '#9933FF'
            ];
            const color = vibrantColors[Array.from(allBuildings).indexOf(building) % vibrantColors.length];
            const initialBeds = roomCountsByDate[dateTimes[0]][building]['Total Beds'];
            return {
                label: building,
                data: labels.map(dateTime => {
                    const roomCounts = roomCountsByDate[dateTime];
                    const availableBeds = roomCounts[building] ? roomCounts[building]['Total Beds'] : 0;
                    return ((availableBeds / initialBeds) * 100).toFixed(2);
                }),
                fill: false,
                backgroundColor: color,
                borderColor: color,
                tension: 0 // Ensure lines are straight
            };
        });

        const formattedLabels = labels.map(label => {
            const [date, time] = label.split(', ');
            return [date, time];
        });

        const isMobile = window.innerWidth <= 768;
        const fontSize = isMobile ? 11 : 14;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow the chart to fill the canvas
                indexAxis: 'y', // Rotate the chart by swapping x and y axes
                scales: {
                    x: {
                        beginAtZero: true,
                        position: 'top', // Move x-axis label to the top
                        ticks: {
                            color: '#f0f0f0', // Set x-axis labels color to white
                            font: {
                                size: fontSize, // Change font size of x-axis value labels
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif" // Set font to Roboto
                            }
                        },
                        title: {
                            display: true,
                            text: document.getElementById('data-toggle').value === 'available-beds'
                                ? 'Percent of Beds Available'
                                : 'Total Beds Available',
                            color: '#f0f0f0', // Set x-axis title color to white
                            font: {
                                size: fontSize + 4,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif" // Set font to Roboto
                            }
                        }
                    },
                    y: {
                        type: 'category',
                        ticks: {
                            color: '#f0f0f0', // Set y-axis labels color to white
                            font: {
                                size: fontSize, // Change font size of y-axis value labels
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif" // Set font to Roboto
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            borderRadius: 0.5,
                            useBorderRadius: true,
                            padding: 15,
                            font: {
                                size: fontSize - 1,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif" // Set font to Roboto
                            },
                            pointStyle: 'rect',
                            color: '#f0f0f0' // Set legend text color to white
                        }
                    },
                    tooltip: {
                        enabled: true, // Enable/disable the tooltip
                        titleColor: '#ffffff', // Title font color
                        bodyColor: '#ffffff', // Body font color
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
                            label: function (context) {
                                const value = parseFloat(context.raw).toFixed(1);
                                const building = context.dataset.label;
                                const viewType = document.getElementById('data-toggle').value;
                                return viewType === 'available-beds'
                                    ? `${building}: ${value}% available`
                                    : `${building}: ${value} beds available`;
                            },
                            labelPointStyle: function (context) {
                                return {
                                    pointStyle: 'rectRounded', // Use rounded rectangle for the color box
                                    rotation: 0, // Ensure no rotation
                                };
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: window.innerWidth <= 768 ? 5 : 8 // Make lines thinner on mobile
                    },
                    point: {
                        radius: window.innerWidth <= 768 ? 4 : 6, // Make points smaller on mobile
                        hoverRadius: window.innerWidth <= 768 ? 4 : 6 // Adjust hover size on mobile
                    }
                }
            }
        });

        // Function to toggle visibility of all lines
        function toggleAllLinesVisibility() {
            let allHidden = true;

            // Toggle the hidden property for each dataset
            chart.data.datasets.forEach(dataset => {
                dataset.hidden = !dataset.hidden;
                if (!dataset.hidden) {
                    allHidden = false;
                }
            });

            // If all datasets are hidden, set the y-axis range to 0-100
            if (allHidden) {
                const viewType = document.getElementById('data-toggle').value;
                if (viewType === 'total-beds') {
                    chart.options.scales.x.min = 0;
                    chart.options.scales.x.max = 600; // Set max to 600 for total beds mode
                } else {
                    chart.options.scales.x.min = 0;
                    chart.options.scales.x.max = 100;
                }
            } else {
                chart.options.scales.x.min = undefined;
                chart.options.scales.x.max = undefined;
            }

            chart.update(); // Update the chart to reflect changes
        }

        // Fetch the toggle button from the HTML
        const toggleButton = document.getElementById('toggle-lines-button');
        toggleButton.addEventListener('click', toggleAllLinesVisibility);

        document.getElementById('data-toggle').addEventListener('change', function () {
            const viewType = this.value;
            datasets.forEach(dataset => {
                dataset.data = labels.map(dateTime => {
                    const roomCounts = roomCountsByDate[dateTime];
                    if (viewType === 'available-beds') {
                        const initialBeds = roomCountsByDate[dateTimes[0]][dataset.label]['Total Beds'];
                        const availableBeds = roomCounts[dataset.label] ? roomCounts[dataset.label]['Total Beds'] : 0;
                        return ((availableBeds / initialBeds) * 100).toFixed(2);
                    } else {
                        return roomCounts[dataset.label] ? roomCounts[dataset.label]['Total Beds'] : 0;
                    }
                });
            });
            chart.update();
        });
    }

    function handleFiltering() {
        const roomType = document.getElementById('room-type').value;
        const classYear = document.getElementById('class-year').value;
        const selectionTime = document.getElementById('selection-time').value;
        const housingPool = document.getElementById('housing-pool').value;

        // Construct the CSV link based on the selected filters
        let csvLink;
        if (classYear === "sophomore") {
            const map = {
                "10": "0920",
                "11": "1030",
                "12": "1130",
                "13": "1245",
                "14": "1245",
                "15": "1430",
                "16": "1535",
                "17": "1635",
            };
            csvLink = "10APR_" + map[selectionTime] + ".csv";
        } else {
            const map = {
                "10": "0930",
                "11": "1025",
                "12": "1125",
                "13": "1250",
                "14": "1330",
                "15": "1430",
                "16": "1530",
                "17": "1530",
            };
            csvLink = "09APR_" + map[selectionTime] + ".csv";
        }

        parseCSV('2024_Clean', csvLink, roomType, housingPool).then(curRooms => {
            parseCSV('2024_Clean', '09APR_0930.csv', roomType, housingPool).then(startRooms => {
                const totalCurrent = curRooms["Total"];
                const totalStart = startRooms["Total"];
                const totalSuites = curRooms["Total Suites"];
                const percent = ((totalCurrent / totalStart) * 100).toFixed(1);
                const percentElement = document.createElement('div');
                percentElement.style.fontSize = '2em';
                percentElement.style.fontWeight = 'bold';
                percentElement.style.textAlign = 'center';
                percentElement.style.marginBottom = '20px';

                if (percent >= 80) {
                    percentElement.style.color = '#33FF57'; // Vibrant green
                } else if (percent >= 60) {
                    percentElement.style.color = '#FFD700'; // Vibrant gold
                } else if (percent >= 40) {
                    percentElement.style.color = '#FF8C33'; // Vibrant orange
                } else if (percent >= 20) {
                    percentElement.style.color = '#FF5733'; // Vibrant red-orange
                } else {
                    percentElement.style.color = '#FF3333'; // Vibrant red
                }

                percentElement.textContent = isNaN(percent) ? "No Matching Rooms" : `${percent}% Available`;
                const percentOutput = document.getElementById('percent-output');
                percentOutput.innerHTML = ''; // Clear previous content
                percentOutput.appendChild(percentElement);
                let output = `${totalCurrent}/${totalStart} total matching rooms available (including ${totalSuites} suites)<br><br>`;

                // Sort buildings by the number of current matching rooms in descending order
                const sortedBuildings = Object.keys(curRooms)
                    .filter(building => building !== "Total" && curRooms[building]["Matching Rooms"] > 0)
                    .sort((a, b) => curRooms[b]["Matching Rooms"] - curRooms[a]["Matching Rooms"]);

                sortedBuildings.forEach(building => {
                    const current = curRooms[building]["Matching Rooms"];
                    const start = startRooms[building] ? startRooms[building]["Matching Rooms"] : 0;
                    const suites = curRooms[building]["Matching Suites"] || 0;
                    const titleCaseBuilding = building.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                    output += `${titleCaseBuilding}: ${current}/${start}`;
                    if (suites > 0) {
                        output += ` (${suites} suites)`;
                    }
                    output += `<br><br>`;
                });

                document.getElementById('filter-output').innerHTML = output;
            });
        });

        generateGraphData();

    }

    function generateGraphData() {
        const roomType = document.getElementById('room-type').value;
        const housingPool = document.getElementById('housing-pool').value;

        const csvFiles = [
            "09APR_0930.csv", "09APR_1025.csv", "09APR_1125.csv", "09APR_1250.csv",
            "09APR_1330.csv", "09APR_1430.csv", "09APR_1530.csv", "10APR_0920.csv",
            "10APR_1030.csv", "10APR_1130.csv", "10APR_1245.csv", "10APR_1430.csv",
            "10APR_1535.csv", "10APR_1635.csv", "11APR_1015.csv", "11APR_1130.csv",
            "11APR_1235.csv", "11APR_1345.csv"
        ];

        const timeMap = {
            "09APR_0930.csv": "April 9, 9:30 AM",
            "09APR_1025.csv": "April 9, 10:25 AM",
            "09APR_1125.csv": "April 9, 11:25 AM",
            "09APR_1250.csv": "April 9, 12:50 PM",
            "09APR_1330.csv": "April 9, 1:30 PM",
            "09APR_1430.csv": "April 9, 2:30 PM",
            "09APR_1530.csv": "April 9, 3:30 PM",
            "10APR_0920.csv": "April 10, 9:20 AM",
            "10APR_1030.csv": "April 10, 10:30 AM",
            "10APR_1130.csv": "April 10, 11:30 AM",
            "10APR_1245.csv": "April 10, 12:45 PM",
            "10APR_1430.csv": "April 10, 2:30 PM",
            "10APR_1535.csv": "April 10, 3:35 PM",
            "10APR_1635.csv": "April 10, 4:35 PM",
            "11APR_1015.csv": "April 11, 10:15 AM",
            "11APR_1130.csv": "April 11, 11:30 AM",
            "11APR_1235.csv": "April 11, 12:35 PM",
            "11APR_1345.csv": "April 11, 1:45 PM"
        };

        const graphData = {};

        Promise.all(csvFiles.map(file => parseCSV('2024_Clean', file, roomType, housingPool)))
            .then(results => {
                results.forEach((curRooms, index) => {
                    const fileName = csvFiles[index];
                    const time = timeMap[fileName];
                    graphData[time] = {
                        total: curRooms["Total"],
                        totalSuites: curRooms["Total Suites"],
                        buildings: {}
                    };

                    Object.keys(curRooms).forEach(building => {
                        if (building !== "Total" && building !== "Total Suites") {
                            graphData[time].buildings[building] = {
                                matchingRooms: curRooms[building]["Matching Rooms"] || 0,
                                matchingSuites: curRooms[building]["Matching Suites"] || 0
                            };
                        }
                    });
                });
                renderFilterGraph(graphData);
                console.log(graphData); // Output the graph data for debugging or further use
            })
            .catch(error => console.error('Error generating graph data:', error));
    }

    function renderFilterGraph(graphData) {
        const filterGraphBox = document.getElementById('filter-graph-box');
        filterGraphBox.innerHTML = ''; // Clear any existing content
        const canvas = document.createElement('canvas');
        canvas.height = 400; // Set canvas height explicitly
        filterGraphBox.appendChild(canvas);

        if (!graphData || Object.keys(graphData).length === 0) {
            console.error('Invalid or empty graphData provided to renderFilterGraph.');
            return;
        }

        const labels = Object.keys(graphData);

        // Prepare datasets for matching rooms and matching suites
        const matchingRoomsData = labels.map(label => graphData[label].total || 0);
        const matchingSuitesData = labels.map(label => graphData[label].totalSuites || 0);

        const vibrantColors = ['#FF33FF', '#3366FF'];

        const datasets = [
            {
                label: 'Matching Rooms',
                data: matchingRoomsData,
                fill: false,
                backgroundColor: vibrantColors[0],
                borderColor: vibrantColors[0],
                tension: 0.1
            },
            {
                label: 'Matching Suites',
                data: matchingSuitesData,
                fill: false,
                backgroundColor: vibrantColors[1],
                borderColor: vibrantColors[1],
                tension: 0.1
            }
        ];

        // Get the currently selected time and class year from the dropdowns
        const selectedClassYear = document.getElementById('class-year').value;
        const selectedTime = document.getElementById('selection-time').value;
        console.log(selectedTime);

        // Determine the corresponding date based on the class year
        const selectedDate = selectedClassYear === 'junior' ? 'April 9' : 'April 10';

        // Combine the date and time to match the labels in the graph data
        const selectedTimeLabel = `${selectedDate}, ${selectedTime}:00 AM`;

        // Check if the selected time label exists in the graph data
        let isValidTimeLabel = labels.includes(selectedTimeLabel) ? selectedTimeLabel : null;

        // If the selected time label is not found, calculate its approximate position
        if (!isValidTimeLabel) {
            const selectedTimeDate = new Date(`${selectedDate} ${selectedTime}:00`);
            const labelTimes = labels.map(label => new Date(label));

            // Find the closest two labels to the selected time
            let closestBefore = null;
            let closestAfter = null;

            for (let i = 0; i < labelTimes.length; i++) {
                if (labelTimes[i] <= selectedTimeDate) {
                    closestBefore = i;
                } else if (labelTimes[i] > selectedTimeDate && closestAfter === null) {
                    closestAfter = i;
                }
            }

            // Calculate the approximate position between the closest labels
            if (closestBefore !== null && closestAfter !== null) {
                const beforeTime = labelTimes[closestBefore];
                const afterTime = labelTimes[closestAfter];
                const positionRatio = (selectedTimeDate - beforeTime) / (afterTime - beforeTime);
                isValidTimeLabel = closestBefore + positionRatio;
            } else if (closestBefore !== null) {
                isValidTimeLabel = closestBefore; // Use the last label if no "after" label exists
            } else if (closestAfter !== null) {
                isValidTimeLabel = closestAfter; // Use the first label if no "before" label exists
            }
            console.log(isValidTimeLabel);
        }

        console.log(labels[Math.floor(isValidTimeLabel)]);
        console.log(Chart.defaults.plugins.annotation);

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (2024)',
                            font: {
                                size: 14,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            },
                            color: '#f0f0f0' // Set x-axis title color to white
                        },
                        ticks: {
                            color: '#f0f0f0', // Set x-axis labels color to white
                            font: {
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.2)', // Set grid line color
                            lineWidth: 1, // Set grid line width
                            drawBorder: false // Remove border lines
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Available Rooms',
                            font: {
                                size: 14,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            },
                            color: '#f0f0f0' // Set y-axis title color to white
                        },
                        ticks: {
                            color: '#f0f0f0', // Set y-axis labels color to white
                            font: {
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(240, 240, 240, 0.2)', // Set grid line color
                            lineWidth: 1, // Set grid line width
                            drawBorder: false // Remove border lines
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            borderRadius: 0.5,
                            useBorderRadius: true,
                            padding: 15,
                            font: {
                                size: 12,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            },
                            pointStyle: 'rect',
                            color: '#f0f0f0' // Set legend text color to white
                        }
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                xMin: isValidTimeLabel, // Set the line to be vertical at the calculated position
                                xMax: isValidTimeLabel,
                                borderColor: 'rgba(255, 255, 255, 0.8)',
                                borderWidth: 2,
                                label: {
                                    content: 'Selection Time',
                                    enabled: true,
                                    position: 'start', // Other options: 'center', 'end'
                                    color: '#ffffff',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    font: {
                                        size: 12,
                                        family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                                    }
                                }
                            }
                        }
                    },
                    tooltip: {
                        enabled: true, // Enable/disable the tooltip
                        titleColor: '#ffffff', // Title font color
                        bodyColor: '#ffffff', // Body font color
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

    function parseCSV(inputDir, file, size, pool) {
        const csvFile = `${inputDir}/${file}`;
        const countedSuites = new Set();
        const countedRooms = new Set();
        const housingData = {};
        const matchingRooms = { "Total": 0, "Total Suites": 0 };

        return fetch(csvFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(csvData => {
                const lines = csvData.split('\n');
                lines.forEach((line, index) => {
                    if (index !== 0 && line.trim() !== '') {
                        const columns = line.split(',');
                        const building = columns[0];
                        let roomType = columns[5];
                        let capacity = columns[6];
                        const suiteID = columns[3];

                        // Parsing room type
                        if (roomType.includes('Suite') && !building.includes('GRAD CENTER')) {
                            if (suiteID.includes('GREG A 125')) {
                                capacity = 9;
                            }
                            roomType = `Suite (${capacity})`;
                        } else if (roomType.includes('Single')) {
                            roomType = 'Single';
                            capacity = 1;
                        } else if (roomType.includes('Double')) {
                            capacity = 2;
                        } else if (roomType.includes('Triple')) {
                            capacity = 3;
                        } else if (roomType.includes('Quad')) {
                            capacity = 4;
                        }

                        // Check for matching
                        if ((size === "any" || parseInt(capacity) === parseInt(size)) && (columns[8].includes(pool)) && !countedRooms.has(suiteID)) {
                            countedRooms.add(suiteID);
                            if (suiteID.includes("GREG A 125")) {
                                countedRooms.add("GREG A 125 126");
                                countedRooms.add("GREG A 125 127");
                                countedRooms.add("GREG A 125 129");
                                countedRooms.add("GREG A 125 130");
                                countedRooms.add("GREG A 125 132");
                            }
                            matchingRooms["Total"] += 1;
                            if (roomType.includes('Suite')) {
                                matchingRooms["Total Suites"] += 1;
                            }
                            if (!matchingRooms[building]) {
                                matchingRooms[building] = { "Matching Rooms": 1 };
                                if (roomType.includes('Suite')) {
                                    matchingRooms[building]["Matching Suites"] = 1;
                                }
                            } else {
                                matchingRooms[building]["Matching Rooms"] += 1;
                                if (roomType.includes('Suite')) {
                                    if (!matchingRooms[building]["Matching Suites"]) {
                                        matchingRooms[building]["Matching Suites"] = 1;
                                    } else {
                                        matchingRooms[building]["Matching Suites"] += 1;
                                    }
                                }
                            }
                        }

                        // Adding to JSON
                        if (capacity === '') {
                            console.log(suiteID);
                        }
                        if ((!roomType.includes('Suite') || !countedSuites.has(suiteID)) && building !== '') {
                            if (!housingData[building]) {
                                housingData[building] = { "Total Beds": parseInt(capacity), [roomType]: 1 };
                            } else if (!housingData[building][roomType]) {
                                housingData[building][roomType] = 1;
                                housingData[building]["Total Beds"] += parseInt(capacity);
                            } else {
                                housingData[building][roomType] += 1;
                                housingData[building]["Total Beds"] += parseInt(capacity);
                            }
                        }

                        if (roomType.includes('Suite')) {
                            countedSuites.add(suiteID);
                        }
                    }
                });
                return matchingRooms; // Output the summarized data
            })
            .catch(error => console.error('Error parsing the CSV file:', error));
    }
    // Add event listener to trigger filtering when the button is clicked
    document.getElementById('filter-button').addEventListener('click', handleFiltering);
});
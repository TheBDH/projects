document.addEventListener('DOMContentLoaded', function () {

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

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
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
                            color: '#f0f0f0' // Set x-axis labels color to white
                        },
                        title: {
                            display: true,
                            text: document.getElementById('data-toggle').value === 'available-beds'
                                ? 'Percent of Beds Available'
                                : 'Total Beds Available',
                            color: '#f0f0f0', // Set x-axis title color to white
                            font: {
                                size: 14,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            }
                        }
                    },
                    y: {
                        type: 'category',
                        ticks: {
                            color: '#f0f0f0' // Set y-axis labels color to white
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
                                size: 12,
                                family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                            },
                            pointStyle: 'rect',
                            color: '#f0f0f0' // Set legend text color to white
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
                let output = `${totalCurrent}/${totalStart} total matching rooms available<br><br>`;

                // Sort buildings by the number of current matching rooms in descending order
                const sortedBuildings = Object.keys(curRooms)
                    .filter(building => building !== "Total" && curRooms[building]["Matching Rooms"] > 0)
                    .sort((a, b) => curRooms[b]["Matching Rooms"] - curRooms[a]["Matching Rooms"]);

                sortedBuildings.forEach(building => {
                    const current = curRooms[building]["Matching Rooms"];
                    const start = startRooms[building] ? startRooms[building]["Matching Rooms"] : 0;
                    output += `${current}/${start} matching rooms at ${building} available<br><br>`;
                });

                document.getElementById('filter-output').innerHTML = output;
            });
        });

    }

    function parseCSV(inputDir, file, size, pool) {
        const csvFile = `${inputDir}/${file}`;
        const countedSuites = new Set();
        const countedRooms = new Set();
        const housingData = {};
        const matchingRooms = {"Total": 0};

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
                        if ((size === "any" || parseInt(capacity) === parseInt(size))  && (columns[8].includes(pool)) && !countedRooms.has(suiteID)) {
                            console.log(suiteID)
                            countedRooms.add(suiteID);
                            if (suiteID.includes("GREG A 125")) {
                                countedRooms.add("GREG A 125 126");
                                countedRooms.add("GREG A 125 127");
                                countedRooms.add("GREG A 125 129");
                                countedRooms.add("GREG A 125 130");
                                countedRooms.add("GREG A 125 132");
                            }
                            matchingRooms["Total"] += 1;
                            if (!matchingRooms[building]) {
                                matchingRooms[building] = { "Matching Rooms": 1 };
                            } else {
                                matchingRooms[building]["Matching Rooms"] += 1;
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
                console.log(matchingRooms);
                return matchingRooms; // Output the summarized data
            })
            .catch(error => console.error('Error parsing the CSV file:', error));
    }  
    // Add event listener to trigger filtering when the button is clicked
    document.getElementById('filter-button').addEventListener('click', handleFiltering);
});
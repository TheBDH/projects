// Include ScrollMagic library

document.addEventListener('DOMContentLoaded', function() {

    const issueSelect = document.getElementById('issue-select');

    function displayIssueData() {
        const selectedIssue = issueSelect.value;
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('senators');
                container.innerHTML = ''; // Clear previous data
                const scores = {};

                for (const senator in data) {
                    const issueData = data[senator][selectedIssue];
                    if (issueData && typeof issueData === 'object') {
                        const totalScore = parseInt(issueData.Total || 0);

                        if (!scores[totalScore]) {
                            scores[totalScore] = [];
                        }
                        scores[totalScore].push({ ...data[senator], issueData });
                    }
                }

                Object.keys(scores).sort((a, b) => a - b).forEach((score) => {
                    const scoreContainer = document.createElement('div');
                    scoreContainer.className = 'score-container';
                    scoreContainer.style.display = 'flex';
                    scoreContainer.style.flexDirection = 'column';
                    scoreContainer.style.marginBottom = '20px';

                    const scoreLabel = document.createElement('div');
                    scoreLabel.className = 'score-label';
                    scoreLabel.textContent = score;
                    scoreLabel.style.width = '100%';
                    scoreLabel.style.textAlign = 'center';
                    scoreLabel.style.marginBottom = '10px';
                    scoreLabel.style.fontSize = '1.5em'; // Make the text larger
                    scoreLabel.style.fontWeight = 'bold'; // Make the text bold
                    scoreContainer.appendChild(scoreLabel);

                    const senatorContainer = document.createElement('div');
                    senatorContainer.className = 'senator-container';
                    senatorContainer.style.display = 'flex';
                    senatorContainer.style.flexDirection = 'column';
                    senatorContainer.style.alignItems = 'center';

                    scores[score].forEach((senator) => {
                        // Create a div to hold the image and tooltip
                        const div = document.createElement('div');
                        div.className = 'senator-item';
                        div.style.position = 'relative'; // Set position to relative for tooltip positioning
                        div.style.display = 'flex'; // Display flex to allow column layout
                        div.style.flexDirection = 'column'; // Set flex direction to column
                        div.style.alignItems = 'center'; // Center align items
                        div.style.margin = '5px'; // Add some margin between items

                        const img = document.createElement('img');
                        img.src = `prof_images/${senator.Name.toLowerCase().replace(/ /g, '_')}.jpg`;
                        img.alt = `${senator.Name}`;
                        img.className = 'profile-photo';
                        if (window.innerWidth <= 768) {
                            img.style.border = `4px solid ${senator.Party.toLowerCase() === 'd' ? '#202eec' : '#ec2027'}`;
                        } else {
                            img.style.border = `6px solid ${senator.Party.toLowerCase() === 'd' ? '#202eec' : '#ec2027'}`;
                        }

                        // Create tooltip
                        const tooltip = document.createElement('div');
                        tooltip.className = 'tooltip card';

                        const name = document.createElement('h2');
                        name.textContent = senator.Name + " (" + senator.Party + ")";
                        name.style.marginBottom = '5px'; // Decrease margin under the name
                        tooltip.appendChild(name);

                        const district = document.createElement('p');
                        district.textContent = `District: ${senator.District}`;
                        district.style.fontStyle = 'italic'; // Make the text italic
                        district.style.fontSize = '0.9em'; // Make the text a little smaller
                        district.style.marginBottom = '10px';
                        tooltip.appendChild(district);

                        // Add individual scores to the tooltip
                        for (const subscore in senator.issueData) {
                            if (subscore !== 'Total' && senator.issueData[subscore] !== '') {
                                const subscoreElement = document.createElement('p');
                                subscoreElement.textContent = `${subscore}: ${senator.issueData[subscore]}`;
                                tooltip.appendChild(subscoreElement);
                            }
                        }

                        div.appendChild(tooltip);
                        div.appendChild(img);
                        senatorContainer.appendChild(div);

                        // Add tooltip display class on hover
                        img.addEventListener('mouseover', () => {
                            tooltip.classList.add('tooltip-display');
                        });

                        img.addEventListener('mouseout', () => {
                            tooltip.classList.remove('tooltip-display');
                        });

                        // Add tooltip-left class if the score is in the right half of the range
                        if (parseInt(score) > 2) {
                            tooltip.classList.add('tooltip-left');
                        } else {
                            tooltip.classList.add('tooltip-right');
                        }
                    });

                    scoreContainer.appendChild(senatorContainer);
                    container.appendChild(scoreContainer);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Initial display
    displayIssueData();
    issueSelect.addEventListener('change', displayIssueData);


    // scrollMagic shenanigans

    const illo = document.getElementById('illo-container');

    // Initialize ScrollMagic Controller
    const controller = new ScrollMagic.Controller();

    // Create a scene
    const scene = new ScrollMagic.Scene({
        triggerElement: illo,
        triggerHook: 0,
        duration: '120%'
    })
    .setPin(illo)
    .addTo(controller);
});
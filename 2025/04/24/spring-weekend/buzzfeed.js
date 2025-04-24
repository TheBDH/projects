document.addEventListener("DOMContentLoaded", function () {
    // ---------------------------
    // Global Variables and BuzzQuiz Questions
    // ---------------------------
    let buzzDecisionTree = null;  // Will hold the built decision tree
    let treeBuilt = false;       // Flag to check if the decision tree is built
    let currentBuzzIndex = 0;    // Tracks the current question index in the quiz
    let buzzResponses = {};      // Stores user responses to quiz questions

    // Define BuzzQuiz questions. Each question corresponds to an attribute in the dataset.
    const buzzQuizQuestions = [
        {
            attribute: "Genre",
            question: "Pick your dream door",
            options: ["Alternative & Folk", "Electric", "Jazz & R&B", "Pop", "Rap & Reggae/ska", "Rock"],
            captions: ["Courtesy of Doncram via Wikimedia Commons",
                "Courtesy of Graufeder via Wikimedia Commons",
                "Courtesy of John Samuel via Wikimedia Commons",
                "Courtesy of David Dixon via Wikimedia Commons",
                "Courtesy of Basile Morin via Wikimedia Commons",
                "Courtesy of Neoclassicism Enthusiast via Wikimedia Commons"
            ]
        },
        {
            attribute: "Decade",
            question: "Pick your fav wallpaper",
            options: ["60s & 70s", "80s", "90s", "00s", "10s", "20s"],
            captions: ["Courtesy of Morris & Co. via Wikimedia Commons",
                "Courtesy of Morris & Co. via Wikimedia Commons",
                "Courtesy of Neonpixii via Wikimedia Commons",
                "Courtesy of Marek Ślusarczyk via Wikimedia Commons",
                "Courtesy of Helgi Halldórsson via Wikimedia Commons",
                "Courtesy of PantheraLeo1359531 via Wikimedia Commons"
            ]
        },
        {
            attribute: "Popularity",
            question: "Pick your bed",
            options: ["0", "0+", "50+", "200+"],
            captions: ["Courtesy of W.carter via Wikimedia Commons",
                "Courtesy of Kurt Kaiser via Wikimedia Commons",
                "Courtesy of Kurt Kaiser via Wikimedia Commons",
                "Courtesy of Basile Morin via Wikimedia Commons"
            ]
        },
        {
            attribute: "Location",
            question: "Pick your ideal neighborhood",
            options: ["US", "NY", "Europe", "Other"],
            captions: ["Courtesy of Acroterion via Wikimedia Commons",
                "Courtesy of Mike Peel via Wikimedia Commons",
                "Courtesy of Massimo Catarinella via Wikimedia Commons",
                "Courtesy of Nina R via Wikimedia Commons"
            ]
        },
        {
            attribute: "Band",
            question: "Last one—pick a plant to spruce up your home",
            options: ["TRUE", "FALSE"],
            captions: ["Courtesy of F. D. Richards via Wikimedia Commons",
                "Courtesy of Jennifer C. via Wikimedia Commons"
            ]
        }
    ];

    // DOM Element references for the BuzzFeed-themed UI
    const buzzStartBtn = document.getElementById("buzz-start-btn");
    const buzzStartScreen = document.getElementById("buzz-start");
    const buzzContent = document.getElementById("buzz-content");
    const buzzQuestionEl = document.getElementById("buzz-question");
    const buzzAnswersEl = document.getElementById("buzz-answers");
    const buzzNextBtn = document.getElementById("buzz-next");
    const buzzResultDiv = document.getElementById("buzz-result");
    const buzzDecisionDiv = document.getElementById("buzz-decision");

    // ---------------------------
    // 1. Load CSV and Process Data via Papa Parse
    // ---------------------------
    Papa.parse("data/spring_weekend.csv", {
        download: true, // Download the CSV file from the given path
        header: true,   // Treat the first row as headers
        dynamicTyping: true, // Automatically convert numeric values
        complete: function (results) {
            treeBuilt = true; // Mark the data as ready
            buzzDecisionTree = results.data; // Store the parsed data for scoring
        },
        error: function (err) {
            console.error("Error parsing CSV:", err); // Log any errors during CSV parsing
        }
    });


    // ---------------------------
    // 2. Scoring and Decision Functions
    // ---------------------------
    // Function to score each row based on matching attributes
    function scoreRows(data, responses) {
        const scores = {};
        data.forEach(row => {
            let matchCount = 0;
            Object.keys(responses).forEach(attr => {
                if (row[attr] === responses[attr]) {
                    matchCount++;
                }
            });
            const year = row["Year"];
            scores[year] = (scores[year] || 0) + matchCount / Object.keys(responses).length;
        });
        return scores;
    }

    // Function to determine the year with the highest score
    function getBestYear(scores) {
        const maxScore = Math.max(...Object.values(scores));
        const bestYears = Object.keys(scores).filter(year => scores[year] === maxScore);
        return bestYears[Math.floor(Math.random() * bestYears.length)]; // Break ties randomly
    }

    // ---------------------------
    // 3. Buzz Quiz UI Functionality
    // ---------------------------
    buzzStartBtn.addEventListener("click", () => {
        if (!treeBuilt) {
            alert("Please wait while the data is being loaded."); // Alert if data is not ready
            return;
        }
        // Hide the start screen and show the quiz content
        buzzStartScreen.style.display = "none";
        buzzContent.style.display = "block";
        currentBuzzIndex = 0; // Reset the question index
        buzzResponses = {};   // Clear previous responses
        displayBuzzQuestion(); // Display the first question
    });

    // Function to display the current quiz question
    function displayBuzzQuestion() {
        buzzNextBtn.disabled = true;
        const { question, options, captions } = buzzQuizQuestions[currentBuzzIndex];

        buzzQuestionEl.innerText = question;
        buzzAnswersEl.innerHTML = "";

        options.forEach((option, idx) => {
            const btn = document.createElement("button");
            btn.classList.add("buzz-answer-btn");

            // Image
            const img = document.createElement("img");
            img.src = getImageForOption(option);
            img.alt = option;
            btn.appendChild(img);

            // Caption (now correctly pulled from captions[idx])
            const captionEl = document.createElement("div");
            captionEl.classList.add("buzz-answer-caption");
            captionEl.innerText = captions[idx];
            btn.appendChild(captionEl);

            btn.addEventListener("click", () => {
                buzzResponses[buzzQuizQuestions[currentBuzzIndex].attribute] = option;
                Array.from(buzzAnswersEl.children).forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                buzzNextBtn.disabled = false;
            });

            buzzAnswersEl.appendChild(btn);
        });
    }


    buzzNextBtn.addEventListener("click", () => {
        currentBuzzIndex++; // Move to the next question
        if (currentBuzzIndex < buzzQuizQuestions.length) {
            displayBuzzQuestion(); // Display the next question
        } else {
            buzzContent.style.display = "none"; // Hide the quiz content
            // Score the rows based on user responses
            const scores = scoreRows(buzzDecisionTree, buzzResponses);
            // Determine the best year
            const bestYear = getBestYear(scores);
            const buzzYear = document.getElementById("buzz-year");
            buzzYear.innerText = "You matched to Spring Weekend " + bestYear + "!"; // Display the best year
            
            // Scrape all artists from the best year
            const artists = buzzDecisionTree
                .filter(row => String(row["Year"]) === String(bestYear)) // Ensure type-safe comparison
                .map(row => row["Artist"])
                .filter((artist, index, self) => self.indexOf(artist) === index) // Remove duplicates
                .join(", ")
                .replace(/, ([^,]*)$/, " and $1"); // Add "and" at the end without an Oxford comma
            
            console.log(artists);
            buzzDecisionDiv.innerText = "\nArtists: " + artists; // Append the artists to the result
            
            buzzResultDiv.style.display = "block"; // Show the result
        }
    });

    function getImageForOption(option) {
        // customize these paths & names however you like:
        const map = {
            "Alternative & Folk": "images/alternative_folk.jpg",
            "Electric": "images/electric.jpg",
            "Jazz & R&B": "images/jazz_rnb.jpg",
            "Pop": "images/pop.jpg",
            "Rap & Reggae/ska": "images/rap_reggae.jpg",
            "Rock": "images/rock.jpg",
            "60s & 70s": "images/60s_70s.jpg",
            "80s": "images/80s.jpg",
            "90s": "images/90s.jpg",
            "00s": "images/00s.jpg",
            "10s": "images/10s.jpg",
            "20s": "images/20s.jpg",
            "0": "images/0.jpg",
            "0+": "images/0+.jpg",
            "50+": "images/50+.jpg",
            "200+": "images/200+.jpg",
            "US": "images/us.jpg",
            "NY": "images/nyc.jpg",
            "Europe": "images/europe.jpg",
            "Other": "images/world.jpg",
            "TRUE": "images/band.jpg",
            "FALSE": "images/solo.jpg",
        };
        return map[option]
    }
});

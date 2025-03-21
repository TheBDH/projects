// Include ScrollMagic library

document.addEventListener("DOMContentLoaded", function () {
  const issueSelect = document.getElementById("issue-select");

  function displayIssueData() {
    const selectedIssue = issueSelect.value;
    fetch("./data.json")
      .then((response) => response.json())
      .then((data) => {
        const container = document.getElementById("senators");
        container.innerHTML = ""; // Clear previous data
        const scores = { 0: [], 2: [], 4: [], 6: [], 8: [] };

        for (const senator in data) {
          const issueData = data[senator][selectedIssue];
          if (issueData && typeof issueData === "object") {
            let totalScore = parseFloat(issueData.Total || 0);
            if (isNaN(totalScore)) continue; // Skip if totalScore is not a number
            if (totalScore == 1) {
              totalScore = 0.99;
            }
            totalScore = Math.floor((totalScore * 10) / 2) * 2; // Multiply by 10, divide by 2, and ceil to the next even number
            if (!scores[totalScore]) {
              scores[totalScore] = [];
            }
            scores[totalScore].push({ ...data[senator], issueData });
          }
        }

        Object.keys(scores)
          .sort((a, b) => a - b)
          .forEach((score) => {
            const scoreContainer = document.createElement("div");
            scoreContainer.className = "score-container";
            scoreContainer.style.display = "flex";
            scoreContainer.style.flexDirection = "column";
            scoreContainer.style.marginBottom = "20px";

            const scoreLabel = document.createElement("div");
            scoreLabel.className = "score-label";
            scoreLabel.textContent = `${score} - ${parseInt(score) + 2}`;
            scoreLabel.style.width = "100%";
            scoreLabel.style.textAlign = "center";
            scoreLabel.style.marginBottom = "10px";
            scoreLabel.style.fontSize = "1.5em"; // Make the text larger
            scoreLabel.style.fontWeight = "bold"; // Make the text bold

            if (scores[score].length === 0) {
              scoreLabel.style.paddingRight = "73px"; // Add right padding
            }

            scoreContainer.appendChild(scoreLabel);

            const senatorContainer = document.createElement("div");
            senatorContainer.className = "senator-container";
            senatorContainer.style.display = "flex";
            senatorContainer.style.flexDirection = "column";
            senatorContainer.style.alignItems = "center";

            scores[score].forEach((senator) => {
              // Create a div to hold the image and tooltip
              const div = document.createElement("div");
              div.className = "senator-item";
              div.style.position = "relative"; // Set position to relative for tooltip positioning
              div.style.display = "flex"; // Display flex to allow column layout
              div.style.flexDirection = "column"; // Set flex direction to column
              div.style.alignItems = "center"; // Center align items
              div.style.margin = "5px"; // Add some margin between items

              const img = document.createElement("img");
              img.src = `prof_images/${senator.Name.toLowerCase().replace(
                / /g,
                "_"
              )}.jpg`;
              img.alt = `${senator.Name}`;
              img.className = "profile-photo";
              if (window.innerWidth <= 768) {
                img.style.border = `4px solid ${
                  senator.Party.toLowerCase() === "d" ? "#202eec" : "#ec2027"
                }`;
              } else {
                img.style.border = `6px solid ${
                  senator.Party.toLowerCase() === "d" ? "#202eec" : "#ec2027"
                }`;
              }

              // Create tooltip
              const tooltip = document.createElement("div");
              tooltip.className = "tooltip card";

              const name = document.createElement("h2");
              name.textContent = senator.Name + " (" + senator.Party + ")";
              name.style.marginBottom = "5px"; // Decrease margin under the name
              tooltip.appendChild(name);

              const district = document.createElement("p");
              district.textContent = `District: ${senator.District}`;
              district.style.fontStyle = "italic"; // Make the text italic
              district.style.fontSize = "0.9em"; // Make the text a little smaller
              district.style.marginBottom = "10px";
              tooltip.appendChild(district);

              // Add individual scores to the tooltip
              for (const subscore in senator.issueData) {
                if (
                  subscore !== "Total" &&
                  senator.issueData[subscore] !== ""
                ) {
                  const subscoreElement = document.createElement("p");
                  subscoreElement.textContent = `${subscore}: ${senator.issueData[subscore]}`;
                  tooltip.appendChild(subscoreElement);
                }
                if (subscore == "Total" && selectedIssue === "Total Average") {
                  const subscoreElement = document.createElement("p");
                  subscoreElement.textContent = `Overall: ${(
                    senator.issueData[subscore] * 10
                  ).toFixed(1)}`;
                  tooltip.appendChild(subscoreElement);
                }
              }

              div.appendChild(tooltip);
              div.appendChild(img);
              senatorContainer.appendChild(div);

              // Add tooltip display class on hover
              img.addEventListener("mouseover", () => {
                tooltip.classList.add("tooltip-display");
              });

              img.addEventListener("mouseout", () => {
                tooltip.classList.remove("tooltip-display");
              });

              // Add tooltip-left class if the score is in the right half of the range
              if (parseInt(score) > 2) {
                tooltip.classList.add("tooltip-left");
              } else {
                tooltip.classList.add("tooltip-right");
              }
            });

            scoreContainer.appendChild(senatorContainer);
            container.appendChild(scoreContainer);
          });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  // Initial display
  displayIssueData();
  issueSelect.addEventListener("change", displayIssueData);

  // scrollMagic shenanigans

  const illo = document.getElementById("illo-container");

  // Initialize ScrollMagic Controller
  const controller = new ScrollMagic.Controller();

  // Create a scene
  const scene = new ScrollMagic.Scene({
    triggerElement: illo,
    triggerHook: 0,
    duration: "120%",
  })
    .setPin(illo)
    .addTo(controller);

  // heatmap code
  const boxWidth = document.getElementById("heatmap").clientWidth;
  const boxHeight = document.getElementById("heatmap").clientHeight;
  const margin = { top: 0, right: 0, bottom: 20, left: boxWidth * 0.15 };
  const width = boxWidth - margin.left - margin.right;
  const height = boxHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#heatmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3
    .scaleLinear()
    .domain([0, 0.25, 0.5, 0.75, 1])
    .range(["#B93F3C", "#E58A78", "#E8DCB2", "#75A2CF", "#3673B2"]); // red to blue don't forget! :)

  fetch("./data.json")
    .then((response) => response.json())
    .then((data) => {
      const categories = Object.keys(data[Object.keys(data)[0]]).filter(
        (k) => k !== "Name" && k !== "Party" && k !== "District"
      );

      const politicians = Object.entries(data).map(([name, values]) => ({
        name,
        scores: values,
        total: values["Total Average"]?.Total || 0,
        party: values["Party"],
      }));

      politicians.sort((a, b) => b.total - a.total);

      const xScale = d3
        .scaleBand()
        .domain(categories)
        .range([0, width])
        .padding(0.01);
      const yScale = d3
        .scaleBand()
        .domain(politicians.map((d) => d.name))
        .range([0, height])
        .padding(0.01);

      svg
        .selectAll("rect")
        .data(
          politicians.flatMap((d) =>
            categories.map((issue) => ({
              name: d.name,
              issue,
              score: d.scores[issue]?.Total || 0,
              party: d.party,
            }))
          )
        )
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.issue))
        .attr("y", (d) => yScale(d.name))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("data-column", (d) => d.issue)
        .attr("data-row", (d) => d.name)
        .attr("fill", (d) =>
          d.score == "NO DATA" ? "#eee" : colorScale(d.score)
        )
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(
              `<span id="rep">${d.name} (${d.party})</span><br>${d.issue}: ${
                d.score == "NO DATA" ? "Data unavailable" : d.score
              }`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
          d3.selectAll("rect").style("opacity", 0.2);
          d3.selectAll(`rect[data-column='${d.issue}']`).style("opacity", 1);
          d3.selectAll(`rect[data-row='${d.name}']`).style("opacity", 1);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
          d3.selectAll("rect").style("opacity", 1);
        });

      svg
        .append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(0,${height})`);
      svg.append("g").call(d3.axisLeft(yScale));

      const tooltip = d3.select("body").append("div").attr("id", "tooltip");
    });
});

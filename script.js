const courses = [
    "The Elevens Club", "Clickbait Country Club", "Pinehurst No. 2", "Mastercard Mountain Valley",
    "Finau Fresh Country Club", "Payne's Valley", "Pebble Beach Golf Links", "Wilderness Peak",
    "Blue Ridge Trail", "Spyglass Hill", "Torrey Pines North", "Torrey Pines South", "Top of the Rock",
    "The Renaissance Club", "St. George's Golf & CC", "Wilmington CC South", "Sherwood Shores",
    "Pothole Lake Golf Club", "Old Marina Golf Club", "Lone Grove Golf Course", "Lachlan Crossing",
    "Jacobson Homestead", "Huckleberry Country Club", "Foxholm Golf Links", "Emery Beach Club",
    "Echo Park Golf Club", "Craggy Heights", "Chestnut Hollow", "The Northern Lights Club",
    "Hauteluce", "Gleneden Grove GC", "Thieves Landing", "Matapouri Match Club", "Tahitian Escape",
    "Northern Echo Golf Club", "Bay Hill Club & Lodge", "Sky Peaks Resort", "Pacifica Golf Club",
    "Detroit Golf Club", "Quail Hollow Club", "Copperhead Course at Innisbrook", "East Lake Golf Club",
    "TPC River Highlands", "TPC Twin Cities", "TPC Louisiana", "TPC San Antonio", "Riviera Country Club",
    "Atlantic Beach CC", "TPC Summerlin", "TPC Southwind", "TPC Scottsdale", "TPC Sawgrass",
    "TPC Deere Run", "TPC Boston"
];

let players = JSON.parse(localStorage.getItem("players")) || ["AJ", "Owain", "Ryan"];
const courseContainer = document.getElementById("courses");
const scoreboard = document.getElementById("scoreboard");
const playerStrokes = JSON.parse(localStorage.getItem("playerStrokes")) || {};

function loadWinners() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};

    courses.forEach((course, index) => {
        const courseDiv = document.createElement("div");
        courseDiv.classList.add("course");

        const courseTitleDiv = document.createElement("div");
        courseTitleDiv.classList.add("course-title");

        const courseTitle = document.createElement("h3");
        courseTitle.textContent = `${index + 1}. ${course}`;
        courseTitleDiv.appendChild(courseTitle);

        const resetButton = document.createElement("button");
        resetButton.classList.add("reset-button");
        resetButton.textContent = "Reset";
        resetButton.onclick = () => {
            dropdown.value = "";
            saveWinner(course, "");

            // Reset strokes for each player
            players.forEach(player => {
                document.getElementById(`strokes-${player}-${index}`).value = 0;
                updateStrokes(course, player, 0);
            });

            updateScoreboard();
            highlightNextCourse();
            checkAndHighlightButton(collapseButton, course);
        };
        courseTitleDiv.appendChild(resetButton);

        const dropdown = document.createElement("select");
        dropdown.classList.add("dropdown");
        dropdown.id = `course-${index}`;

        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "Select a player";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        dropdown.appendChild(placeholderOption);

        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            dropdown.appendChild(option);
        });

        if (savedWinners[course]) {
            dropdown.value = savedWinners[course];
        }

        dropdown.addEventListener("change", () => {
            saveWinner(course, dropdown.value);
            updateScoreboard();
            highlightNextCourse();
        });

        courseDiv.appendChild(courseTitleDiv);
        courseDiv.appendChild(dropdown);

        const collapseButton = document.createElement("button");
        collapseButton.classList.add("collapse-button");
        collapseButton.textContent = "Show Strokes";
        collapseButton.onclick = () => {
            const strokeTrackerDiv = courseDiv.querySelector(".stroke-tracker");
            if (strokeTrackerDiv.style.display === "none") {
                strokeTrackerDiv.style.display = "flex";
                collapseButton.textContent = "Hide Strokes";
            } else {
                strokeTrackerDiv.style.display = "none";
                collapseButton.textContent = "Show Strokes";
            }
        };
        courseDiv.appendChild(collapseButton);

        const strokeTrackerDiv = document.createElement("div");
        strokeTrackerDiv.classList.add("stroke-tracker");
        strokeTrackerDiv.style.display = "none";

        players.forEach(player => {
            const label = document.createElement("label");
            label.textContent = `${player}'s Strokes:`;
            label.htmlFor = `strokes-${player}-${index}`;

            const spinner = document.createElement("input");
            spinner.type = "number";
            spinner.classList.add("stroke-spinner");
            spinner.id = `strokes-${player}-${index}`;
            spinner.value = playerStrokes[course]?.[player] || 0;
            spinner.onchange = () => {
                updateStrokes(course, player, spinner.value);
                checkAndHighlightButton(collapseButton, course);
            };

            spinner.addEventListener("wheel", (event) => {
                event.preventDefault();
                if (event.deltaY < 0) {
                    spinner.value = parseInt(spinner.value) + 1;
                } else if (event.deltaY > 0) {
                    spinner.value = parseInt(spinner.value) - 1;
                }
                updateStrokes(course, player, spinner.value);
                checkAndHighlightButton(collapseButton, course);
            });

            strokeTrackerDiv.appendChild(label);
            strokeTrackerDiv.appendChild(spinner);
        });

        courseDiv.appendChild(strokeTrackerDiv);
        courseContainer.appendChild(courseDiv);

        checkAndHighlightButton(collapseButton, course); // Initial check for zero strokes
    });

    updateScoreboard();
    highlightNextCourse();
}

function savePlayers() {
    localStorage.setItem("players", JSON.stringify(players));
}

function addPlayerFromInput() {
    const playerName = document.getElementById("newPlayerName").value.trim();
    addPlayer(playerName);
    document.getElementById("newPlayerName").value = ""; // Clear input field
}

function removePlayerFromInput() {
    const playerName = document.getElementById("newPlayerName").value.trim();
    removePlayer(playerName);
    document.getElementById("newPlayerName").value = ""; // Clear input field
}

function addPlayer(playerName) {
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        savePlayers();
        initializePlayerColors(); // Update player colors for the new player
        loadWinners(); // Reload the scoreboard with the updated players list
    }
}

function removePlayer(playerName) {
    players = players.filter(player => player !== playerName);
    savePlayers();
    initializePlayerColors(); // Update player colors after removal
    loadWinners(); // Reload the scoreboard with the updated players list
}

// Function to highlight button if all strokes are zero
function checkAndHighlightButton(button, course) {
    const playerStrokes = JSON.parse(localStorage.getItem("playerStrokes")) || {};
    const allZero = players.every(player => (playerStrokes[course]?.[player] || 0) === 0);

    if (allZero) {
        button.classList.add("highlighted-button");
    } else {
        button.classList.remove("highlighted-button");
    }
}

function saveWinner(course, player) {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    savedWinners[course] = player;
    localStorage.setItem("golfWinners", JSON.stringify(savedWinners));
}

// New function to update strokes
function updateStrokes(course, player, value) {
    playerStrokes[course] = playerStrokes[course] || {};
    playerStrokes[course][player] = parseInt(value, 10) || 0;
    localStorage.setItem("playerStrokes", JSON.stringify(playerStrokes));
    updateScoreboard();
}

// Modify clearWinners to reset both winners and strokes
function clearWinners() {
    localStorage.removeItem("golfWinners");
    localStorage.removeItem("playerStrokes");
    alert("All winners and stroke data have been cleared!");
    location.reload();
}

// Create a single color picker input for reuse
const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.style.position = "absolute";
colorPicker.style.display = "none"; // Hide initially
document.body.appendChild(colorPicker);

// Function to update the scoreboard with color-changing ability
function updateScoreboard() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};

    const scores = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {});
    const strokes = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {});

    courses.forEach(course => {
        const winner = savedWinners[course];
        if (winner) scores[winner]++;

        if (playerStrokes[course]) {
            Object.keys(playerStrokes[course]).forEach(player => {
                strokes[player] += playerStrokes[course][player] || 0;
            });
        }
    });

    scoreboard.innerHTML = ""; // Clear existing scoreboard content

    players.forEach(player => {
        const playerScore = document.createElement("div");
        playerScore.className = "player-score";
        playerScore.innerHTML = `${player}: ${scores[player]} Wins (${strokes[player]} Strokes)`;
        playerScore.style.color = playerColors[player];
        playerScore.style.cursor = "pointer"; // Makes it clear it's clickable

        // Add event listener to change color on click
        playerScore.addEventListener("click", (event) => {
            colorPicker.value = playerColors[player]; // Set current color
            colorPicker.style.left = `${event.clientX}px`; // Set position based on click
            colorPicker.style.top = `${event.clientY}px`;
            colorPicker.style.display = "block"; // Show color picker

            // Update color on input change
            colorPicker.oninput = () => {
                const newColor = colorPicker.value;
                savePlayerColor(player, newColor);
                playerScore.style.color = newColor;
                updateCourseHighlighting(); // Update course names with the new color
                updateCompactView(); // Update compact display with the new color
            };

            // Hide color picker on change
            colorPicker.onchange = () => {
                colorPicker.style.display = "none";
            };
        });

        scoreboard.appendChild(playerScore);
    });

    updateCourseHighlighting();
    updateCompactView(); // Initial call to ensure it's updated on load
}

// Hide color picker when clicking outside of it and playerScore elements
document.addEventListener("click", (event) => {
    if (event.target !== colorPicker && event.target.className !== "player-score") { // Ensure not hiding on player name click
        colorPicker.style.display = "none";
    }
});

// Function to highlight course name based on the winner's color
function updateCourseHighlighting() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};

    courses.forEach((course, index) => {
        const courseTitle = document.querySelector(`#course-${index}`).parentNode.querySelector("h3");
        const winner = savedWinners[course];

        if (winner) {
            courseTitle.style.color = playerColors[winner];
        } else {
            courseTitle.style.color = ""; // Reset color if no winner
        }
    });
}

// Function to update the compact view of course results
function updateCompactView() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    const compactView = document.getElementById("compactView");
    compactView.innerHTML = ""; // Clear existing content

    // Iterate over courses and append color-coded initials
    courses.forEach(course => {
        const winner = savedWinners[course];
        const playerInitial = winner ? winner[0] : "-";

        const span = document.createElement("span");
        span.textContent = playerInitial;

        if (winner) {
            span.style.color = playerColors[winner]; // Apply the player's color
        } else {
            span.style.color = "#e0e0e0"; // Default color for no winner
        }

        compactView.appendChild(span);
    });
}

// Function to generate a random color
function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Function to initialize player colors and save to localStorage if not already saved
function initializePlayerColors() {
    let playerColors = JSON.parse(localStorage.getItem("playerColors")) || {};
    players.forEach(player => {
        if (!playerColors[player]) {
            playerColors[player] = getRandomColor();
        }
    });
    localStorage.setItem("playerColors", JSON.stringify(playerColors));
    return playerColors;
}

let playerColors = initializePlayerColors(); // Load or initialize player colors

// Function to save updated color to localStorage
function savePlayerColor(player, color) {
    playerColors[player] = color;
    localStorage.setItem("playerColors", JSON.stringify(playerColors));
}

function highlightNextCourse() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    let foundFirstEmptyCourse = false;

    courses.forEach((course, index) => {
        const courseDiv = document.getElementById(`course-${index}`).parentNode;

        if (!savedWinners[course] && !foundFirstEmptyCourse) {
            courseDiv.classList.add("highlight-next");
            foundFirstEmptyCourse = true;
        } else {
            courseDiv.classList.remove("highlight-next");
        }
    });
}

function exportData() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    const playerStrokesData = JSON.parse(localStorage.getItem("playerStrokes")) || {};

    // Combine winners and strokes data
    const exportData = {
        winners: savedWinners,
        strokes: playerStrokesData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "golfTournamentData.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById("fileInput").click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const importedData = JSON.parse(e.target.result);
            localStorage.setItem("golfWinners", JSON.stringify(importedData));
            location.reload();
        };
        reader.readAsText(file);
    }
}

// Render the strokes chart for played courses
function renderStrokesChart() {
    const playerStrokesData = JSON.parse(localStorage.getItem("playerStrokes")) || {};

    // Filter courses to include only played courses (at least one stroke recorded)
    const playedCourses = courses.filter(course => {
        return playerStrokesData[course];
    });

    // Prepare data for the chart
    const datasets = players.map(player => ({
        label: `${player} Total Strokes`,
        data: playedCourses.map(course => playerStrokesData[course]?.[player] || null),
        backgroundColor: playerColors[player],
        borderColor: playerColors[player],
        borderWidth: 2,
        fill: false
    }));

    // Create the chart
    const strokesChartCtx = document.getElementById("strokesChart").getContext("2d");
    new Chart(strokesChartCtx, {
        type: "line",
        data: {
            labels: playedCourses, // Only include played courses
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { autoSkip: false } }
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top"
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.raw === null) return `${context.dataset.label}: No Data`;
                            return `${context.dataset.label}: ${context.raw} Strokes`;
                        }
                    }
                }
            }
        }
    });
}

// Render the wins chart showing cumulative wins over the tournament (played courses only)
function renderWinsChart() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    const playerStrokesData = JSON.parse(localStorage.getItem("playerStrokes")) || {};

    // Filter courses to include only played courses (at least one stroke recorded)
    const playedCourses = courses.filter(course => {
        return playerStrokesData[course];
    });

    // Calculate cumulative wins for each player across the tournament
    const cumulativeWins = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {});
    const dataPoints = []; // Array to store data points for the chart

    playedCourses.forEach(course => {
        const winner = savedWinners[course];

        // Update cumulative wins for the winner
        if (winner) {
            cumulativeWins[winner]++;
        }

        // Add data point for each course (x-axis: course name, y-axis: cumulative wins)
        dataPoints.push({
            course,
            cumulativeWins: { ...cumulativeWins }, // Snapshot of cumulative wins
        });
    });

    // Prepare datasets for each player
    const datasets = players.map(player => ({
        label: player,
        data: dataPoints.map(point => ({
            x: point.course,
            y: point.cumulativeWins[player],
        })),
        backgroundColor: playerColors[player],
        borderColor: playerColors[player],
        borderWidth: 2,
        tension: 0.3, // Smooth the line
        fill: false,
    }));

    // Create the chart
    const winsChartCtx = document.getElementById("winsChart").getContext("2d");
    new Chart(winsChartCtx, {
        type: "line",
        data: {
            datasets: datasets,
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "category",
                    labels: playedCourses, // Use only played courses as labels
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: context => context[0].label, // Show course name
                        label: context => {
                            const player = context.dataset.label;
                            const wins = context.raw.y;
                            return `${player}: ${wins} Win${wins !== 1 ? "s" : ""}`;
                        },
                    },
                },
                legend: {
                    display: true,
                    position: "top",
                },
            },
        },
    });
}

// Call renderWinsChart after loading data
loadWinners();
renderStrokesChart();
renderWinsChart();


// Call renderWinsChart after loading data
loadWinners();
renderStrokesChart();
renderWinsChart();

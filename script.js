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

const players = ["AJ", "Owain", "Ryan"];
const courseContainer = document.getElementById("courses");
const scoreboard = document.getElementById("scoreboard");

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
            updateScoreboard();
            highlightNextCourse(); // Update highlight
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
            highlightNextCourse(); // Update highlight
        });

        courseDiv.appendChild(courseTitleDiv);
        courseDiv.appendChild(dropdown);
        courseContainer.appendChild(courseDiv);
    });

    updateScoreboard();
    highlightNextCourse();
}

function saveWinner(course, player) {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    savedWinners[course] = player;
    localStorage.setItem("golfWinners", JSON.stringify(savedWinners));
}

function clearWinners() {
    localStorage.removeItem("golfWinners");
    alert("All winners have been cleared!");
    location.reload();
}

function updateScoreboard() {
    const savedWinners = JSON.parse(localStorage.getItem("golfWinners")) || {};
    const scores = { "AJ": 0, "Owain": 0, "Ryan": 0 };
    let nextCourse = "All courses complete"; // Default message if all are filled

    courses.some(course => {
        if (!savedWinners[course]) {
            nextCourse = `Next Course: ${course}`;
            return true; // Breaks out of loop as we found the first unassigned course
        }
        return false;
    });

    Object.values(savedWinners).forEach(winner => {
        if (scores[winner] !== undefined) {
            scores[winner]++;
        }
    });

    scoreboard.textContent = `Scores - AJ: ${scores["AJ"]} | Owain: ${scores["Owain"]} | Ryan: ${scores["Ryan"]} | ${nextCourse}`;
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
    const savedWinners = localStorage.getItem("golfWinners") || "{}";
    const blob = new Blob([savedWinners], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "golfWinners.json";
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

loadWinners();
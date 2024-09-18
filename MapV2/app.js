// app.js

// Import the routing functions from routing.js
import { 
    calculateOptimalRouteGA as calculateOptimalRoute, 
    calculateTotalDistance, 
    calculateTotalReward, 
    generateRouteSummary,
    createPOIMap,
    precomputeDistanceMap
} from './routing.js';

// Import map data and functions from mapData.js
import { polarToCartesian, systems, jumpPoints, colors, symbols } from './mapData.js';

// Initialize data arrays
let orbitTraces = [];
let poiTraces = [];
let annotations = [];
let events = []; // Array to store all pickup and drop-off events
let missions = []; // Array to store missions
let allPOIs = []; // Initialize allPOIs here

// Initialize the Route Length Graph
let routeLengthData = {
    x: [], // Generations
    y: [], // Route Lengths
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: '#2ECC71' },
    line: { color: '#2ECC71' },
    name: 'Route Length'
};

let routeLengthLayout = {
    title: 'Route Length Over Generations',
    xaxis: { title: 'Generation' },
    yaxis: { title: 'Total Distance (Gm)' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#fff' },
    margin: { l: 40, r: 20, t: 40, b: 40 },
    showlegend: false,
};

Plotly.newPlot('routeLengthGraph', [routeLengthData], routeLengthLayout, {responsive: true});

///*******DELETE AFTER TESTING***** */
// Start Example Mission Code (Remove this section if no longer needed)

// Start Example Mission Code (Remove this section if no longer needed)

// Example Missions (easily removable)
const exampleMissions = [
    {
        type: 'multiplePickUp', // Mission 1: Multi pickup
        rewardAmount: 10000,
        cargoEntries: [
            { type: 'Waste', quantity: 3, from: 'MIC-L5', to: 'Port Tressler' },
            { type: 'Scrap', quantity: 3, from: 'MIC-L5', to: 'Port Tressler' },
            { type: 'Waste', quantity: 2, from: 'MIC-L1', to: 'Port Tressler' },
            { type: 'Scrap', quantity: 3, from: 'MIC-L1', to: 'Port Tressler' }
        ]
    },
    {
        type: 'multipleDropOff', // Mission 2: Multi dropoff
        rewardAmount: 10100,
        cargoEntries: [
            { type: 'Ice', quantity: 6, from: 'Port Tressler', to: 'MIC-L4' },
            { type: 'Food', quantity: 4, from: 'Port Tressler', to: 'MIC-L4' },
            { type: 'Ice', quantity: 3, from: 'Port Tressler', to: 'MIC-L2' },
            { type: 'Food', quantity: 3, from: 'Port Tressler', to: 'MIC-L2' }
        ]
    },
    {
        type: 'direct', // Mission 3: Direct
        rewardAmount: 10200,
        cargoEntries: [
            { type: 'Ice', quantity: 15, from: 'Port Tressler', to: 'Seraphim Station' }
        ]
    },
    {
        type: 'direct', // Mission 4: Direct
        rewardAmount: 10300,
        cargoEntries: [
            { type: 'Waste', quantity: 7, from: 'MIC-L2', to: 'Port Tressler' },
            { type: 'Scrap', quantity: 6, from: 'MIC-L2', to: 'Port Tressler' }
        ]
    },
    {
        type: 'direct', // Mission 5: Direct (Corrected to Stims instead of A)
        rewardAmount: 10400,
        cargoEntries: [
            { type: 'Stims', quantity: 13, from: 'Port Tressler', to: 'MIC-L1' }
        ]
    },
    {
        type: 'multiplePickUp', // Mission 6: Multi pickup (Corrected pickup location to CRU-L5)
        rewardAmount: 10500,
        cargoEntries: [
            { type: 'Agri', quantity: 7, from: 'Seraphim Station', to: 'Everus Harbour' },
            { type: 'Agri', quantity: 7, from: 'CRU-L5', to: 'Everus Harbour' }
        ]
    }
];

// Function to populate example missions
function loadExampleMissions() {
    exampleMissions.forEach((mission) => {
        addMissionToList(mission);
    });
    alert('Example missions have been loaded!');
}

// Expose the function to the global scope
window.loadExampleMissions = loadExampleMissions;

// End Example Mission Code (Remove this section if no longer needed)
///*******DELETE AFTER TESTING***** */

// Add central star
poiTraces.push({
    x: [0],
    y: [0],
    mode: "markers",
    type: "scatter",
    name: "Central Star",
    marker: {
        symbol: symbols["Star"],
        size: 30, // Increased size
        color: colors["Star"],
        line: {
            color: "#4A4A4A", // Changed to match orbital lines
            width: 2,
        },
    },
    text: "Central Star",
    hoverinfo: "text",
});

// Iterate through each system to create orbits and POIs
systems.forEach((system) => {
    // Planet orbit (around the central star)
    let planetOrbit = {
        x: [],
        y: [],
        mode: "lines",
        type: "scatter",
        name: `${system.name} Orbit`,
        line: { dash: "solid", color: "#4A4A4A" }, // Changed to grey and solid
        hoverinfo: "none",
        showlegend: false,
    };
    const numPoints = 360;
    for (let i = 0; i <= numPoints; i++) {
        let angle = i;
        let coord = polarToCartesian(angle, system.planet.distance);
        planetOrbit.x.push(coord.x);
        planetOrbit.y.push(coord.y);
    }
    orbitTraces.push(planetOrbit);

    // Plot planet
    let planetCoord = polarToCartesian(system.planet.angle, system.planet.distance);
    poiTraces.push({
        x: [planetCoord.x],
        y: [planetCoord.y],
        mode: "markers",
        type: "scatter",
        name: system.planet.name,
        marker: {
            symbol: symbols[system.planet.type],
            size: 14,
            color: colors[system.planet.type], // Updated colors for visibility
            line: {
                color: "#4A4A4A", // Changed to match orbital lines
                width: 2,
            },
        },
        text: system.planet.name,
        hoverinfo: "text",
    });

    // Add to allPOIs
    allPOIs.push({
        name: system.planet.name,
        x: planetCoord.x,
        y: planetCoord.y,
    });

    // Plot orbital station
    let stationCoord = polarToCartesian(
        system.orbitalStation.angle,
        system.orbitalStation.distance
    );
    poiTraces.push({
        x: [stationCoord.x],
        y: [stationCoord.y],
        mode: "markers",
        type: "scatter",
        name: system.orbitalStation.name,
        marker: {
            symbol: symbols[system.orbitalStation.type],
            size: 10,
            color: colors[system.orbitalStation.type], // Updated for visibility
            line: {
                color: "#4A4A4A", // Changed to match orbital lines
                width: 0.5,
            },
        },
        text: system.orbitalStation.name,
        hoverinfo: "text",
    });

    // Add to allPOIs
    allPOIs.push({
        name: system.orbitalStation.name,
        x: stationCoord.x,
        y: stationCoord.y,
    });

    // Plot Lagrange points with unique colors and oval shape
    system.lagrangePoints.forEach((lp) => {
        let lpCoord = polarToCartesian(lp.angle, lp.distance);
        poiTraces.push({
            x: [lpCoord.x],
            y: [lpCoord.y],
            mode: "markers",
            type: "scatter",
            name: lp.name,
            marker: {
                symbol: 'circle', // Changed to 'circle' for solid oval-like shape
                size: 5, // Half the current size
                color: system.lagrangeColor, // Unique color per system
                line: {
                    color: "#FFFFFF",
                    width: 1,
                },
            },
            text: lp.name,
            hoverinfo: "text",
        });

        // Add to allPOIs
        allPOIs.push({
            name: lp.name,
            x: lpCoord.x,
            y: lpCoord.y,
        });

        // Add annotation for Lagrange point
        annotations.push({
            x: lpCoord.x,
            y: lpCoord.y,
            xref: "x",
            yref: "y",
            text: lp.name,
            showarrow: false,
            font: {
                color: "#FFFFFF",
                size: 10,
            },
            visible: false,
        });
    });

    // Plot moon orbits (centered on planet)
    system.moons.forEach((moon) => {
        // Current moon position
        let moonCoord = polarToCartesian(moon.angle, moon.distance);
        // Planet position
        let planetCoordCartesian = planetCoord; // Already calculated
        // Relative position
        let relativeX = moonCoord.x - planetCoordCartesian.x;
        let relativeY = moonCoord.y - planetCoordCartesian.y;
        // Orbit radius
        let orbitRadius = Math.sqrt(
            relativeX ** 2 + relativeY ** 2
        );

        // Moon orbit trace
        let moonOrbit = {
            x: [],
            y: [],
            mode: "lines",
            type: "scatter",
            name: `${moon.name} Orbit`,
            line: { dash: "solid", color: "#4A4A4A" }, // Changed to grey and solid
            hoverinfo: "none",
            showlegend: false,
        };
        for (let i = 0; i <= numPoints; i++) {
            let angle = i;
            let rad = (angle * Math.PI) / 180;
            let x =
                planetCoordCartesian.x + orbitRadius * Math.cos(rad);
            let y =
                planetCoordCartesian.y + orbitRadius * Math.sin(rad);
            moonOrbit.x.push(x);
            moonOrbit.y.push(y);
        }
        orbitTraces.push(moonOrbit);

        // Plot moon
        poiTraces.push({
            x: [moonCoord.x],
            y: [moonCoord.y],
            mode: "markers",
            type: "scatter",
            name: moon.name,
            marker: {
                symbol: symbols[moon.type],
                size: 8,
                color: colors[moon.type], // Updated colors for visibility
                line: {
                    color: "#4A4A4A", // Changed to match orbital lines
                    width: 0.5,
                },
            },
            text: moon.name,
            hoverinfo: "text",
        });

        // Add to allPOIs
        allPOIs.push({
            name: moon.name,
            x: moonCoord.x,
            y: moonCoord.y,
        });

        // Add annotation for moon
        annotations.push({
            x: moonCoord.x,
            y: moonCoord.y,
            xref: "x",
            yref: "y",
            text: moon.name,
            showarrow: false,
            font: {
                color: "#FFFFFF",
                size: 8,
            },
            visible: false,
        });
    });
});

// Plot Jump Points
jumpPoints.forEach((jp) => {
    let jpCoord = polarToCartesian(jp.angle, jp.distance);
    poiTraces.push({
        x: [jpCoord.x],
        y: [jpCoord.y],
        mode: "markers",
        type: "scatter",
        name: jp.name,
        marker: {
            symbol: symbols[jp.type],
            size: 12,
            color: colors[jp.type], // Updated for visibility
            line: {
                color: "#4A4A4A", // Changed to match orbital lines
                width: 0.5,
            },
        },
        text: jp.name,
        hoverinfo: "text",
    });

    // Add to allPOIs
    allPOIs.push({
        name: jp.name,
        x: jpCoord.x,
        y: jpCoord.y,
    });

    // Add annotation for jump point
    annotations.push({
        x: jpCoord.x,
        y: jpCoord.y,
        xref: "x",
        yref: "y",
        text: jp.name,
        showarrow: false,
        font: {
            color: "#FFFFFF",
            size: 10,
        },
        visible: false,
    });
});

// Populate Starting Location Dropdown
const startingLocationSelect = document.getElementById("startingLocation");
allPOIs.forEach((poi) => {
    const option = document.createElement("option");
    option.value = poi.name;
    option.text = poi.name;
    startingLocationSelect.appendChild(option);
});

// Combine all data for the plot
let plotData = [...orbitTraces, ...poiTraces];

// Define layout with updated background color and legend removed
let plotLayout = {
    title: "",
    paper_bgcolor: "#0D0D0D", // Almost black background
    plot_bgcolor: "#0D0D0D",  // Almost black background
    xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        range: [-80, 80],
        scaleanchor: "y",
        scaleratio: 1,
    },
    yaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        range: [-80, 80],
    },
    showlegend: false, // Legend removed
    hovermode: "closest",
    margin: { l: 0, r: 0, t: 50, b: 0 },
    annotations: annotations, // Initial annotations (hidden)
};

// Render the plot
Plotly.newPlot("map", plotData, plotLayout, { responsive: true, scrollZoom: true });

// Function to generate unique IDs
function uniqueID() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

// Function to add missions and events
// Function to dynamically display mission-specific input fields
document
    .getElementById("missionType")
    .addEventListener("change", function () {
        const missionDetails = document.getElementById("missionDetails");
        missionDetails.innerHTML = ""; // Clear existing inputs

        const selectedType = this.value;

        if (selectedType === "direct") {
            // Direct Mission: Single Pickup and Drop-off
            addDirectMissionFields(missionDetails);
        } else if (selectedType === "multipleDropOff") {
            // Multiple Drop Off: Single Pickup with Multiple Destinations
            addMultipleDropOffFields(missionDetails);
        } else if (selectedType === "multiplePickUp") {
            // Multiple Pick Up: Multiple Pickups with Single Destination
            addMultiplePickUpFields(missionDetails);
        }
    });

// Function to add fields for Direct Mission
function addDirectMissionFields(container) {
    // Start Point
    const startLabel = document.createElement("label");
    startLabel.setAttribute("for", "startPoint");
    startLabel.innerText = "Start Point:";
    const startSelect = document.createElement("select");
    startSelect.id = "startPoint";
    startSelect.innerHTML =
        '<option value="">-- Select Start Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        startSelect.appendChild(option);
    });

    // Destination Point
    const destLabel = document.createElement("label");
    destLabel.setAttribute("for", "destPoint");
    destLabel.innerText = "Destination Point:";
    const destSelect = document.createElement("select");
    destSelect.id = "destPoint";
    destSelect.innerHTML =
        '<option value="">-- Select Destination Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        destSelect.appendChild(option);
    });

    // Reward Amount
    const rewardLabel = document.createElement("label");
    rewardLabel.setAttribute("for", "rewardAmount");
    rewardLabel.innerText = "Reward Amount (Credits):";
    const rewardInput = document.createElement("input");
    rewardInput.type = "number";
    rewardInput.id = "rewardAmount";
    rewardInput.min = "0";
    rewardInput.placeholder = "e.g., 20000";

    // Cargo Entries Container
    const cargoContainer = document.createElement("div");
    cargoContainer.id = "cargoContainer";
    cargoContainer.className = "cargoContainer";

    // Add Cargo Button
    const addCargoButton = document.createElement("button");
    addCargoButton.type = "button";
    addCargoButton.innerText = "Add Cargo";
    addCargoButton.className = "add-location-button";
    addCargoButton.addEventListener("click", function () {
        addCargoEntry(cargoContainer);
    });

    // Append elements to container
    container.appendChild(startLabel);
    container.appendChild(startSelect);
    container.appendChild(destLabel);
    container.appendChild(destSelect);
    container.appendChild(rewardLabel);
    container.appendChild(rewardInput);
    container.appendChild(addCargoButton);
    container.appendChild(cargoContainer);

    // Add initial cargo entry
    addCargoEntry(cargoContainer);
}

// Function to add fields for Multiple Drop Off Mission
function addMultipleDropOffFields(container) {
    // Reward Amount
    const rewardLabel = document.createElement("label");
    rewardLabel.setAttribute("for", "rewardAmount");
    rewardLabel.innerText = "Reward Amount (Credits):";
    const rewardInput = document.createElement("input");
    rewardInput.type = "number";
    rewardInput.id = "rewardAmount";
    rewardInput.min = "0";
    rewardInput.placeholder = "e.g., 20000";

    // Start Point
    const startLabel = document.createElement("label");
    startLabel.setAttribute("for", "startPoint");
    startLabel.innerText = "Start Point:";
    const startSelect = document.createElement("select");
    startSelect.id = "startPoint";
    startSelect.innerHTML =
        '<option value="">-- Select Start Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        startSelect.appendChild(option);
    });

    // Destination Points Container
    const destsContainer = document.createElement("div");
    destsContainer.id = "destsContainer";

    // Add Destination Button
    const addDestButton = document.createElement("button");
    addDestButton.type = "button";
    addDestButton.className = "add-location-button";
    addDestButton.innerText = "Add Destination";
    addDestButton.addEventListener("click", function () {
        addDestinationEntry(destsContainer);
    });

    // Append elements to container
    container.appendChild(rewardLabel);
    container.appendChild(rewardInput);
    container.appendChild(startLabel);
    container.appendChild(startSelect);
    container.appendChild(addDestButton);
    container.appendChild(destsContainer);

    // Add initial destination entry
    addDestButton.click();
}

// Function to add fields for Multiple Pick Up Mission
function addMultiplePickUpFields(container) {
    // Reward Amount
    const rewardLabel = document.createElement("label");
    rewardLabel.setAttribute("for", "rewardAmount");
    rewardLabel.innerText = "Reward Amount (Credits):";
    const rewardInput = document.createElement("input");
    rewardInput.type = "number";
    rewardInput.id = "rewardAmount";
    rewardInput.min = "0";
    rewardInput.placeholder = "e.g., 20000";

    // Destination Point
    const destLabel = document.createElement("label");
    destLabel.setAttribute("for", "destPoint");
    destLabel.innerText = "Destination Point:";
    const destSelect = document.createElement("select");
    destSelect.id = "destPoint";
    destSelect.innerHTML =
        '<option value="">-- Select Destination Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        destSelect.appendChild(option);
    });

    // Start Points Container
    const startsContainer = document.createElement("div");
    startsContainer.id = "startsContainer";

    // Add Start Point Button
    const addStartButton = document.createElement("button");
    addStartButton.type = "button";
    addStartButton.className = "add-location-button";
    addStartButton.innerText = "Add Start Point";
    addStartButton.addEventListener("click", function () {
        addStartEntry(startsContainer);
    });

    // Append elements to container
    container.appendChild(rewardLabel);
    container.appendChild(rewardInput);
    container.appendChild(destLabel);
    container.appendChild(destSelect);
    container.appendChild(addStartButton);
    container.appendChild(startsContainer);

    // Add initial start entry
    addStartButton.click();
}

// Function to add a Destination Entry (for Multiple Drop Off)
function addDestinationEntry(container) {
    const destEntryDiv = document.createElement("div");
    destEntryDiv.className = "location-entry";

    const destHeader = document.createElement("h4");
    destHeader.innerText = "Destination";

    // Destination Point
    const destPointLabel = document.createElement("label");
    destPointLabel.innerText = "Destination Point:";
    const destPointSelect = document.createElement("select");
    destPointSelect.className = "destPointSelect";
    destPointSelect.innerHTML =
        '<option value="">-- Select Destination Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        destPointSelect.appendChild(option);
    });

    // Cargo Entries Container
    const cargoContainer = document.createElement("div");
    cargoContainer.className = "cargoContainer";

    // Add Cargo Button
    const addCargoButton = document.createElement("button");
    addCargoButton.type = "button";
    addCargoButton.innerText = "Add Cargo";
    addCargoButton.addEventListener("click", function () {
        addCargoEntry(cargoContainer);
    });

    // Append elements to destination entry
    destEntryDiv.appendChild(destHeader);
    destEntryDiv.appendChild(destPointLabel);
    destEntryDiv.appendChild(destPointSelect);
    destEntryDiv.appendChild(addCargoButton);
    destEntryDiv.appendChild(cargoContainer);

    // Remove Destination Button
    const removeDestButton = document.createElement("button");
    removeDestButton.type = "button";
    removeDestButton.innerText = "Remove Destination";
    removeDestButton.addEventListener("click", function () {
        container.removeChild(destEntryDiv);
    });
    destEntryDiv.appendChild(removeDestButton);

    container.appendChild(destEntryDiv);

    // Add initial cargo entry
    addCargoButton.click();
}

// Function to add a Start Point Entry (for Multiple Pick Up)
function addStartEntry(container) {
    const startEntryDiv = document.createElement("div");
    startEntryDiv.className = "location-entry";

    const startHeader = document.createElement("h4");
    startHeader.innerText = "Start Point";

    // Start Point
    const startPointLabel = document.createElement("label");
    startPointLabel.innerText = "Start Point:";
    const startPointSelect = document.createElement("select");
    startPointSelect.className = "startPointSelect";
    startPointSelect.innerHTML =
        '<option value="">-- Select Start Point --</option>';
    allPOIs.forEach((poi) => {
        const option = document.createElement("option");
        option.value = poi.name;
        option.text = poi.name;
        startPointSelect.appendChild(option);
    });

    // Cargo Entries Container
    const cargoContainer = document.createElement("div");
    cargoContainer.className = "cargoContainer";

    // Add Cargo Button
    const addCargoButton = document.createElement("button");
    addCargoButton.type = "button";
    addCargoButton.innerText = "Add Cargo";
    addCargoButton.addEventListener("click", function () {
        addCargoEntry(cargoContainer);
    });

    // Append elements to start entry
    startEntryDiv.appendChild(startHeader);
    startEntryDiv.appendChild(startPointLabel);
    startEntryDiv.appendChild(startPointSelect);
    startEntryDiv.appendChild(addCargoButton);
    startEntryDiv.appendChild(cargoContainer);

    // Remove Start Point Button
    const removeStartButton = document.createElement("button");
    removeStartButton.type = "button";
    removeStartButton.innerText = "Remove Start Point";
    removeStartButton.addEventListener("click", function () {
        container.removeChild(startEntryDiv);
    });
    startEntryDiv.appendChild(removeStartButton);

    container.appendChild(startEntryDiv);

    // Add initial cargo entry
    addCargoButton.click();
}

// Function to add a Cargo Entry (for Direct Mission)
function addCargoEntry(container) {
    const cargoEntryDiv = document.createElement("div");
    cargoEntryDiv.className = "cargo-entry";

    // Cargo Type
    const cargoTypeInput = document.createElement("input");
    cargoTypeInput.type = "text";
    cargoTypeInput.placeholder = "Cargo Type";
    cargoTypeInput.className = "cargoType";

    // Cargo Quantity
    const cargoAmountInput = document.createElement("input");
    cargoAmountInput.type = "number";
    cargoAmountInput.placeholder = "Quantity (SCU)";
    cargoAmountInput.min = "1";
    cargoAmountInput.className = "cargoAmount";

    // Remove Cargo Button
    const removeCargoButton = document.createElement("button");
    removeCargoButton.type = "button";
    removeCargoButton.innerText = "Remove Cargo";
    removeCargoButton.addEventListener("click", function () {
        container.removeChild(cargoEntryDiv);
    });

    // Append elements to cargo entry
    cargoEntryDiv.appendChild(cargoTypeInput);
    cargoEntryDiv.appendChild(cargoAmountInput);
    cargoEntryDiv.appendChild(removeCargoButton);

    container.appendChild(cargoEntryDiv);
}

// Handle adding missions
document
    .getElementById("addMissionButton")
    .addEventListener("click", () => {
        const missionType = document.getElementById("missionType").value;
        if (!missionType) {
            alert("Please select a mission type.");
            return;
        }

        let rewardAmount;
        let startingPoint, destinationPoint;
        let cargoEntries = [];

        if (missionType === "direct") {
            const cargoType = document
                .getElementById("cargoType")
                .value.trim();
            const cargoAmount = parseFloat(
                document.getElementById("cargoAmount").value
            );
            rewardAmount = parseFloat(
                document.getElementById("rewardAmount").value
            );
            startingPoint = document.getElementById("startPoint").value;
            destinationPoint = document.getElementById("destPoint").value;

            if (
                !cargoType ||
                isNaN(cargoAmount) ||
                isNaN(rewardAmount) ||
                !startingPoint ||
                !destinationPoint
            ) {
                alert(
                    "Please fill in all cargo details for the Direct mission."
                );
                return;
            }

            cargoEntries.push({
                type: cargoType,
                quantity: cargoAmount,
                from: startingPoint,
                to: destinationPoint,
            });
        } else if (missionType === "multipleDropOff") {
            rewardAmount = parseFloat(
                document.getElementById("rewardAmount").value
            );
            startingPoint = document.getElementById("startPoint").value;
            if (!startingPoint || isNaN(rewardAmount)) {
                alert(
                    "Please fill in all details for the Multiple Drop Off mission."
                );
                return;
            }

            const destinationEntries = document.querySelectorAll(
                ".location-entry"
            );
            if (destinationEntries.length === 0) {
                alert("Please add at least one destination.");
                return;
            }

            for (let entry of destinationEntries) {
                const destPoint = entry.querySelector(
                    ".destPointSelect"
                ).value;
                if (!destPoint) {
                    alert("Please select all destination points.");
                    return;
                }
                const cargoContainers = entry.querySelectorAll(
                    ".cargoContainer"
                );
                cargoContainers.forEach((container) => {
                    const cargoTypeInputs = container.querySelectorAll(
                        ".cargoType"
                    );
                    const cargoAmountInputs = container.querySelectorAll(
                        ".cargoAmount"
                    );
                    for (let i = 0; i < cargoTypeInputs.length; i++) {
                        const type = cargoTypeInputs[i].value.trim();
                        const quantity = parseFloat(
                            cargoAmountInputs[i].value
                        );
                        if (!type || isNaN(quantity)) {
                            alert(
                                "Please fill in all cargo entry details for Multiple Drop Off mission."
                            );
                            return;
                        }
                        cargoEntries.push({
                            type: type,
                            quantity: quantity,
                            from: startingPoint,
                            to: destPoint,
                        });
                    }
                });
            }
        } else if (missionType === "multiplePickUp") {
            rewardAmount = parseFloat(
                document.getElementById("rewardAmount").value
            );
            destinationPoint = document.getElementById("destPoint").value;
            if (!destinationPoint || isNaN(rewardAmount)) {
                alert(
                    "Please fill in all details for the Multiple Pick Up mission."
                );
                return;
            }

            const startEntries = document.querySelectorAll(".location-entry");
            if (startEntries.length === 0) {
                alert("Please add at least one start point.");
                return;
            }

            for (let entry of startEntries) {
                const startPoint = entry.querySelector(
                    ".startPointSelect"
                ).value;
                if (!startPoint) {
                    alert("Please select all start points.");
                    return;
                }
                const cargoContainers = entry.querySelectorAll(
                    ".cargoContainer"
                );
                cargoContainers.forEach((container) => {
                    const cargoTypeInputs = container.querySelectorAll(
                        ".cargoType"
                    );
                    const cargoAmountInputs = container.querySelectorAll(
                        ".cargoAmount"
                    );
                    for (let i = 0; i < cargoTypeInputs.length; i++) {
                        const type = cargoTypeInputs[i].value.trim();
                        const quantity = parseFloat(
                            cargoAmountInputs[i].value
                        );
                        if (!type || isNaN(quantity)) {
                            alert(
                                "Please fill in all cargo entry details for Multiple Pick Up mission."
                            );
                            return;
                        }
                        cargoEntries.push({
                            type: type,
                            quantity: quantity,
                            from: startPoint,
                            to: destinationPoint,
                        });
                    }
                });
            }
        }

        // Create mission object
        const mission = {
            type: missionType,
            rewardAmount: rewardAmount,
            cargoEntries: cargoEntries,
        };

        // Add mission to the mission list and process events
        addMissionToList(mission);

        // Clear mission form
        clearMissionForm();
    });

// Function to clear mission input form
function clearMissionForm() {
    document.getElementById("missionType").value = "";
    const missionDetails = document.getElementById("missionDetails");
    missionDetails.innerHTML = "";
}

// Function to add mission to the list and process events

let missionIDCounter = 1; // Global counter for mission IDs
function addMissionToList(mission) {
    // Assign a missionID based on the order
    mission.missionID = missionIDCounter++;
    
    // Add the mission to the global list
    missions.push(mission);

    // Log to confirm mission added
    console.log("Mission added:", mission);

    // Process cargo entries into events
    mission.cargoEntries.forEach((entry) => {
        const pickupID = uniqueID();
        const dropoffID = uniqueID();

        // Create pickup event
        const pickupEvent = {
            id: pickupID,
            type: "pickup",
            location: entry.from,
            cargo: [{ type: entry.type, quantity: entry.quantity, destination: entry.to }],
            correspondingDropOffID: dropoffID,
            missionID: mission.missionID,
        };

        // Create drop-off event
        const dropoffEvent = {
            id: dropoffID,
            type: "dropoff",
            location: entry.to,
            cargo: [{ type: entry.type, quantity: entry.quantity, origin: entry.from }],
            correspondingPickupID: pickupID,
            missionID: mission.missionID,
        };

        // Add events to the global events list
        events.push(pickupEvent);
        events.push(dropoffEvent);

        // Log to confirm events added
        console.log("Pickup Event added:", pickupEvent);
        console.log("Dropoff Event added:", dropoffEvent);
    });


    // Update the mission list UI
    const missionList = document.getElementById("missionList");
    const li = document.createElement("li");

    let missionText = `<strong>Type:</strong> ${formatMissionType(
        mission.type
    )}<br>`;
    missionText += `<strong>Cargo:</strong><br>`;
    mission.cargoEntries.forEach((entry) => {
        missionText += `&nbsp;&nbsp;- ${entry.quantity} SCU of ${entry.type} from ${entry.from} to ${entry.to}<br>`;
    });
    missionText += `<strong>Reward:</strong> ${mission.rewardAmount} Credits<br>`;

    li.innerHTML = missionText;
    missionList.appendChild(li);
}

// Helper function to format mission type
function formatMissionType(type) {
    if (type === "direct") return "Direct";
    if (type === "multipleDropOff") return "Multiple Drop Off";
    if (type === "multiplePickUp") return "Multiple Pick Up";
    return "";
}

// Handle route calculation
document.getElementById("calculateRouteButton").addEventListener("click", async () => {
    console.log("Calculate Route button clicked.");

    if (missions.length === 0) {
        alert("Please add at least one mission.");
        console.warn("No missions found.");
        return;
    }

    const selectedStartingLocationName = document.getElementById("startingLocation").value;
    if (!selectedStartingLocationName) {
        alert("Please select a starting location.");
        console.warn("No starting location selected.");
        return;
    }

    const startingLocation = allPOIs.find((p) => p.name === selectedStartingLocationName);
    if (!startingLocation) {
        alert("Selected starting location is invalid.");
        console.error("Selected starting location not found in allPOIs:", selectedStartingLocationName);
        return;
    }

    // Read algorithm parameters from input fields
    const populationSize = parseInt(document.getElementById("populationSize").value) || 100;
    const generations = parseInt(document.getElementById("generations").value) || 200;
    const mutationRate = parseFloat(document.getElementById("mutationRate").value) || 0.1;

    // Validate parameters
    if (populationSize < 10 || generations < 10 || mutationRate < 0 || mutationRate > 1) {
        alert("Please enter valid algorithm parameters.");
        console.warn("Invalid algorithm parameters:", { populationSize, generations, mutationRate });
        return;
    }

    // Show loading bar
    const loadingBarContainer = document.getElementById("loadingBarContainer");
    const loadingBar = document.getElementById("loadingBar");
    loadingBarContainer.style.display = "block";
    loadingBar.style.width = "0%";

    // Disable the calculate button to prevent multiple clicks
    const calculateButton = document.getElementById("calculateRouteButton");
    calculateButton.disabled = true;
    calculateButton.innerText = "Calculating...";

    // Reset the graph data
    Plotly.update('routeLengthGraph', { x: [[]], y: [[]] }, {});

    try {
        console.log("Starting GA to calculate optimal route.");
        // Calculate the optimal route asynchronously
        const { optimalRoute, poiMap, distanceMap, routeLengths } = await calculateOptimalRoute(
            startingLocation,
            events,
            allPOIs,
            populationSize,
            generations,
            mutationRate,
            updateLoadingBar // Pass the updateLoadingBar function
        );

        // Debugging logs
        console.log("Optimal Route:", optimalRoute);
        console.log("POI Map:", poiMap);
        console.log("Distance Map:", distanceMap);

        // Inspect each event in the optimal route
        optimalRoute.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, event);
        });

        // Check if optimalRoute is an array
        if (!Array.isArray(optimalRoute)) {
            alert("Failed to calculate an optimal route. Please try again.");
            console.error("Optimal Route is not an array:", optimalRoute);
            // Hide loading bar and re-enable button
            loadingBarContainer.style.display = "none";
            calculateButton.disabled = false;
            calculateButton.innerText = "Calculate Optimal Route";
            return;
        }

        if (optimalRoute.length === 0) {
            alert("No valid route found. Please adjust your missions or starting location.");
            console.warn("Optimal Route is empty.");
            // Hide loading bar and re-enable button
            loadingBarContainer.style.display = "none";
            calculateButton.disabled = false;
            calculateButton.innerText = "Calculate Optimal Route";
            return;
        }

        // Calculate total distance
        const totalDistance = calculateTotalDistance(optimalRoute, startingLocation, poiMap, distanceMap);
        console.log("Total Distance:", totalDistance);

        // Calculate total reward
        const totalReward = calculateTotalReward(missions);
        console.log("Total Reward:", totalReward);

        // Generate route summary
        const routeSummary = generateRouteSummary(optimalRoute, allPOIs); // Corrected parameters
        console.log("Route Summary:", routeSummary);

        // Update the map with the route
        updateRouteOnMap(optimalRoute, startingLocation);

        // Update the summary
        updateSummary(routeSummary, totalDistance, totalReward, startingLocation);

        // Finalize the graph with all route lengths
        routeLengths.forEach((length, index) => {
            Plotly.extendTraces('routeLengthGraph', {
                x: [[index + 1]],
                y: [[length]]
            }, [0]);
        });

        // Optionally, adjust the layout to fit all data
        Plotly.relayout('routeLengthGraph', {
            'xaxis.range': [0, Math.max(50, generations + 10)],
            'yaxis.range': [0, Math.max(...routeLengths) + 500]
        });

    } catch (error) {
        console.error("Error during route calculation:", error);
        alert("An error occurred during route calculation. Please check the console for details.");
    } finally {
        // Hide loading bar and re-enable button
        loadingBarContainer.style.display = "none";
        calculateButton.disabled = false;
        calculateButton.innerText = "Calculate Optimal Route";
        console.log("Route calculation process completed.");
    }
});

/**
 * Updates the loading bar, displays the best route so far, and updates the route length graph.
 *
 * @param {string} progress - The progress percentage as a string.
 * @param {Array} bestRouteSoFar - The current best route.
 * @param {Object} startingLocation - The starting location object.
 * @param {number} generation - Current generation number.
 * @param {number} currentRouteLength - Total distance of the best route so far.
 */
function updateLoadingBar(progress, bestRouteSoFar, startingLocation, generation, currentRouteLength) {
    const loadingBar = document.getElementById("loadingBar");
    loadingBar.style.width = progress + "%";

    // Update the map with the best route so far
    updateRouteOnMap(bestRouteSoFar, startingLocation, true); // 'true' indicates a temporary route

    // Update the Route Length Graph
    if (generation && currentRouteLength) {
        Plotly.extendTraces('routeLengthGraph', {
            x: [[generation]],
            y: [[currentRouteLength]]
        }, [0]);

        // Optionally, adjust the layout to fit new data
        Plotly.relayout('routeLengthGraph', {
            'xaxis.range': [0, Math.max(50, generation + 10)],
            'yaxis.range': [0, Math.max(1000, currentRouteLength + 500)]
        });
    }
}

// ========================
// Additional Utility Functions
// ========================

/**
 * Updates the route on the map using Plotly without adding any arrows.
 *
 * @param {Array} route - The route to display on the map.
 * @param {Object} startingLocation - The starting location object.
 * @param {boolean} isTemporary - Flag indicating if the route is temporary.
 */
function updateRouteOnMap(route, startingLocation, isTemporary = false) {
    // Remove existing route leg traces
    // Assuming route legs are named as "Route Leg N" or "Temporary Route Leg N"
    plotData = plotData.filter(trace => {
        return !(trace.name.startsWith("Route Leg") || trace.name.startsWith("Temporary Route Leg"));
    });

    // Since arrows are no longer needed, ensure no arrow annotations are present
    // Remove all annotations that were previously used for arrows
    plotLayout.annotations = plotLayout.annotations.filter(annotation => {
        // Keep annotations that have text or are not route arrows
        // Route arrows had 'route-arrow' as their name
        return !(annotation.name === 'route-arrow');
    });

    if (route.length === 0) return;

    // Prepare route legs
    const routeLegs = [];
    const routeX = [startingLocation.x];
    const routeY = [startingLocation.y];

    route.forEach((event) => {
        const poi = allPOIs.find(p => p.name === event.location);
        if (poi) {
            routeX.push(poi.x);
            routeY.push(poi.y);
        } else {
            console.error("Location not found in allPOIs:", event.location);
        }
    });

    for (let i = 0; i < routeX.length - 1; i++) {
        routeLegs.push({
            from: { x: routeX[i], y: routeY[i] },
            to: { x: routeX[i + 1], y: routeY[i + 1] }
        });
    }

    // Define a color palette
    const routeColors = [
        'rgba(255, 0, 0, 0.9)',    // Red
        'rgba(0, 255, 0, 0.9)',    // Green
        'rgba(0, 0, 255, 0.9)',    // Blue
        'rgba(255, 255, 0, 0.9)',  // Yellow
        'rgba(255, 0, 255, 0.9)',  // Magenta
        'rgba(0, 255, 255, 0.9)',  // Cyan
        'rgba(255, 165, 0, 0.9)',  // Orange
        'rgba(128, 0, 128, 0.9)',  // Purple
        'rgba(0, 128, 128, 0.9)',  // Teal
        'rgba(128, 128, 0, 0.9)'   // Olive
    ];

    // Plot each leg with a different color and solid line
    routeLegs.forEach((leg, index) => {
        const color = routeColors[index % routeColors.length];
        const legTrace = {
            x: [leg.from.x, leg.to.x],
            y: [leg.from.y, leg.to.y],
            mode: "lines",
            type: "scatter",
            name: isTemporary ? `Temporary Route Leg ${index + 1}` : `Route Leg ${index + 1}`,
            line: {
                color: color,
                width: 2,
                dash: 'solid' // Solid line
            },
            hoverinfo: "none",
            showlegend: false,
        };
        plotData.push(legTrace);
    });

    // Update the plot with the new route legs
    Plotly.react("map", plotData, plotLayout, { responsive: true, scrollZoom: true });
}

/**
 * Updates the summary section with route details.
 *
 * @param {Array} routeSummary - The summary of the route.
 * @param {number} totalDistance - The total distance of the route.
 * @param {number} totalReward - The total reward accumulated.
 * @param {Object} startingLocation - The starting location object.
 */
function updateSummary(routeSummary, totalDistance, totalReward, startingLocation) {
    console.log("updateSummary called with:", { routeSummary, totalDistance, totalReward, startingLocation });

    // Update total distance and reward
    const totalDistanceElem = document.getElementById("totalDistance");
    const totalRewardElem = document.getElementById("totalReward");
    const routeDetails = document.getElementById("routeDetails");

    if (!totalDistanceElem || !totalRewardElem || !routeDetails) {
        console.error("One or more summary DOM elements are missing.");
        return;
    }

    totalDistanceElem.innerText = `Total Distance: ${totalDistance.toFixed(2)} Gm`;
    totalRewardElem.innerText = `Total Reward: ${totalReward} Credits`;

    routeDetails.innerHTML = ""; // Clear existing summary

    // Add starting location as the first stop
    const startLi = document.createElement("li");
    startLi.innerHTML = `<strong>Start at: ${startingLocation.name}</strong>`;
    routeDetails.appendChild(startLi);

    let visitCounts = {};  // Track visit counts per location
    let condensedSummary = [];
    let currentStop = null;
    let lastLocation = null;

    /**
     * Function to organize actions by cargo type, ensuring uniqueness.
     * @param {Array} actions - Array of action strings
     * @returns {Object} - Grouped summary by cargo type
     */
    const organizeSummary = (actions) => {
        let summaryByCargoType = {};
        const uniqueEntries = new Set(); // To track unique actions

        actions.forEach((action) => {
            // Enhanced regex to capture all necessary details
            const matches = action.match(/(Pick Up|Drop Off) (\d+) SCU of (\w+) \((Origin|Destination): ([^)]+)\) \(Mission ID: (\d+)\)/);
            if (matches) {
                const [, actionType, quantity, cargoType, direction, location, missionID] = matches;

                // Include quantity in the uniqueness key to prevent duplicates
                const key = `${missionID}-${cargoType}-${direction}-${location}-${quantity}`;

                // If this exact action has already been processed, skip it
                if (uniqueEntries.has(key)) {
                    return; // Duplicate found; skip processing
                }

                uniqueEntries.add(key); // Mark this action as processed

                // Initialize cargo type in summary if not present
                if (!summaryByCargoType[cargoType]) {
                    summaryByCargoType[cargoType] = {
                        total: 0,
                        breakdown: []
                    };
                }

                // Update total SCU for the cargo type
                summaryByCargoType[cargoType].total += parseInt(quantity);

                // Add breakdown entry for this unique action
                summaryByCargoType[cargoType].breakdown.push({
                    quantity: parseInt(quantity),
                    missionID: missionID,
                    location: location
                });
            }
        });

        return summaryByCargoType;
    };

    // Condense the route summary into stops with pickups and drop-offs
    routeSummary.forEach((step) => {
        const location = step.location;

        // Initialize visit count if this is the first encounter
        if (!visitCounts[location]) {
            visitCounts[location] = 1;
        } else if (lastLocation !== location) {
            // If the location is revisited but not consecutively, increment the visit count
            visitCounts[location]++;
        }

        // If this is a new location or there are no current stops, create a new entry
        if (lastLocation !== location) {
            if (currentStop) {
                condensedSummary.push(currentStop); // Push the previous stop to the summary
            }
            currentStop = { 
                location: location, 
                pickUps: [], 
                dropOffs: [], 
                visitCount: visitCounts[location] 
            };
        }

        // Differentiate between pickups and drop-offs
        if (step.action.includes("Pick Up")) {
            currentStop.pickUps.push(step.action);
        } else if (step.action.includes("Drop Off")) {
            currentStop.dropOffs.push(step.action);
        }

        // Update lastLocation for tracking consecutive visits
        lastLocation = location;
    });

    // Push the final stop to the condensed summary
    if (currentStop) {
        condensedSummary.push(currentStop);
    }

    console.log("Condensed Summary:", condensedSummary);

    // Render the condensed summary
    condensedSummary.forEach((stop, index) => {
        const visitSuffix = stop.visitCount > 1 ? ` (Visit ${stop.visitCount})` : '';
        const li = document.createElement("li");

        // Create the stop header
        li.innerHTML = `<h2>Stop ${index + 1}: ${stop.location}${visitSuffix}</h2>`;

        // Organize and display pickups
        if (stop.pickUps.length > 0) {
            const pickUpSummary = organizeSummary(stop.pickUps);
            li.innerHTML += `<strong class="summary-header">Pickups</strong><br>`;
            Object.keys(pickUpSummary).forEach((cargoType) => {
                const cargo = pickUpSummary[cargoType];
                li.innerHTML += `
                    <ul class="cargo-list">
                        <li><strong>${cargoType}</strong> [${cargo.total} SCU to collect]
                            <ul class="mission-breakdown">
                `;
                cargo.breakdown.forEach((entry) => {
                    li.innerHTML += `<li>${entry.quantity} SCU [Mission ${entry.missionID}, Destination: ${entry.location}]</li>`;
                });
                li.innerHTML += `
                            </ul>
                        </li>
                    </ul>
                `;
            });
        }

        // Organize and display drop-offs
        if (stop.dropOffs.length > 0) {
            const dropOffSummary = organizeSummary(stop.dropOffs);
            li.innerHTML += `<strong class="summary-header">Drop offs</strong><br>`;
            Object.keys(dropOffSummary).forEach((cargoType) => {
                const cargo = dropOffSummary[cargoType];
                li.innerHTML += `
                    <ul class="cargo-list">
                        <li><strong>${cargoType}</strong> [${cargo.total} SCU to deliver]
                            <ul class="mission-breakdown">
                `;
                cargo.breakdown.forEach((entry) => {
                    li.innerHTML += `<li>${entry.quantity} SCU [Mission ${entry.missionID}, Origin: ${entry.location}]</li>`;
                });
                li.innerHTML += `
                            </ul>
                        </li>
                    </ul>
                `;
            });
        }

        // Calculate total pickups and drop-offs for the stop based on unique entries
        const totalPickUp = Object.values(organizeSummary(stop.pickUps)).reduce((sum, cargo) => sum + cargo.total, 0);
        const totalDropOff = Object.values(organizeSummary(stop.dropOffs)).reduce((sum, cargo) => sum + cargo.total, 0);
        li.innerHTML += `<br><strong>Pick up: ${totalPickUp} SCU Drop off: ${totalDropOff} SCU</strong>`;

        routeDetails.appendChild(li);
    });

    console.log("Summary updated successfully.");
}
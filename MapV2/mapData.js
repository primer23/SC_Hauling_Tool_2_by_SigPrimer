// mapData.js

// Function to convert polar coordinates to Cartesian
export function polarToCartesian(angleDeg, distance) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = distance * Math.cos(angleRad);
    const y = distance * Math.sin(angleRad);
    return { x, y };
}

// Data for systems
export const systems = [
    {
        name: "Hurston",
        lagrangeColor: "#FF69B4", // Hot pink
        planet: {
            name: "Hurston",
            angle: 0.0,
            distance: 12.85,
            type: "Planet",
        },
        orbitalStation: {
            name: "Everus Harbour",
            angle: 0.0,
            distance: 12.850459,
            type: "Orbital Station",
        },
        lagrangePoints: [
            { name: "HUR-L1", angle: 0.0, distance: 11.56, type: "Lagrange Point" },
            { name: "HUR-L2", angle: 0.0, distance: 14.13, type: "Lagrange Point" },
            { name: "HUR-L3", angle: -179.99, distance: 12.85, type: "Lagrange Point" },
            { name: "HUR-L4", angle: 60.0, distance: 12.85, type: "Lagrange Point" },
            { name: "HUR-L5", angle: -60.0, distance: 12.85, type: "Lagrange Point" },
        ],
        moons: [
            { name: "Arial", angle: -0.13, distance: 12.89, type: "Moon" },
            { name: "Aberdeen", angle: 0.18, distance: 12.9, type: "Moon" },
            { name: "Magda", angle: -0.33, distance: 12.79, type: "Moon" },
            { name: "Ita", angle: 0.51, distance: 12.83, type: "Moon" },
        ],
    },
    {
        name: "Crusader",
        lagrangeColor: "#00CED1", // Dark turquoise
        planet: {
            name: "Crusader",
            angle: -171.99,
            distance: 19.14,
            type: "Planet",
        },
        orbitalStation: {
            name: "Seraphim Station",
            angle: -171.98,
            distance: 19.15,
            type: "Orbital Station",
        },
        lagrangePoints: [
            { name: "CRU-L1", angle: -171.99, distance: 17.23, type: "Lagrange Point" },
            { name: "CRU-L2", angle: -171.99, distance: 21.06, type: "Lagrange Point" },
            { name: "CRU-L3", angle: 8.0, distance: 19.14, type: "Lagrange Point" },
            { name: "CRU-L4", angle: -112.0, distance: 19.14, type: "Lagrange Point" },
            { name: "CRU-L5", angle: 127.99, distance: 19.14, type: "Lagrange Point" },
        ],
        moons: [
            { name: "Cellin", angle: -171.88, distance: 19.17, type: "Moon" },
            { name: "Daymar", angle: -172.14, distance: 19.1, type: "Moon" },
            { name: "Yela", angle: -172.17, distance: 19.2, type: "Moon" },
        ],
    },
    {
        name: "ArcCorp",
        lagrangeColor: "#FFD700", // Gold
        planet: {
            name: "ArcCorp",
            angle: -50.0,
            distance: 28.91,
            type: "Planet",
        },
        orbitalStation: {
            name: "Baijini Point",
            angle: -50.0,
            distance: 28.910459,
            type: "Orbital Station",
        },
        lagrangePoints: [
            { name: "ARC-L1", angle: -49.99, distance: 26.09, type: "Lagrange Point" },
            { name: "ARC-L2", angle: -49.99, distance: 31.8, type: "Lagrange Point" },
            { name: "ARC-L3", angle: 149.99, distance: 28.91, type: "Lagrange Point" },
            { name: "ARC-L4", angle: -9.99, distance: 28.91, type: "Lagrange Point" },
            { name: "ARC-L5", angle: -109.99, distance: 28.91, type: "Lagrange Point" },
        ],
        moons: [
            { name: "Lyria", angle: -49.78, distance: 28.96, type: "Moon" },
            { name: "Wala", angle: -50.12, distance: 28.66, type: "Moon" },
        ],
    },
    {
        name: "microTech",
        lagrangeColor: "#8A2BE2", // Blue violet
        planet: {
            name: "microTech",
            angle: 58.86,
            distance: 43.44,
            type: "Planet",
        },
        orbitalStation: {
            name: "Port Tressler",
            angle: 58.86,
            distance: 43.440459,
            type: "Orbital Station",
        },
        lagrangePoints: [
            { name: "MIC-L1", angle: 58.86, distance: 39.9, type: "Lagrange Point" },
            { name: "MIC-L2", angle: 58.86, distance: 47.78, type: "Lagrange Point" },
            { name: "MIC-L3", angle: -121.12, distance: 43.44, type: "Lagrange Point" },
            { name: "MIC-L4", angle: 118.86, distance: 43.44, type: "Lagrange Point" },
            { name: "MIC-L5", angle: -1.12, distance: 43.44, type: "Lagrange Point" },
        ],
        moons: [
            { name: "Calliope", angle: 58.92, distance: 43.39, type: "Moon" },
            { name: "Clio", angle: 58.78, distance: 43.36, type: "Moon" },
            { name: "Euterpe", angle: 58.76, distance: 43.37, type: "Moon" },
        ],
    },
];

// Jump Points
export const jumpPoints = [
    { name: "Stanton-Pyro", angle: -83.25, distance: 28.3, type: "Jump Point" },
    { name: "Stanton-Terra", angle: -5.88, distance: 51.57, type: "Jump Point" },
    { name: "Stanton-Magnus", angle: 159.35, distance: 69.55, type: "Jump Point" },
];

// Colors for different POI types
export const colors = {
    Planet: "#FF5733", // Vibrant red
    Moon: "#3498DB", // Bright blue
    "Orbital Station": "#2ECC71", // Green
    "Lagrange Point": "#F1C40F", // Yellow (will be overridden per system)
    "Jump Point": "#9B59B6", // Purple
    Star: "#FFD700", // Gold for central star
};

// Symbol mapping
export const symbols = {
    Planet: "circle",
    Moon: "diamond",
    "Orbital Station": "square",
    "Lagrange Point": "triangle-up",
    "Jump Point": "star",
    Star: "circle-open",
};

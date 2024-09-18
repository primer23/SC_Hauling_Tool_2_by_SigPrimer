// routing.js

// Function to calculate the optimal route using a Genetic Algorithm
export async function calculateOptimalRouteGA(
    startingLocation, events, allPOIs,
    populationSize = 100, generations = 200,
    mutationRate = 0.1, progressCallback
) {
    // Initialize parameters
    populationSize = populationSize || 100;
    generations = generations || 200;
    mutationRate = mutationRate || 0.1;

    // Precompute POI Map and Distance Map
    const poiMap = createPOIMap(allPOIs);
    const distanceMap = precomputeDistanceMap(allPOIs);

    // Generate initial population
    let population = generateInitialPopulation(populationSize, events);

    let bestRoute = null;
    let bestFitness = -Infinity;
    let routeLengths = []; // To store route lengths over generations

    for (let generation = 0; generation < generations; generation++) {
        // Evaluate fitness of population
        const fitnessValues = [];
        for (let route of population) {
            const { fitness, totalDistance } = calculateFitness(route, startingLocation, poiMap, distanceMap);
            fitnessValues.push({ route, fitness, totalDistance });
        }

        // Sort population by fitness (higher fitness is better)
        fitnessValues.sort((a, b) => b.fitness - a.fitness);
        population = fitnessValues.map(item => item.route);

        // Update best route
        if (fitnessValues[0].fitness > bestFitness) {
            bestFitness = fitnessValues[0].fitness;
            bestRoute = fitnessValues[0].route;
            const currentRouteLength = fitnessValues[0].totalDistance;
            routeLengths.push(currentRouteLength); // Store route length

            // Report progress and best route so far
            const progress = ((generation + 1) / generations) * 100;
            if (progressCallback) {
                progressCallback(progress.toFixed(2), bestRoute, startingLocation, generation + 1, currentRouteLength);
            }

            // Allow UI updates
            await sleep(0);
        }

        // Selection with elitism
        const eliteCount = Math.floor(populationSize * 0.1);
        const selectedRoutes = selection(population, fitnessValues, eliteCount);

        // Crossover
        let offspring = crossoverPopulation(selectedRoutes);

        // Mutation
        for (let i = 0; i < offspring.length; i++) {
            offspring[i] = mutate(offspring[i], mutationRate);
        }

        // Repair offspring to ensure validity
        for (let i = 0; i < offspring.length; i++) {
            offspring[i] = repairRoute(offspring[i], events, poiMap);
        }

        // Create new population
        population = [...selectedRoutes, ...offspring];

        // Optional: Limit population size if necessary
        if (population.length > populationSize) {
            population = population.slice(0, populationSize);
        }
    }

    return { 
        optimalRoute: bestRoute,
        poiMap: poiMap,
        distanceMap: distanceMap,
        routeLengths: routeLengths
    };
}
// Sleep function to allow UI updates
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Create POI Map for efficient lookups
export function createPOIMap(allPOIs) {
    const poiMap = new Map();
    allPOIs.forEach(poi => {
        poiMap.set(poi.name, poi);
    });
    return poiMap;
}

// Precompute Distance Map
export function precomputeDistanceMap(allPOIs) {
    const distanceMap = new Map();
    allPOIs.forEach(poi1 => {
        distanceMap.set(poi1.name, new Map());
        allPOIs.forEach(poi2 => {
            const dx = poi2.x - poi1.x;
            const dy = poi2.y - poi1.y;
            distanceMap.get(poi1.name).set(poi2.name, Math.sqrt(dx * dx + dy * dy));
        });
    });
    return distanceMap;
}

// Generate initial population
function generateInitialPopulation(populationSize, events) {
    const population = new Array(populationSize);
    for (let i = 0; i < populationSize; i++) {
        population[i] = createValidRoute(events);
    }
    return population;
}

// Create a valid route by shuffling events while maintaining constraints
function createValidRoute(events) {
    const pickups = events.filter(event => event.type === 'pickup');
    const dropoffs = events.filter(event => event.type === 'dropoff');

    // Shuffle pickups
    const shuffledPickups = shuffleArray(pickups);

    const route = [];
    const completedPickups = new Set();

    for (let pickup of shuffledPickups) {
        route.push(pickup);
        completedPickups.add(pickup.id);

        // Add corresponding drop-off
        const dropoff = dropoffs.find(event => event.correspondingPickupID === pickup.id);
        if (dropoff) {
            route.push(dropoff);
        }
    }

    return route;
}

// Fitness function
export function calculateFitness(route, startingLocation, poiMap, distanceMap) {
    let totalDistance = 0;
    let totalStops = 0;
    let currentLocationName = startingLocation.name;
    let visitedLocations = new Set();
    let pickupsDone = new Set();

    for (let event of route) {
        const eventLocationName = event.location;
        const eventDistance = distanceMap.get(currentLocationName).get(eventLocationName);
        totalDistance += eventDistance;

        if (!visitedLocations.has(eventLocationName)) {
            totalStops += 1;
            visitedLocations.add(eventLocationName);
        }

        if (event.type === 'pickup') {
            pickupsDone.add(event.id);
        } else if (event.type === 'dropoff') {
            if (!pickupsDone.has(event.correspondingPickupID)) {
                // Penalize if the drop-off is attempted before pickup
                totalDistance += 10000; // Large penalty for invalid drop-off
            }
        }

        currentLocationName = eventLocationName;
    }

    const fitness = 1 / (totalStops * totalDistance);
    return { fitness, totalDistance };
}


// Selection function with elitism
function selection(population, fitnessValues, eliteCount = 10) {
    // Assumes fitnessValues are sorted descending
    const elites = population.slice(0, eliteCount);
    const selectedSize = Math.floor(population.length / 2) - eliteCount;
    const selected = population.slice(eliteCount, eliteCount + selectedSize);
    return [...elites, ...selected];
}

// Crossover function
function crossoverPopulation(selectedRoutes) {
    const offspring = [];
    const len = selectedRoutes.length;
    for (let i = 0; i < len - 1; i += 2) {
        const parent1 = selectedRoutes[i];
        const parent2 = selectedRoutes[i + 1];
        const [child1, child2] = crossover(parent1, parent2);
        offspring.push(child1, child2);
    }

    // If odd number of parents, clone the last one
    if (len % 2 !== 0) {
        offspring.push([...selectedRoutes[len - 1]]);
    }

    return offspring;
}

// Crossover two parent routes
function crossover(parent1, parent2) {
    // Implement Precedence Preserving Crossover (PPX)
    const child1 = precedencePreservingCrossover(parent1, parent2);
    const child2 = precedencePreservingCrossover(parent2, parent1);
    return [child1, child2];
}

// Precedence Preserving Crossover
function precedencePreservingCrossover(parent1, parent2) {
    const child = [];
    const remainingEvents = new Set(parent1.map(event => event.id));
    const parent2Order = new Map(parent2.map((event, index) => [event.id, index]));

    const sortedEvents = Array.from(remainingEvents).sort((a, b) => parent2Order.get(a) - parent2Order.get(b));

    sortedEvents.forEach(eventId => {
        const event = parent1.find(e => e.id === eventId);
        if (event) child.push(event);
    });

    return child;
}

// Mutation function
export function mutate(route, mutationRate) {
    if (Math.random() >= mutationRate) return route; // No mutation

    const mutatedRoute = route.slice(); // Shallow copy

    const len = mutatedRoute.length;
    const index1 = Math.floor(Math.random() * len);
    let index2 = Math.floor(Math.random() * len);

    // Ensure different indices
    while (index2 === index1) {
        index2 = Math.floor(Math.random() * len);
    }

    // Swap events
    [mutatedRoute[index1], mutatedRoute[index2]] = [mutatedRoute[index2], mutatedRoute[index1]];

    // Ensure pickup before dropoff
    const event1 = mutatedRoute[index1];
    const event2 = mutatedRoute[index2];

    if (event1.type === 'dropoff' && !mutatedRoute.slice(0, index1).some(e => e.id === event1.correspondingPickupID)) {
        // Swap back if invalid
        [mutatedRoute[index1], mutatedRoute[index2]] = [mutatedRoute[index2], mutatedRoute[index1]];
    }

    if (event2.type === 'dropoff' && !mutatedRoute.slice(0, index2).some(e => e.id === event2.correspondingPickupID)) {
        // Swap back if invalid
        [mutatedRoute[index1], mutatedRoute[index2]] = [mutatedRoute[index2], mutatedRoute[index1]];
    }

    return mutatedRoute;
}

// Repair route to ensure validity
export function repairRoute(route, events, poiMap) {
    const repairedRoute = [];
    const pickupsDone = new Set();
    const dropoffsPending = new Map();

    // Map events by ID for quick access
    const eventMap = new Map();
    events.forEach(event => {
        eventMap.set(event.id, event);
    });

    // Iterate through the route and build a valid route
    for (let event of route) {
        if (event.type === 'pickup') {
            if (!pickupsDone.has(event.id)) {
                pickupsDone.add(event.id);
                repairedRoute.push(event);
            }
        } else if (event.type === 'dropoff') {
            if (pickupsDone.has(event.correspondingPickupID)) {
                repairedRoute.push(event);
            } else {
                // Delay the dropoff until after its pickup
                if (!dropoffsPending.has(event.correspondingPickupID)) {
                    dropoffsPending.set(event.correspondingPickupID, []);
                }
                dropoffsPending.get(event.correspondingPickupID).push(event);
            }
        }
    }

    // Append any pending dropoffs after their pickups
    for (let [pickupId, dropoffs] of dropoffsPending.entries()) {
        if (pickupsDone.has(pickupId)) {
            dropoffs.forEach(dropoff => repairedRoute.push(dropoff));
        }
    }

    return repairedRoute;
}

// Function to calculate the distance between two locations using precomputed distanceMap
function calculateDistance(location1, location2) {
    // This function is now redundant due to precomputed distanceMap
    // Kept for compatibility if needed elsewhere
    const dx = location2.x - location1.x;
    const dy = location2.y - location1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Helper function to shuffle an array
function shuffleArray(array) {
    const newArr = array.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Export other utility functions if needed
export function calculateTotalDistance(route, startingLocation, poiMap, distanceMap) {
    let totalDistance = 0;
    let currentLocationName = startingLocation.name;

    for (let event of route) {
        const eventLocationName = event.location;
        const eventDistance = distanceMap.get(currentLocationName).get(eventLocationName);
        totalDistance += eventDistance;
        currentLocationName = eventLocationName;
    }

    return totalDistance;
}

// routing.js

export function generateRouteSummary(route, allPOIs) {
    let summary = [];

    route.forEach((event, index) => {
        let action;
        let locationInfo;
        let missionInfo = `Mission ID: ${event.missionID}`;

        if (event.type === "pickup") {
            action = `Pick Up ${event.cargo.map(c => `${c.quantity} SCU of ${c.type}`).join(", ")}`;
            locationInfo = `Destination: ${event.cargo.map(c => c.destination).join(", ")}`;
        } else if (event.type === "dropoff") {
            action = `Drop Off ${event.cargo.map(c => `${c.quantity} SCU of ${c.type}`).join(", ")}`;
            locationInfo = `Origin: ${event.cargo.map(c => c.origin).join(", ")}`;
        }

        // Include parentheses around locationInfo and missionInfo
        summary.push({
            stop: index + 1,
            location: event.location,
            action: `${action} (${locationInfo}) (${missionInfo})`, // Added parentheses
        });
    });

    return summary;
}


export function calculateTotalReward(missions) {
    let total = 0;
    missions.forEach((mission) => {
        total += mission.rewardAmount;
    });
    return total;
}

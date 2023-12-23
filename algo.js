//DFS Algo
const dfs = async (startingCity, citiesToVisit) => {
    let overallBest = null;
    let bestPath = null;
    let bestCost = Infinity;

    const dfsHelper = async (currentCity, visited = new Set(), path = [], cost = 0) => {
        visited.add(currentCity);

        if (path.length === 0) {
            path.push(startingCity);
        } else {
            path.push(currentCity);
            cost += calculateDistance(currentCity, path[path.length - 2]); // Assuming calculateDistance is a function that calculates the distance between two cities
        }

        if (visited.size === citiesToVisit.length) {
            // Return to starting city
            cost += calculateDistance(currentCity, startingCity);
            path.push(startingCity);

            if (cost < bestCost) {
                bestCost = cost;
                bestPath = [...path];
                overallBest = cost;
            }
        } else {
            for (const nextCity of citiesToVisit) {
                if (!visited.has(nextCity)) {
                    await dfsHelper(nextCity, new Set(visited), [...path], cost);
                }
            }
        }

        // Backtrack
        visited.delete(currentCity);
        path.pop();
    };

    await dfsHelper(startingCity);
    return [bestCost, bestPath];
};

function calculateDistance(city1, city2) {
    const toRadians = angle => (Math.PI / 180) * angle;
    const earthRadiusKm = 6371;

    const dLat = toRadians(city2.lat - city1.lat);
    const dLon = toRadians(city2.lon - city1.lon);

    const lat1 = toRadians(city1.lat);
    const lat2 = toRadians(city2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return earthRadiusKm * c;
}

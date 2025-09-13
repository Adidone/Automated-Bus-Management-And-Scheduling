
const { default: axios } = require("axios");
const pool = require("../../db.js");
const { getToken } = require("../../mmiService.js");

const NearestStop = async (address) => {
    try {
        const token = await getToken();
        if (!token) {
            return -1;
        }
        const geoCodeUrl = `https://atlas.mapmyindia.com/api/places/geocode?address=${address}`;
        const geoResponse = await axios.get(geoCodeUrl);

        if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
            throw new Error('Could not geocode the student address.');
        }
        const { lat, lng } = geoResponse.data.results[0];
        const addressCords = `${lat},${lng}`;

        const stopsQuery = 'SELECT id, latitude, longitude, name FROM stops;';
        const stopsResult = await pool.query(stopsQuery);
        const allStops = stopsResult.rows;
        if (allStops.length === 0) {
            throw new Error('No bus stops found in the database.');
        }

        const distancePromises = allStops.map(async (stop) => {
            const stopCoords = `${stop.latitude},${stop.longitude}`;
            const routeUrl = `https://apis.mapmyindia.com/advancedmaps/v1/${apiKey}/route?start=${addressCords}&end=${stopCoords}`;

            try {
                const routeResponse = await axios.get(routeUrl);
                // The API response will contain the driving distance
                const distance = routeResponse.data.results[0].distance; // Or another appropriate field from Mappls API

                return {
                    id: stop.id,
                    name: stop.name,
                    distance// Convert meters to kilometers
                }

            } catch (error) {
                // Handle API errors for a single stop
                return null;
            }
        });

        const stopDistances = await Promise.all(distancePromises);

        // Step 4: Find the nearest stop by filtering for the minimum distance
        const validDistances = stopDistances.filter(item => item !== null);

        if (validDistances.length === 0) {
            throw new Error('Could not calculate distances to any bus stops.');
        }

        const nearestStop = validDistances.reduce((min, current) => (current.distance_km < min.distance_km ? current : min), validDistances[0]);

        // Step 5: Return the nearest stop
        return nearestStop;
    }
    catch (err) {
        return err.message;
    }
}

module.exports = NearestStop;
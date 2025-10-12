
const { default: axios } = require("axios");
const pool = require("../../db.js");
const { getToken } = require("../../GetToken.js");
const { geoApi } = require("../../geoapi.js");
require("dotenv").config();


function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NearestStop = async (address) => {
    try {
        const token = await getToken();
        const apiKey = process.env.MMI_API_KEY;
        const { latitude, longitude } = await geoApi(address);
        const addressCords = `${latitude},${longitude}`;
        // console.log(addressCords);
        

        const stopsQuery = 'SELECT stop_id, latitude, longitude, name,route_id FROM stops;';
        const stopsResult = await pool.query(stopsQuery);
        const allStops = stopsResult.rows;
        if (allStops.length === 0) {
            throw new Error('No bus stops found in the database.');
        }

        const nearestStopData = allStops.reduce((closest, currentStop) => {
            const distanceInKm = haversineDistance(
                latitude, longitude,
                currentStop.latitude, currentStop.longitude
            );

            // If this is the first stop, it's the closest so far.
            if (!closest) {
                return { ...currentStop, distance: distanceInKm };
            }

            // If the current stop is closer, it becomes the new 'closest'.
            if (distanceInKm < closest.distance) {
                return { ...currentStop, distance: distanceInKm };
            }
        
            // Otherwise, keep the one we've already found.
            return closest;
        }, null);

        return {
            route_id: nearestStopData.route_id,
            stop_id: nearestStopData.stop_id, // Correctly using stop_id from the query
            stop_name: nearestStopData.name,
            distance: nearestStopData.distance // This is already in kilometers
        };
    }
    catch (err) {
        return err.message;
    }
}

module.exports = NearestStop;
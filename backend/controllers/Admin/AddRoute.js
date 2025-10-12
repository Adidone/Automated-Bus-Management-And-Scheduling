const { getToken } = require("../../GetToken");
const axios = require("axios");
const pool = require("../../db.js");
require("dotenv").config();

// Best practice: Use process.env directly, don't declare a const named YOUR_KEY
const MMI_API_KEY = process.env.MMI_API_KEY;


const findOrCreateStop = async (stopData) => {
    const { route_id,name, lat, lng } = stopData;

    // Check if the stop already exists based on coordinates
    const existingStop = await pool.query(
        `SELECT stop_id FROM stops WHERE latitude = $1 AND longitude = $2`,
        [lat, lng]
    );

    if (existingStop.rows.length > 0) {
        return existingStop.rows[0].id;
    }

    // If not found, create a new stop
    const newStop = await pool.query(
        `INSERT INTO stops (route_id,name, latitude, longitude)
         VALUES ($1, $2, $3,$4)
         RETURNING stop_id`,
        [route_id,name, lat, lng]
    );
    // console.log("Created new stop:", newStop.rows[0]);

    return newStop.rows[0].id;
};


const AddRoute = async (req, res) => {
    try {
        const { name, route_path } = req.body;
        console.log("Received data:", { name, route_path });

        // Validate required fields
        if (!name || !route_path || route_path.length < 2) {
            return res.status(400).json({
                message: "Missing required fields: name, route_path (at least 2 points required)",
                success: false
            });
        }

        const token = await getToken();
        if (!token) {
            return res.status(500).json({ message: "Failed to get MMI token" });
        }

        // Map all coordinates to the correct format: `lng,lat`
        const allCoords = route_path.map(s => `${s.lng},${s.lat}`);

        // Join all coordinates with a semicolon
        const coordinatesString = allCoords.join(';');

        // CORRECTED URL: Use `?` for parameters and no braces `{}`
        const url = `https://apis.mapmyindia.com/advancedmaps/v1/${MMI_API_KEY}/route_adv/driving/${coordinatesString}?geometries=polyline&overview=full`;

        // console.log("Generated MMI URL:", url); // Log the full URL for debugging

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.routes || response.data.routes.length === 0) {
            throw new Error("No route found for these stops");
        }
        const route = response.data.routes[0];

        const routePath = route.geometry;
        const totalDistance = (route.distance / 1000).toFixed(2);

        // Ensure database call is correct
        const result = await pool.query(
            `INSERT INTO routes (name, route_path, total_distance)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, { polyline: routePath }, totalDistance]
        );
        console.log("Inserted route:", result.rows[0]);

        const stopIds = [];
        for (const stop of route_path) {
            const stopId = await findOrCreateStop({
                route_id: result.rows[0].route_id,
                name: stop.name,
                lat: stop.lat,
                lng: stop.lng,
            });
            stopIds.push(stopId);
        }

        return res.status(201).json({
            message: "Route created successfully",
            route: result.rows[0]
        });
    }
    catch (err) {
        console.error("Error creating route:", err);

        if (err.response) {
            console.error("MMI API Response Status:", err.response.status);
            console.error("MMI API Response Data:", err.response.data);
            return res.status(err.response.status).json({
                message: err.response.data.error || "An error occurred with the MMI API",
                success: false
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

module.exports = AddRoute;
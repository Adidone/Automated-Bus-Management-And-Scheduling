const pool = require("../../db");
const axios = require("axios");

const GetETA = async (req, res) => {
    try {
        const driver_id = req.params.driverId;

        // 1️⃣ Get driver current location
        const driverRes = await pool.query(
            "SELECT latitude, longitude FROM driver_live_location WHERE driver_id=$1",
            [driver_id]
        );

        if (driverRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No live location found" });
        }

        const { latitude, longitude } = driverRes.rows[0];

        // 2️⃣ Get next stop from route_stops
        const stopRes = await pool.query(
            `SELECT s.name, s.latitude, s.longitude
             FROM route_stops rs
             JOIN stops s ON rs.stop_id = s.id
             WHERE rs.stop_order = 1 
             LIMIT 1`
        );

        const nextStop = stopRes.rows[0];

        // 3️⃣ Call ORS API for ETA
        const orsRes = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car",
            {
                coordinates: [
                    [longitude, latitude],
                    [nextStop.longitude, nextStop.latitude]
                ]
            },
            {
                headers: {
                    "Authorization": process.env.ORS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const durationSeconds = orsRes.data.routes[0].summary.duration;
        const etaMinutes = (durationSeconds / 60).toFixed(1);

        return res.json({
            success: true,
            next_stop: nextStop.name,
            eta_minutes: etaMinutes
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = GetETA;

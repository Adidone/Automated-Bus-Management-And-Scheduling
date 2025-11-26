const pool = require("../../db");
const calculateRoadDistanceOSRM = require("../../osrmDistance");

const UpdateLocation = async (req, res) => {
    try {
        const { driver_id, latitude, longitude } = req.body;

        if (!driver_id || !latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Invalid data" });
        }

        // 1. Update driver live location
        await pool.query(
            `INSERT INTO driver_live_location (driver_id, latitude, longitude, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (driver_id)
             DO UPDATE SET latitude = $2, longitude = $3, updated_at = NOW()`,
            [driver_id, latitude, longitude]
        );

        // 2. Get next stop
        const nextStopRes = await pool.query(
            `SELECT s.id, s.latitude, s.longitude, s.name, rs.stop_order
             FROM route_stops rs
             JOIN stops s ON rs.stop_id = s.id
             LEFT JOIN completed_stops cs ON cs.stop_id = s.id AND cs.driver_id = $1
             WHERE cs.stop_id IS NULL
             AND rs.route_id = (SELECT route_id FROM trips WHERE driver_id = $1 LIMIT 1)
             ORDER BY rs.stop_order ASC
             LIMIT 1`,
            [driver_id]
        );

        if (nextStopRes.rows.length === 0) {
            return res.json({ success: true, message: "All stops already completed" });
        }

        const stop = nextStopRes.rows[0];

        // 3. Use real distance instead of Haversine
        const distanceData = await calculateRoadDistanceOSRM(
            latitude, longitude,
            stop.latitude, stop.longitude
        );

        const distance = distanceData ? distanceData.distance : 999;

        // 4. Mark stop completed if within 60 meters
        if (distance <= 0.06) {
            await pool.query(
                `INSERT INTO completed_stops (driver_id, stop_id) 
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [driver_id, stop.id]
            );

            return res.json({
                success: true,
                completed_stops: [{ stop_id: stop.id, stop_name: stop.name }]
            });
        }

        return res.json({ success: true, completed_stops: [] });

    } catch (err) {
        console.error("UpdateLocation error:", err);
        res.status(500).json({ success: false, message: "Internal error" });
    }
};

module.exports = UpdateLocation;

const pool = require("../../db");
const calculateRoadDistanceOSRM = require("../../osrmDistance");

const GetEta = async (req, res) => {
    try {
        const driver_id = req.params.driver_id;

        // 1. Get driver's live location
        const locRes = await pool.query(
            "SELECT latitude, longitude FROM driver_live_location WHERE driver_id = $1",
            [driver_id]
        );

        if (locRes.rows.length === 0) {
            return res.json({ success: false, message: "Driver location not available" });
        }

        const { latitude, longitude } = locRes.rows[0];

        // 2. Find next stop
        const nextStopRes = await pool.query(
            `SELECT s.id, s.name, s.latitude, s.longitude, rs.stop_order
             FROM route_stops rs
             JOIN stops s ON rs.stop_id = s.id
             LEFT JOIN completed_stops cs 
                ON cs.stop_id = s.id AND cs.driver_id = $1 AND rs.route_id = (
                    SELECT route_id FROM trips WHERE driver_id = $1 LIMIT 1
                )
             WHERE cs.stop_id IS NULL
             ORDER BY rs.stop_order ASC
             LIMIT 1`,
            [driver_id]
        );

        if (nextStopRes.rows.length === 0) {
            return res.json({ success: true, message: "All stops completed" });
        }

        const stop = nextStopRes.rows[0];

        // 3. Use OSRM for real street distance
        const osrm = await calculateRoadDistanceOSRM(
            latitude,
            longitude,
            stop.latitude,
            stop.longitude
        );

        let distance = osrm ? osrm.distance : 0;
        let eta = osrm ? osrm.duration : 0;

        return res.json({
            success: true,
            next_stop: stop.name,
            next_stop_lat: stop.latitude,
            next_stop_lng: stop.longitude,
            stop_order: stop.stop_order,
            distance_km: distance.toFixed(2),
            eta_minutes: Math.round(eta)
        });

    } catch (err) {
        console.error("ETA error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = GetEta;

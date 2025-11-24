const pool = require("../../db");

const UpdateLocation = async (req, res) => {
    try {
        const { driver_id, latitude, longitude } = req.body;

        if (!driver_id || !latitude || !longitude) {
            return res.status(400).json({
                message: "driver_id, latitude, longitude are required",
                success: false
            });
        }

        // 1️⃣ Update driver location
        await pool.query(
            `INSERT INTO driver_live_location (driver_id, latitude, longitude, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (driver_id)
             DO UPDATE SET latitude = EXCLUDED.latitude,
                           longitude = EXCLUDED.longitude,
                           updated_at = NOW();`,
            [driver_id, latitude, longitude]
        );

        // 2️⃣ Get all incomplete stops for route 4
        const stopsRes = await pool.query(
            `SELECT s.id, s.name, s.latitude, s.longitude, rs.stop_order
             FROM route_stops rs
             JOIN stops s ON rs.stop_id = s.id
             LEFT JOIN completed_stops cs ON cs.stop_id = s.id AND cs.driver_id = $1
             WHERE rs.route_id = 4 AND cs.stop_id IS NULL
             ORDER BY rs.stop_order ASC`,
            [driver_id]
        );

        // 3️⃣ Check proximity to each incomplete stop
        const PROXIMITY_THRESHOLD = 0.0005; // ~200 meters
        let completedStops = [];

        for (let stop of stopsRes.rows) {
            const latDiff = stop.latitude - latitude;
            const lngDiff = stop.longitude - longitude;
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

            // If driver is within 200m of this stop, mark as completed
            if (distance <= PROXIMITY_THRESHOLD) {
                await pool.query(
                    `INSERT INTO completed_stops (driver_id, stop_id, completed_at)
                     VALUES ($1, $2, NOW())
                     ON CONFLICT (driver_id, stop_id) DO NOTHING`,
                    [driver_id, stop.id]
                );
                completedStops.push(stop.name);
                console.log(`✅ Stop "${stop.name}" completed by driver ${driver_id}`);
            }
        }

        return res.status(200).json({
            message: "Location updated",
            success: true,
            completed_stops: completedStops
        });

    } catch (err) {
        console.error("UpdateLocation error:", err);
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
};

module.exports = UpdateLocation;
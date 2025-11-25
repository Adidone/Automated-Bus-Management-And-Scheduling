const pool = require("../../db");

const GetETA = async (req, res) => {
    try {
        const { driver_id } = req.params;

        if (!driver_id) {
            return res.status(400).json({
                success: false,
                message: "driver_id is required"
            });
        }

        // ✅ Get driver's current location
        const locationResult = await pool.query(
            `SELECT latitude, longitude FROM driver_live_location WHERE driver_id = $1`,
            [driver_id]
        );

        if (locationResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver location not found. Start tracking first."
            });
        }

        const driverLocation = locationResult.rows[0];

        // ✅ Get driver's assigned route_id from trips table
        const tripResult = await pool.query(
            `SELECT route_id FROM trips WHERE driver_id = $1 LIMIT 1`,
            [driver_id]
        );

        if (tripResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No route assigned to this driver"
            });
        }

        const route_id = tripResult.rows[0].route_id;

        // ✅ Get next uncompleted stop
        const nextStopResult = await pool.query(
            `SELECT s.id, s.name, s.latitude, s.longitude, rs.stop_order
             FROM route_stops rs
             JOIN stops s ON rs.stop_id = s.id
             LEFT JOIN completed_stops cs ON cs.stop_id = s.id AND cs.driver_id = $1
             WHERE rs.route_id = $2 AND cs.stop_id IS NULL
             ORDER BY rs.stop_order ASC
             LIMIT 1`,
            [driver_id, route_id]
        );

        if (nextStopResult.rows.length === 0) {
            return res.json({
                success: true,
                route_id: route_id, // ✅ Return route_id
                message: "All stops completed!",
                next_stop: "None",
                next_stop_lat: null,
                next_stop_lng: null,
                stop_order: null,
                distance_km: 0,
                eta_minutes: 0
            });
        }

        const nextStop = nextStopResult.rows[0];

        // ✅ Calculate distance using Haversine formula
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        const distance = calculateDistance(
            parseFloat(driverLocation.latitude),
            parseFloat(driverLocation.longitude),
            parseFloat(nextStop.latitude),
            parseFloat(nextStop.longitude)
        );

        // ✅ Estimate ETA (assuming average speed of 30 km/h)
        const avgSpeed = 30;
        const eta = Math.max(1, Math.round((distance / avgSpeed) * 60));

        return res.json({
            success: true,
            route_id: route_id, // ✅ Return route_id
            next_stop: nextStop.name,
            next_stop_lat: parseFloat(nextStop.latitude),
            next_stop_lng: parseFloat(nextStop.longitude),
            stop_order: nextStop.stop_order,
            distance_km: distance.toFixed(2),
            eta_minutes: eta,
            driver_lat: parseFloat(driverLocation.latitude),
            driver_lng: parseFloat(driverLocation.longitude)
        });

    } catch (err) {
        console.error("GetETA error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetETA;
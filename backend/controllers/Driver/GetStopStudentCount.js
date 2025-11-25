const pool = require("../../db");

const GetStopStudentCount = async (req, res) => {
    try {
        const { driver_id, shift } = req.query; // Morning or Evening

        if (!driver_id) {
            return res.status(400).json({
                success: false,
                message: "driver_id is required"
            });
        }

        // Get driver's route
        const driverRoute = await pool.query(
            `SELECT route_id FROM trips WHERE driver_id = $1 AND shift = $2`,
            [driver_id, shift || 'Morning']
        );

        if (driverRoute.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No route assigned to driver"
            });
        }

        const route_id = driverRoute.rows[0].route_id;

        // Get all stops with student counts for today
        const stopsWithCounts = await pool.query(
            `SELECT 
                st.id as stop_id,
                st.name as stop_name,
                st.latitude,
                st.longitude,
                rs.stop_order,
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE 
                    WHEN sa.is_coming = TRUE OR sa.is_coming IS NULL 
                    THEN s.id 
                END) as coming_today,
                COUNT(DISTINCT CASE 
                    WHEN sa.is_coming = FALSE 
                    THEN s.id 
                END) as not_coming_today
            FROM route_stops rs
            JOIN stops st ON rs.stop_id = st.id
            LEFT JOIN students s ON s.stop_id = st.id AND s.route_id = $1
            LEFT JOIN student_attendance sa ON sa.student_id = s.id 
                AND sa.date = CURRENT_DATE 
                AND sa.shift = $2
            WHERE rs.route_id = $1
            GROUP BY st.id, st.name, st.latitude, st.longitude, rs.stop_order
            ORDER BY rs.stop_order ASC`,
            [route_id, shift || 'Morning']
        );

        // Mark completed stops
        const completedStops = await pool.query(
            `SELECT stop_id FROM completed_stops WHERE driver_id = $1`,
            [driver_id]
        );

        const completedStopIds = completedStops.rows.map(row => row.stop_id);

        const stopsData = stopsWithCounts.rows.map(stop => ({
            stop_id: stop.stop_id,
            stop_name: stop.stop_name,
            latitude: parseFloat(stop.latitude),
            longitude: parseFloat(stop.longitude),
            stop_order: stop.stop_order,
            total_students: parseInt(stop.total_students),
            coming_today: parseInt(stop.coming_today),
            not_coming_today: parseInt(stop.not_coming_today),
            is_completed: completedStopIds.includes(stop.stop_id),
            should_skip: parseInt(stop.coming_today) === 0
        }));

        return res.json({
            success: true,
            route_id: route_id,
            shift: shift || 'Morning',
            total_stops: stopsData.length,
            data: stopsData
        });

    } catch (err) {
        console.error("GetStopStudentCount error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetStopStudentCount;
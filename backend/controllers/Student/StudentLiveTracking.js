const pool = require("../../db");

const StudentLiveTracking = async (req, res) => {
    try {
        const student_id = req.params.student_id;

        // 1. Get student info
        const studentQ = await pool.query(`
            SELECT id, name, stop_id, route_id
            FROM students 
            WHERE id = $1
        `, [student_id]);

        if (studentQ.rows.length === 0)
            return res.json({ success: false, message: "Student not found" });

        const student = studentQ.rows[0];
        const shift = 'Morning'; // OR detect dynamically

        // 2. Get trip and driver
        const tripQ = await pool.query(`
            SELECT 
                t.id AS trip_id,
                t.driver_id,
                d.name AS driver_name,
                t.route_id
            FROM trips t
            JOIN drivers d ON d.id = t.driver_id
            WHERE t.route_id = $1 AND t.shift = $2
            LIMIT 1
        `, [student.route_id, shift]);

        if (tripQ.rows.length === 0)
            return res.json({ success: false, message: "No active trip" });

        const trip = tripQ.rows[0];

        // 3. Get driver location
        const locQ = await pool.query(`
            SELECT latitude, longitude, updated_at
            FROM driver_live_location
            WHERE driver_id = $1
        `, [trip.driver_id]);

        // 4. Get route stops
        const stopsQ = await pool.query(`
            SELECT 
                s.id AS stop_id,
                s.name,
                s.latitude,
                s.longitude,
                rs.stop_order
            FROM route_stops rs
            JOIN stops s ON s.id = rs.stop_id
            WHERE rs.route_id = $1
            ORDER BY rs.stop_order
        `, [student.route_id]);

        // 5. Get next stop
        const nextStopQ = await pool.query(`
            SELECT 
                s.id, s.name, s.latitude, s.longitude, rs.stop_order
            FROM route_stops rs
            JOIN stops s ON rs.stop_id = s.id
            LEFT JOIN completed_stops cs 
                ON cs.stop_id = s.id AND cs.driver_id = $1
            WHERE cs.stop_id IS NULL 
              AND rs.route_id = $2
            ORDER BY rs.stop_order
            LIMIT 1
        `, [trip.driver_id, student.route_id]);

        return res.json({
            success: true,
            trip,
            driver_location: locQ.rows[0] || null,
            stops: stopsQ.rows,
            student_stop_id: student.stop_id,
            next_stop: nextStopQ.rows[0] || null
        });

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};

module.exports = StudentLiveTracking;

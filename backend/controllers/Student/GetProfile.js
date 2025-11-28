const pool = require("../../db");

const GetProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Get student basic info
        const studentResult = await pool.query(
            `SELECT 
                s.id as student_id,
                s.name as student_name,
                s.roll_no,
                s.stop_id,
                s.route_id,
                st.name as stop_name,
                st.latitude,
                st.longitude,
                r.name as route_name
            FROM students s
            JOIN stops st ON s.stop_id = st.id
            JOIN routes r ON s.route_id = r.id
            WHERE s.id = $1`,
            [id]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const student = studentResult.rows[0];

        // Get today's driver for this student's route
        const driverResult = await pool.query(
            `SELECT 
                t.driver_id,
                d.name as driver_name,
                b.bus_number,
                t.shift
            FROM trips t
            JOIN drivers d ON d.id = t.driver_id
            JOIN buses b ON t.bus_id = b.id
            WHERE t.route_id = $1
            AND t.shift = 'Morning'
            LIMIT 1`,
            [student.route_id]
        );

        let driverData = {
            driver_id: null,
            driver_name: 'Not Assigned',
            bus_number: 'N/A'
        };

        if (driverResult.rows.length > 0) {
            driverData = driverResult.rows[0];
        }

        // Combine student and driver data
        const profileData = {
            ...student,
            ...driverData
        };

        return res.status(200).json({
            success: true,
            data: profileData
        });

    } catch (err) {
        console.error("GetProfile error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetProfile;
const pool = require("../../db.js");

const GetStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.id, 
                s.name, 
                s.roll_no, 
                s.phone, 
                s.email, 
                s.address, 
                st.name as stop_name,
                s.stop_id,
                s.morning_route_id,
                r1.name as morning_route_name,
                s.evening_route_id,
                r2.name as evening_route_name
            FROM students s
            LEFT JOIN stops st ON s.stop_id = st.id
            LEFT JOIN routes r1 ON s.morning_route_id = r1.id
            LEFT JOIN routes r2 ON s.evening_route_id = r2.id
            ORDER BY s.id DESC
        `);
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetStudents;

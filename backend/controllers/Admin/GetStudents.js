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
                s.stop_name, 
                r.name as route_name
            FROM students s
            LEFT JOIN routes r ON s.route_id = r.id
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

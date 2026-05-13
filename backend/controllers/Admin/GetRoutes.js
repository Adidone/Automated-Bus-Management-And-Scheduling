const pool = require("../../db.js");

const GetRoutes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id, 
                r.name, 
                r.total_distance,
                r.shift,
                s1.name as start_stop_name,
                s2.name as end_stop_name
            FROM routes r
            JOIN stops s1 ON r.start_stop_id = s1.id
            JOIN stops s2 ON r.end_stop_id = s2.id
            ORDER BY r.id DESC
        `);
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching routes:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetRoutes;

const pool = require("../../db.js");

const GetDrivers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                d.id, 
                d.name, 
                d.phone, 
                d.email, 
                d.address, 
                d.liscence_no,
                r.name as assigned_route,
                b.bus_number as assigned_bus
            FROM drivers d
            LEFT JOIN trips t ON d.id = t.driver_id
            LEFT JOIN routes r ON t.route_id = r.id
            LEFT JOIN buses b ON t.bus_id = b.id
            ORDER BY d.id DESC
        `);
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching drivers:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetDrivers;

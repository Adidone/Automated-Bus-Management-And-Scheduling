const pool = require("../../db.js");

const GetStops = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM stops ORDER BY name ASC");
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching stops:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetStops;

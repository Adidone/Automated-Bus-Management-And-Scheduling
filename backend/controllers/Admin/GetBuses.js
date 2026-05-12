const pool = require("../../db.js");

const GetBuses = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM buses ORDER BY id DESC");
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching buses:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = GetBuses;

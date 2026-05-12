const pool = require("../../db.js");

const GetDrivers = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, phone, email, address, liscence_no FROM drivers ORDER BY id DESC");
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

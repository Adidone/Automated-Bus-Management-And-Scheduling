const pool = require("../../db");

const GetLiveLocations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.driver_id, d.name AS driver_name,
                    l.latitude, l.longitude, l.updated_at
             FROM driver_locations l
             JOIN drivers d ON d.id = l.driver_id
             WHERE l.id IN (
                SELECT MAX(id) FROM driver_locations GROUP BY driver_id
             )`
        );

        return res.status(200).json({
            message: "Live locations fetched",
            success: true,
            data: result.rows
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
};

module.exports = GetLiveLocations;

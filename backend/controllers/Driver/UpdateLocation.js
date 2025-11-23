const pool = require("../../db");

const UpdateLocation = async (req, res) => {
    try {
        const { driver_id, latitude, longitude } = req.body;

        if (!driver_id || !latitude || !longitude) {
            return res.status(400).json({
                message: "driver_id, latitude, longitude are required",
                success: false
            });
        }

        await pool.query(
            `INSERT INTO driver_live_location (driver_id, latitude, longitude, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (driver_id)
             DO UPDATE SET latitude = EXCLUDED.latitude,
                           longitude = EXCLUDED.longitude,
                           updated_at = NOW();`,
            [driver_id, latitude, longitude]
        );

        return res.status(200).json({
            message: "Location updated",
            success: true
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
};

module.exports = UpdateLocation;

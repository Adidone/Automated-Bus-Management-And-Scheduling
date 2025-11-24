
const ClearCompletedStops = async (req, res) => {
    try {
        const driver_id = req.params.driverId;

        // Clear all completed stops for the driver
        await pool.query(
            `DELETE FROM completed_stops WHERE driver_id = $1`,
            [driver_id]
        );

        return res.status(200).json({
            message: "All completed stops cleared",
            success: true
        });
    } catch (err) {
        console.error("Error clearing completed stops:", err);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

module.exports = ClearCompletedStops;
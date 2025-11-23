const GetLiveLocations = async (req, res) => {
    try {
        const { driverId } = req.params;

        const result = await pool.query(
            "SELECT latitude, longitude FROM driver_live_location WHERE driver_id = $1",
            [driverId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No location found" });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = GetLiveLocations;

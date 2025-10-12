

const pool = require("../../db.js");

const AddTrip = async (req, res) => {
    try {
        const { route_id,bus_id,driver_id,trip_time } = req.body;
        if (!route_id || !bus_id || !driver_id || !trip_time ) {
            return res.status(400).json({
                message: "Missing required fields: route_id, bus_id, driver_id, trip_time",
                success: false
            });
        }

        const trip = await pool.query(
            "SELECT * FROM trips WHERE route_id = $1 ",
            [route_id]
        );
        if (trip.rows.length > 0) {
            return res.status(400).json({
                message: "Trip with this route already exists.",
                success: false
            });
        }

        

        const addTripQuery = `
        INSERT INTO trips (route_id, bus_id, driver_id, trip_time) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
        `;

        const result = await pool.query(addTripQuery, [
            route_id,
            bus_id,
            driver_id,
            trip_time
        ]);
        const newTrip = result.rows[0];

        return res.status(201).json({
            message: "Trip Scheduled successfully.",
            success: true,
            data: newTrip
        });
    }
    catch (err) {
        console.log("error", err)
        return res.status(500).json({
            message: err.message,
            sucess: false
        })
    }
}

module.exports = AddTrip; 
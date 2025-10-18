

const pool = require("../../db.js");

const AddTrip = async (req, res) => {
    try {
        const { route_id,bus_id,driver_id,shift } = req.body;
        if (!route_id || !bus_id || !driver_id || !shift ) {
            return res.status(400).json({
                message: "Missing required fields: route_id, bus_id, driver_id, shift",
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

        const routeCheck = await pool.query("SELECT * FROM routes WHERE id = $1", [route_id]);
        if (routeCheck.rows.length === 0) {
            return res.status(404).json({ message: "Route not found", success: false });
        }
        
        const busCheck = await pool.query("SELECT * FROM buses WHERE id = $1", [bus_id]);
        if (busCheck.rows.length === 0) {
            return res.status(404).json({ message: "Bus not found", success: false });
        }

        const driverCheck = await pool.query("SELECT * FROM drivers WHERE id = $1", [driver_id]);
        if (driverCheck.rows.length === 0) {
            return res.status(404).json({ message: "Driver not found", success: false });
        }

        const busStatus = busCheck.rows[0].status;
        console.log(busStatus)
        if (busStatus != 'available') {
            return res.status(400).json({ message: "Bus is already scheduled for another trip", success: false });
        }

        const driverStatus = driverCheck.rows[0].status;    
        if (driverStatus != 'available') {
            return res.status(400).json({ message: "Driver is already scheduled for another trip", success: false });
        }
        

        await pool.query("UPDATE buses SET status = 'not available' WHERE id = $1", [bus_id]);
        await pool.query("UPDATE drivers SET status = 'not available' WHERE id = $1", [driver_id]);

       
        const addTripQuery = `
        INSERT INTO trips (route_id, bus_id, driver_id, shift) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
        `;

        const result = await pool.query(addTripQuery, [
            route_id,
            bus_id,
            driver_id,
            shift
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
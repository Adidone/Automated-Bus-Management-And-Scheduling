

const pool = require("../../db.js");

const AddBus = async (req, res) => {
    try {
        const { bus_number,capacity } = req.body;
        // console.log("Received data:", { bus_number,capacity,fuel_type });

        
        if (!bus_number || !capacity ) {
            return res.status(400).json({
                message: "Missing required fields: bus_number, capacity",
                success: false
            });
        }
        const bus = await pool.query("SELECT * FROM buses WHERE bus_number = $1", [bus_number]);
        if (bus.rows.length > 0) {
            return res.status(400).json({
                message: "Bus with this number already exists.",
                success: false
            });
        }

        const addBusQuery = `
        INSERT INTO buses (bus_number, capacity) 
        VALUES ($1, $2) 
        RETURNING *;
        `;

        const result = await pool.query(addBusQuery, [
            bus_number,
            capacity
        ]);
        const newBus = result.rows[0];

        return res.status(201).json({
            message: "Bus added successfully.",
            success: true,
            data: newBus
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

module.exports = AddBus; 
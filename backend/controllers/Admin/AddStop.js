const pool = require("../../db");


const AddStop = async (req, res) => {   
    try {
        const {name,latitude,longitude} = req.body;
        if (!name || !latitude || !longitude) {
            return res.status(400).json({ 
                message: 'All fields are required',
                sucess:false 
            });
        }

        const stop = await pool.query(
            "SELECT * FROM stops WHERE name = $1",
            [name]  
        )
        if (stop.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Stop with this name already exists',
                success: false 
            });
        }

        const addStopQuery = `
            INSERT INTO stops (name, latitude, longitude) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;

        const result = await pool.query(addStopQuery, [name, latitude, longitude]);
        const newStop = result.rows[0];

        return res.status(201).json({
            message: 'Stop added successfully',
            success: true,
            data: newStop
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = AddStop;
        
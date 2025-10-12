
const pool = require("../../db.js");

const AddDriver = async (req, res) => {
    try {
        const { name, phone, email, address, password, liscence_no } = req.body;
        console.log("Received data:", { name, phone, email, address, password,liscence_no });

        // Validate required fields
        if (!name || !email || !phone || !address || !password ||!liscence_no) {
            return res.status(400).json({
                message: "Missing required fields: name, vehicle_no, address, password,licsence_no",
                success: false
            });
        }

        const checkEmailQuery = 'SELECT * FROM drivers WHERE email = $1';
        const emailResult = await pool.query(checkEmailQuery, [email]);

        if (emailResult.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists.",
                success: false
            });
        }

        const addDriverQuery = `
        INSERT INTO drivers (name, phone, email, address, password, liscence_no) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
        `;

        const result = await pool.query(addDriverQuery, [
            name,
            phone,
            email,
            address,
            password,
            liscence_no,
        ]);
        const newDriver = result.rows[0];

        return res.status(201).json({
            message: "Driver added successfully.",
            success: true,
            data: newDriver
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

module.exports = AddDriver; 
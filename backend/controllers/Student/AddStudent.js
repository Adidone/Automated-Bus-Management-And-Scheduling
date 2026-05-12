const pool = require("../../db.js");
const { geoApi } = require("../../geoapi.js");
const NearestStop = require("./NearestStop.js");

const AddStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        let { name, roll_no, phone, email, address, password, route_id, stop_id } = req.body;

        // Validate required fields
        if (!name || !roll_no || !address || !password) {
            return res.status(400).json({
                message: "Missing required fields: name, roll_no, address, password",
                success: false
            });
        }

        let final_stop_id, final_stop_name, final_route_id;

        if (route_id && stop_id) {
            // Explicitly provided
            const stopResult = await client.query("SELECT name FROM stops WHERE id = $1", [stop_id]);
            if (stopResult.rows.length === 0) {
                return res.status(404).json({ message: "Stop not found", success: false });
            }
            final_stop_id = stop_id;
            final_stop_name = stopResult.rows[0].name;
            final_route_id = route_id;
        } else {
            // Fallback to nearest stop
            const stop = await NearestStop(address);
            final_stop_id = stop.stop_id;
            final_stop_name = stop.stop_name;
            final_route_id = stop.route_id;
        }

        const addStudentQuery = `
        INSERT INTO students (name, roll_no, phone, email, address, password,stop_id,stop_name,route_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9) 
        RETURNING *;
        `;

        const result = await client.query(addStudentQuery, [
            name,
            roll_no,
            phone,
            email,
            address,
            password,
            final_stop_id,
            final_stop_name,
            final_route_id
        ]);
        const newStudent = result.rows[0];
        // console.log("New student added:", newStudent     
        // const newStudent = result.rows[0];
        await client.query('COMMIT');

        return res.status(201).json({
            message: "Student added successfully.",
            success: true,
            data: newStudent
        });
    }
    catch (err) {
        await client.query('ROLLBACK');

        console.log("error", err)
        return res.status(500).json({
            message: err.message,
            sucess: false
        })
    }
}

module.exports = AddStudent;
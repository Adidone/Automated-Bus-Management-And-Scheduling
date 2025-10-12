const pool = require("../../db.js");
const { geoApi } = require("../../geoapi.js");
const NearestStop = require("./NearestStop.js");

const AddStudent = async (req, res) => {
    try {
        const { name, roll_no, phone, email, address, password } = req.body;
        // console.log("Received data:", { name, roll_no, phone, email, address, password });

        // Validate required fields
        if (!name || !roll_no || !address || !password) {
            return res.status(400).json({
                message: "Missing required fields: name, roll_no, address, password",
                success: false
            });
        }
        const stop = await NearestStop(address);
        console.log("Nearest stop:", stop.stop_name);

        const{route_id,stop_id,stop_name} = stop;
          
        const addStudentQuery = `
        INSERT INTO students (name, roll_no, phone, email, address, password, stop_name, stop_id,route_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) 
        RETURNING *;
        `;

        const result = await pool.query(addStudentQuery, [
            name,
            roll_no,
            phone,
            email,
            address,
            password,
            stop.stop_name,
            stop.stop_id,
            stop.route_id
        ]);
        const newStudent = result.rows[0];
        // console.log("New student added:", newStudent     
        // const newStudent = result.rows[0];

        return res.status(201).json({
            message: "Student added successfully.",
            success: true,
            data: newStudent
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

module.exports = AddStudent;
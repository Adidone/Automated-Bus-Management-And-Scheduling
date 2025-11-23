const pool = require("../../db");

const StopStudents = async(req, res) => {
    const client = await pool.connect();
    try{
        const {stop_id} = req.body;
        if(!stop_id){
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: "Missing required field: stop_id",
                success: false
            });
        }
        const query = 'SELECT * FROM students WHERE stop_id = $1;';
        const result = await client.query(query, [stop_id]);
        const studentsAtStop = result.rows;
        await client.query('COMMIT');
        return res.status(200).json({
            message: "Students retrieved successfully.",
            success: true,
            data: studentsAtStop
        });
    }
    catch(err){
        await client.query('ROLLBACK');
        return res.status(500).json({
            message: err.message,
            sucess: false
        })  
    }
}

module.exports = StopStudents;
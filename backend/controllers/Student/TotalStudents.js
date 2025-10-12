
const TotalStudents = async(req, res) => {

    try{
        const{route_id} = req.body;
        if(!route_id){
            return res.status(400).json({message: "Missing required field: route_id", success: false});
        }
        const totalStudentsQuery = `
            SELECT COUNT(*) AS total_students
            FROM students
            WHERE route_id = $1     
        `;
        const totalStudentsResult = await pool.query(totalStudentsQuery, [route_id]);
        const totalStudents = totalStudentsResult.rows[0].total_students;
    }
    catch(error){   
        console.error("Error fetching total students:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }   

}  
module.exports = TotalStudents;
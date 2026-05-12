const pool = require("../../db.js");

const StudentLogin = async (req, res) => {
    try {
        const { roll_no, password } = req.body;

        if (!roll_no || !password) {
            return res.status(400).json({
                success: false,
                message: "Roll number and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE roll_no = $1 AND password = $2",
            [roll_no, password]
        );

        if (result.rows.length > 0) {
            const student = result.rows[0];
            // Remove password from response
            delete student.password;

            return res.status(200).json({
                success: true,
                message: "Logged in successfully",
                data: student
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid roll number or password"
            });
        }
    } catch (err) {
        console.error("Student login error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = StudentLogin;

const pool = require("../../db");

const AdminLogin = async (req,res) =>{
    const client = await pool.connect();
    try{
        const{username,password} = req.body;
        
        if(username == "admin" && password == "123456"){
            await client.query('COMMIT');
            return res.status(201).json({
                sucess:true,
                message:"Logged In SucessFully",
                username,
                password
            })
        }
        else{
            await client.query('ROLLBACK');
            return res.status(409).json({
                sucess:false,
                message:"Invalid Credentials",
                
            })
        }
    }
    catch(err){
        await client.query('ROLLBACK');
        return res.status(500).json({
            message:err.message,
            sucess:false
        })
    }
}

module.exports = AdminLogin;
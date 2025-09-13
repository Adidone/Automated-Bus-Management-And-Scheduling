
const AdminLogin = async (req,res) =>{
    try{
        const{username,password} = req.body;
        
        if(username == "admin" && password == "123456"){
            return res.status(201).json({
                sucess:true,
                message:"Logged In SucessFully",
                username,
                password
            })
        }
        else{
            return res.status(409).json({
                sucess:false,
                message:"Invalid Credentials",
                
            })
        }
    }
    catch(err){
        return res.status(500).json({
            message:err.message,
            sucess:false
        })
    }
}

module.exports = AdminLogin;
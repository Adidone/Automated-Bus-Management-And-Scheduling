const getToken = require("../../mmiService.js");
const NearestStop = require("./NearestStop.js");
const AddStudent = async (req, res) => {
    try {
        const token = await getToken();
        const{address} = req.body;
        if(!token){
            return res.status(409).json({
                message:"Token not Available",
                sucess:false
            })
        }
        //function to get nearest stop
        const stop = await NearestStop();
        console.log(stop);
    }
    catch (err) {
        return res.status(500).json({
            message: err.message,
            sucess: false
        })
    }
}

module.exports = AddStudent;
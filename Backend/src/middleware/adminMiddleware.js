const jwt=require("jsonwebtoken");
const User = require("../models/user");
const redisClient=require("../config/redis")

const adminmiddleware=async (req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token)
            throw new Error("Token not present")
        const payload=jwt.verify(token,process.env.JWT_KEY)

        const {_id}=payload;

        if(!_id)
           { throw new Error("Invalid token")}

        const result=await User.findById(_id);  //to check if the user exist or not in the DB

         if(payload.role!='admin')
            throw new Error("Invalid Token")
        if(!result)
        {
            throw new Error("user doesn't exist")
        }

        //Reddis ke blocklist m present toh nhi hai?
        const IsBlocked=await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid token")

        req.result=result;

        next();

    }
    catch(err){
        res.status(401).send("Error:" + err.message)
    }
}
module.exports=adminmiddleware;
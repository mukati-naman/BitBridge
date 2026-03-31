const express=require('express')
const AuthRouter=express.Router();
const {register,login,logout,adminRegister,deleteProfile,checkAuth}=require("../controllers/userauth2")
const usermiddleware=require("../middleware/usermiddleware")
const adminMiddleware=require("../middleware/adminMiddleware")

AuthRouter.post('/register',register) 
AuthRouter.post('/logout',usermiddleware,logout)  
AuthRouter.post('/admin/register',adminMiddleware,adminRegister)  
AuthRouter.delete('/deleteprofile',usermiddleware,deleteProfile)
AuthRouter.get('/check', usermiddleware, (req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailID: req.result.emailID,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})
module.exports=AuthRouter;
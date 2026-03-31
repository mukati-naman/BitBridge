const express=require("express")

const problemRouter=express.Router();
const adminmiddleware=require("../middleware/adminMiddleware")
const {createproblem,updateproblem,deleteproblem,getproblembyID,getallproblem,solvedProblembyuser,submittedProblem}=require("../controllers/userproblem") 
const usermiddleware=require("../middleware/usermiddleware")

//create
problemRouter.post("/create",adminmiddleware,createproblem) 
problemRouter.put("/update/:id",adminmiddleware,updateproblem)
problemRouter.delete("/delete/:id",adminmiddleware,deleteproblem)

problemRouter.get("/problemId/:id",usermiddleware,getproblembyID)  
problemRouter.get("/getallproblem",usermiddleware,getallproblem)
problemRouter.get("/problemsolvedbyuser",usermiddleware,solvedProblembyuser)
problemRouter.get("/submittedProblem/:pid",usermiddleware,submittedProblem)

module.exports=problemRouter; 
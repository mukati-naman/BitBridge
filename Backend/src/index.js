require("dotenv").config({ path:"../.env"});
const express=require('express')
const app=express();

const main=require("./config/db")
const cookieparser =require('cookie-parser')
const AuthRouter=require("./routes/userAuth")
const redisClient=require("./config/redis")
const problemRouter=require("./routes/problemCreator")
const submitRouter=require("./routes/submit")
const aiRouter = require("./routes/aiChat")
const videoRouter=require("./routes/videoCreator")

const cors=require('cors'); 

app.use(cors({
    origin:'http://localhost:5173',   
      methods: ["GET","POST","PUT","DELETE"]
}))

console.log(process.env);
console.log(process.env.DB_CONNECT_STRING);


app.use(express.json())   
app.use(cookieparser())  

app.use('/user',AuthRouter)  
app.use('/problem',problemRouter)
app.use('/submission',submitRouter) 
app.use('/ai',aiRouter)
app.use("/video",videoRouter);


const InitializeConn=async ()=>{

    try{
        await Promise.all([main(),redisClient.connect()])  
        console.log("DB connected")

        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number:"+ process.env.PORT)
        })
    }
    catch(err){
        console.log("Error"+err)
    }
}
InitializeConn();



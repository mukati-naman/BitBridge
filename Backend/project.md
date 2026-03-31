JUDGE0-->    help to compile codes of all the languages

Backend:                 
                             APIs   

userAuthentication          problems                submit                  DSA problems


                            Schemas

1.user:                 2.problems:                 3.Submit:     
first/name              title                        UserSolution
lastname                runtestcases                 problemId
email                   hiddentestcases              solution|accept|reject
role                    initial code withlang
password                real solution
solved problem          runoutputtestcases
                        hiddenoutputtestcases   
                        videoSolution



npm init -y
npm i express
npm i mongoose
connect mongoDB through connection string
Create a new DB by adding "name" after the link
npm i cookie-parser


Lec02

create routes and middleware in other file
create controller files for creating the functions for api requests
install validator 
use bcrypt lib (npm i bcrypt)
install jsonwebtoken, generate random secret key using ->
(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
)
import register, login and logout to userauth from userauth2
import Authrouter to index from userAuth 
create middleware to verify the token of the user 
install reddis(create a redis file in config folder)
keep the redis password in .env
validate the token 

kisi new intern ko admin bnane ke liye alag registration kraenge 
and first admin ka registration direct compass m hi krenge,uske baad hi koi new admin register ho paega
link: https://chatgpt.com/c/6909c29e-a840-8320-bdde-b04f4206c0e8




lECTURE 04

create schema of problem ,create route for problem and its auth
link of judge0: https://ce.judge0.com/

create a function to get id of language in Utils folder
get axios from rapid api link: 
  https://rapidapi.com/judge0-official/api/judge0-ce/playground/apiendpoint_489fe32c-7191-4db3-b337-77d0d3932807

  axios help in directly making json to direct js object so we don;t have to do response.json()
 APIKEYS link: https://chatgpt.com/c/690ae495-b380-8324-a9ff-13f9b135d827
 axios code will be written in submitbatch func
 submission krne ke baad judge0 humko token deta hai, fir hume yeh token judge0 ko deke code ka answer btane ke liye
 woh answer btata hai status id ke through
 agar Status id=3 (iska mtlb code shi hai), id=2 (processing), id=4 (wrong answer), id=5 (time limit exceeded).,......

 Tokens ko bhi hum batch m bhej skte hai

 To communicate with that API, you need a way to:
Send JSON data (POST request)
Handle responses easily (Promise based)
Catch errors properly
Wait for the result (async/await)
Axios does all of that cleanly and reliably.


//OUR SCHEMA example--

 


lec05

we will get the codes of judge0 utils from the judge0 site for create,get submissions 

lec06

GetAllProblem
localhost:3000/problem/getproblem?page=1&limit=10

lec07

Jab bhi data ko update krne bhejenge toh poora data bhejna padega dubara se
before creating the problem you must login
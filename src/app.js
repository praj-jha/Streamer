import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,  //that means from where the req is comming and in env we put it from everywhere
    credentials: true

}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit : "16kb"})) //checks for data coming from url that for spaces some add + or %20 or to encod that and give the right data
app.use(express.static("public"))
app.use(cookieParser())  //can access the cookies stored in users browser and can do something with them


import userRouter from './routes/user.routes.js'


app.use("/api/v1/users" , userRouter)
export {app}
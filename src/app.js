import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,  //that means from where the req is comming and in env we put it from everywhere
    credentials: true

}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit : "16kb"})) //checks for data coming from url in different forms like some has % or some has +
app.use(express.static("public"))
app.use(cookieParser())  //can access the cookies stored in users browser and can do something with them


import userRouter from './routes/user.routes.js'


app.use("/api/v1/users" , userRouter)
export {app}
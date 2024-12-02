import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";



dotenv.config()


try {
    connectDB();
        app.listen(process.env.PORT || 3000 , () =>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }
 catch (error) {
    console.log("MONGO db connection failed !!! ", err);
}
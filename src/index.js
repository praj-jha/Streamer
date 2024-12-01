import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";



dotenv.config()


try {
    console.log("heyy here");
    connectDB();
        app.listen(process.env.PORT || 8000 , () =>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    }
 catch (error) {
    console.log("MONGO db connection failed !!! ", err);
}
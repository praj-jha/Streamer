import mongoose from "mongoose";

import {DB_NAME} from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(connectionInstance);
           /*just to make sure which db i am connected to because in production there are many dbs..one for 
           actual production, development , testing so just to get an idea which host i am connected to thats why
           we do this connection.host*/
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
      
    } catch (error){
        console.log("MONGODB Connection Error" , error)
        process.exit(1)   //node is running on a process so exit from there 
    }
}

export default connectDB 
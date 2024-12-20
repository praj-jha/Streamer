import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId,  //one who is subscribing which will be a user itself
        ref : "User"
    }, 

    channel : {type : Schema.Types.ObjectId , ref : "User"}  //one to whom is subscriber is subscribing
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription" , subscriptionSchema)
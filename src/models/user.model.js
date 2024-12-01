import { urlencoded } from "express";
import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type : String,
            required: true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true  //if we wanna make it highly seearchable make the index = true
        }, 
        email : {
            type : String,
            required: true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type : String,
            required: true,
            trim : true,
            index:true
        },
        avatar : {
            type: String,
            required : true,

        },
        coverImage: {
            type : String,
        },

        watchHistory : [
            {
                type: Schema.Types.ObjectId,
                ref : "Video"
            }
        ],

        password: {
            type : String,
            required : [true , 'Password is required']
        },
        
        refreshToken :{
            type :String
        }

},{
    timestamps:true
}
)


userSchema.pre("save" , async function (next) {
    if(!this.isModified("password"))  //if password is modified then it hashes
     return next();  
    this.password = await bcrypt.hash(this.password , 10) 
    next()
} )

/* above pre in userschema so these are the hooks and plugins we defined for the User model and 
its syntax is this way that we apply all these on userSchema but that doesnt mean userSchema is a class
it indirectly applies on the instances of User model which is a class like const user = new User  */

/* Same goes in below cases also we are now defining some meothods which will be used by the instances of User model class like if its user then we can user.isPasswordCorrect(password) then this.password will point
to the user.password which is being sent by the user */

userSchema.methods.isPasswordCorrect =  async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , userSchema)
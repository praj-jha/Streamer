import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req ,_ , next) =>{
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer " , "");

    const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404 , "Invalid token")
    }

    req.user = user;
    next();

})
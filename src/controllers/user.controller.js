import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async function (userId) {
    try {
        const user = User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;  // we are storing this in our db because refresh token needs to stored
        await user.save({ validateBeforeSave: false })  //and here we saved the data and turned the validations off because we did not send any password or something

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrogn while generating access and refreshtoken ")
    }


}

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, username, password } = req.body

    //check if the data sent is empty 
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    /* here this $or: [] is a way to find alot different fields at once but we couldve passed
     it inside the findOne itself right ?
     
     
     and answer to above question is that below $or:[] will find either username or email and if
     any of the further logic executes but in findOne({ email, username}) this will look for both
     username and email to match with the sent data but what is usrname matches and email doesnt
     so there will be duplicate usernames */

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar field required")
    }
    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //if coverImage exists then take its url otherwise we set it empty
        email,
        password,  //here the password automatically gets hashed before being saved coz of the pre hook we added in the usermodel

    })

    /* This .select has a syntax in which we pass the thing which are not required so lets say
    fullname and username were also not req in the createdUser then we couldve written it like 
    .select("-password -fullname -username") */
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser =await User.findById(user._id).select("-password -refreshToken");

    //this needs to added coz after then the cookie can only be changed by the server side not by the user
    const options = {
        httpOnly: true,
        secure: true
    }


    // we sent cookie as well as json coz of users different functionality what if they wanna build some mobile apps so they cant have cookie in that case
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)   //key and value of acesssToken
        .cookie("refreshToken", refreshToken, options)  //key and value of refreshToken
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "You are logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(   //how to find the user and then what to update, that is given by $set (mongodb operator)
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true //get the new value stored in db now 
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("newRefreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed"))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid request")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id);
    const isPaswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPaswordCorrect) {
        throw new ApiError
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })   //this will trigger the pre save hook but apart from it all other validations are turned off

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))


})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched"))
})

const updateNameAndEmail = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname && !email) {
        return res.status(404).json(new ApiError(404, "Atleast one of fullname or email is required"));
    }
    const user = await User.findById(req.user._id)  //finding the user through its _id from auth middleware
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    //check if the user from this email already exists with any other user provided user sends the email to update
    if (email !== undefined) {
        const duplicateEmailEntry = await User.findOne({ email })
        if (duplicateEmailEntry && duplicateEmailEntry._id.toString() !== user._id.toString()) {
            return res.status(503).json(new ApiError(500, "Email is already in use by another user"));
        }
    }

    if (fullname !== undefined && fullname !== user.fullname) {
        user.fullname = fullname
    }
    if (email !== undefined && email !== user.email) {
        user.email = email
    }

    try {
        await user.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(new ApiResponse(200, { fullname, email }, "Your name and email are updated"))
    } catch (error) {
        return res.status(503).json(new ApiError(503, "Some error while updating the values"));
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateNameAndEmail
}
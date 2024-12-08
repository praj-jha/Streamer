import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description is required")
    }

    const videoFilePath = req.files?.video?.[0].path;  //by default it will only have 1 field as we are not uploading multiple video at once
    if (!videoFilePath) {
        throw new ApiError(400, "Send a video file to upload")
    }
    if(!req.files.thumbnail){
        throw new ApiError(400, "Send a thumbnail for the video")
    }
    const thumbnailPath = req.files.thumbnail[0].path;
    //uploading on cloudinary
    const videoUpload = await uploadonCloudinary(videoFilePath);  /*the response variable in cloudinary throws alot
    of things but we logged url as response.url*/

    const thumbnailUpload = await uploadonCloudinary(thumbnailPath);

    if (!videoUpload || !thumbnailUpload) {
        throw new ApiError(500, "Some error occured while uploading your video")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail : thumbnailUpload.url,
        duration : videoUpload.duration
    })

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Your video has been uploaded"))

})

export { uploadVideo }
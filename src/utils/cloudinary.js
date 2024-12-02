import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import path from "path"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary = async (localFilePath) => {
    try {
        if(localFilePath === ""){
            return null
        }
        const absoluteFilePath = path.resolve(localFilePath)
        
        if (!absoluteFilePath){
            console.log("No file path is given");
            return null
        }
        const response = await cloudinary.uploader.upload(absoluteFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded
        console.log("file has been uploaded", response.url);
        fs.unlinkSync(absoluteFilePath);
        return response
    }
    catch (error) {
        fs.unlinkSync(absoluteFilePath) //remove the locally saved temp file as the upload operation got failed
        return null;
    }
}

export { uploadonCloudinary }
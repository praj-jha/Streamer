import { upload } from "./multer.middleware.js";

export const videoUpload = upload.fields([

    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
])


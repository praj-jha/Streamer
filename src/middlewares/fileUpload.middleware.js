import { upload } from "./multer.middleware.js";

const fileUpload = upload.fields([

    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
])



export { fileUpload };
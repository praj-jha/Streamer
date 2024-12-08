import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";
import { videoUpload } from "../middlewares/videoUpload.middleware.js";

const router = Router();

router.route("/video").post( videoUpload, uploadVideo)

export default router;
import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { fileUpload } from "../middlewares/fileUpload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post( fileUpload,
    registerUser)

    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT,logoutUser);

export default router;
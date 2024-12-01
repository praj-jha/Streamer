import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { fileUpload } from "../middlewares/fileUpload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

/* router The benefit of router.route() is we dont have to mention all the post,get, put req coming to 
this route separately we can just add .post .get or .put at the end like this 
router.route("/user")
    .post(createUser)
    .get(getUser)
    .put(updateUser) 
    but below it is already mentioned that it is accepting register address so we cant like i 
    mentioned above.
    
    And then i sent the req to the controller which is registerUser and in between i checked
    for the file upload as per multer*/

const router = Router();
router.route("/register").post( fileUpload,
    registerUser)

    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT,logoutUser);
    router.route("/refresh-token").post(refreshAccessToken)

export default router;
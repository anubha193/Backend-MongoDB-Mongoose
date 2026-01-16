import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatarImage,
    updateCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const userRouter = Router();
import userAuthMiddleware from "../middleware/auth.middleware.js";

//for register any new user
userRouter.route("/register").post(upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerUser);

//for login any user
userRouter.route("/login").post(loginUser);

//for logout any user
userRouter.route("/logout").post(userAuthMiddleware, logoutUser);

//for refresh access token controller
userRouter.route("/refreshAccessToken").post(refreshAccessToken);

//to change user current password
userRouter.route("/logout").post(userAuthMiddleware, changePassword);

//for getting current user
userRouter.route("/logout").post(userAuthMiddleware, getCurrentUser);

//update current user details;
userRouter.route("/logout").post(userAuthMiddleware, updateUserDetails);

//update user's avatar image;
userRouter.route("/logout").post(userAuthMiddleware, upload.fields({ name: "avatar", maxCount: 1 }), updateAvatarImage);

//update user's cover image;
userRouter.route("/logout").post(userAuthMiddleware, upload.fields({ name: "coverImage", maxCount: 1 }), updateCoverImage);


export default userRouter;
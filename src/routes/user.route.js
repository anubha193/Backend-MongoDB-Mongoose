import { Router } from "express";
import { registerUser ,loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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
userRouter.route("/refreshAccessToken").post(refreshAccessToken)

export default userRouter;
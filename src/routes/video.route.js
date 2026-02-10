import { Router } from "express";
import { publishAVideo, publishAVideoLarger } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import userAuthMiddleware from "../middleware/auth.middleware.js";

const videoRoute = Router();

//router for uploading a video
videoRoute.route("/uploadVideo").post(userAuthMiddleware, upload.fields([
    {name : "videoFile", maxCount: 1},
    {name : "thumbnail", maxCount: 1}
]) ,publishAVideo);

videoRoute.route("/uploadVideoLarger").post(userAuthMiddleware, publishAVideoLarger);



export default videoRoute;
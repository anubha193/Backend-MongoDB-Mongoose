import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import Video from "../models/video.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';


//uploading a video 
const publishAVideo = asyncHandler(async (request, response, next) => {
    const { title, description, isPublished } = request?.body;
    const user = request?.user;
    if (!user)
        throw new ApiError(404, "user not logged in!!");
    const DBUser = await User.findOne(user._id);
    if (!DBUser)
        throw new ApiError(400, "DB user not found");
    const { videoFile, thumbnail } = request?.files;
    if (!title || !description)
        throw new ApiError(400, "title and description are required");
    console.log(videoFile)
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    const videoCloudinaryFile = await uploadOnCloudinary(videoFile[0].path);
    if (!videoCloudinaryFile)
        throw new ApiError(404, "Something went wrong while uploading video file on cloudinary");
    const thumbnailCloudinaryFile = await uploadOnCloudinary(thumbnail[0].path);
    if (!thumbnailCloudinaryFile)
        throw new ApiError(400, "Something went wrong while uploading thumbnail file on cloudinary");
    const DBVideoData = await Video.create({
        videoFile: videoCloudinaryFile?.url || undefined,
        thumbnail: thumbnailCloudinaryFile?.url || undefined,
        title,
        description,
        isPublished: isPublished || false,
        
    });



    // TODO: get video, upload to cloudinary, create video
})

export { publishAVideo };

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
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    const videoCloudinaryFile = await uploadOnCloudinary(videoFile[0].path);
    console.log(videoCloudinaryFile);
    if (!videoCloudinaryFile)
        throw new ApiError(404, "Something went wrong while uploading video file on cloudinary");
    if (videoCloudinaryFile.resource_type != "video") {
        throw new ApiError(400, "Video is required to upload!!")
    }
    const duration = Math.floor(videoCloudinaryFile.duration);
    const thumbnailCloudinaryFile = await uploadOnCloudinary(thumbnail[0].path);
    if (!thumbnailCloudinaryFile)
        throw new ApiError(400, "Something went wrong while uploading thumbnail file on cloudinary");
    const DBVideoData = await Video.create({
        videoFile: videoCloudinaryFile?.url || undefined,
        thumbnail: thumbnailCloudinaryFile?.url || undefined,
        title,
        description,
        isPublished: isPublished || false,
        owner: DBUser._id,
        duration,
    });
    if (!DBVideoData)
        throw new ApiError(404, "Something went wrong while uploading data with DB!!");
    // const videoData = Video.findOne(DBVideoData._id)
    // .select("")
    return response.status(200).json(
        new ApiResponse(200, DBVideoData, "video uploaded successfully")
    );



    // TODO: get video, upload to cloudinary, create video
});

//public video with larger size
const publishAVideoLarger = asyncHandler(async (request, response, next) => {
    const { title, description, isPublished, video, thumbnail } = request.body;

    if (!request.user) throw new ApiError(401, "Unauthorized");

    if (!title || !description) {
        throw new ApiError(400, "title and description are required");
    }

    if (!video?.public_id || !video?.playback_url) {
        throw new ApiError(400, "Cloudinary video data missing");
    }

    if (!thumbnail?.secure_url) {
        throw new ApiError(400, "Cloudinary thumbnail missing");
    }

    const duration = video.duration ? Math.floor(video.duration) : 0;

    const savedVideo = await Video.create({
        owner: request.user._id,
        title,
        description,
        isPublished: isPublished ?? false,

        cloudinaryPublicId: video.public_id,
        videoFile: video.secure_url,
        streamUrl: video.playback_url,

        thumbnail: thumbnail.secure_url,
        duration,
    });

    return response.status(201).json(
        new ApiResponse(201, savedVideo, "Video saved successfully")
    );
})

//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


//get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id 
})


export {
    publishAVideo,
    getAllVideos,
    getVideoById,
    publishAVideoLarger
};

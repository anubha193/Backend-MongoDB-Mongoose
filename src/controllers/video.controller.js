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
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;

  // Professional: enforce max limit
  if (limit > 50) limit = 50;

  // validate userId if provided
  if (userId && !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  // allow only safe sort fields
  const allowedSortFields = ["createdAt", "views", "duration", "title"];
  if (!sortBy || !allowedSortFields.includes(sortBy)) {
    sortBy = "createdAt";
  }

  // allow only asc/desc
  sortType = (sortType || "desc").toLowerCase();
  const sortOrder = sortType === "asc" ? 1 : -1;

  // clean query
  query = query?.trim();
  if (query && query.length > 100) query = query.slice(0, 100);

  // -----------------------------
  // 2) Build match filter
  // -----------------------------
  const match = {
    isPublished: true,
  };

  // filter by channel (user)
  if (userId) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  // search by query
  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // -----------------------------
  // 3) Aggregation pipeline
  // -----------------------------
  const pipeline = [
    { $match: match },

    { $sort: { [sortBy]: sortOrder } },

    // Join owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    // owner array -> single object
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },

    // Return only fields needed for feed
    {
      $project: {
        videoFile: 1,
        streamUrl: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        owner: 1,
      },
    },
  ];

  const aggregate = Video.aggregate(pipeline);

  // -----------------------------
  // 4) Pagination using plugin
  // -----------------------------
  const options = {
    page,
    limit,
  };

  const result = await Video.aggregatePaginate(aggregate, options);

  // -----------------------------
  // 5) Response
  // -----------------------------
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
          nextPage: result.nextPage,
          prevPage: result.prevPage,
        },
      },
      "Videos fetched successfully"
    )
  );
});


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
